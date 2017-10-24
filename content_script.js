document.querySelectorAll(".track-element.f_tracks").forEach(function(track) {
  let title = track.querySelector(".track-title-element");
  let file = JSON.parse(decodeURIComponent(track.getAttribute("data-im-track-data")));
  
  let album_year = '';
  
  let album_section = document.querySelector(".album-info .media-content-year span");
  
  if(album_section !== null) {
    album_year = album_section.innerText.trim().substring(1, 4);
  }
  
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://imusic.am/dyn/queue/do_get_track', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
          let a = JSON.parse(xhr.response);
          let filename = `${title.innerText.trim()}.${file.type}`;
          let url = `${a.server_host}/${a.song_session_id}/${a.hash}/${a.stream_name}`;
          let icon = '<i class="fa fa-cloud-download" aria-hidden="true"></i>';
          
          const id3Writer = new ID3Writer(new ArrayBuffer(0));
          id3Writer.setFrame('TIT2', file.title)
                   .setFrame('TPE1', file.artists.featuring.map(p => p.artist)
                             .concat(file.artists.main.map(p => p.artist)))
                   .setFrame('TALB', file.album_name)
                   .setFrame('TYER', album_year)
                   .setFrame('TRCK', file.track_num);
          
          id3Writer.addTag();
          const id3Tag = new Uint8Array(id3Writer.arrayBuffer);
          
          link = document.createElement('a');
          link.classList.add("download");
          link.style = "padding-right:10px;";
          link.innerHTML = icon;
          link.onclick = function() {
            fetch(url).then(res => {
            	const fileStream = streamSaver.createWriteStream(filename);
            	const writer = fileStream.getWriter();
            	const reader = res.body.getReader();
            	const pump = () => reader.read()
            		.then(({ value, done }) => done
            			? writer.close()
            			: writer.write(value).then(pump)
            		);
            
            	writer.write(id3Tag).then(() => pump());
            });
          };
          
          let oldLink = title.querySelector(".download");
          if(oldLink !== null) {
            title.removeChild(oldLink);
          }
          
          title.prepend(link);
      }
  };
  
  xhr.send(`itemId=${file.id}`);
});