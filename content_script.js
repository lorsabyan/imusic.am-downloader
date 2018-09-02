(async () => {

  let elm = document.querySelector('li.is_played');
  
  if (elm) {
    
    current_track_id = elm.dataset.imItemId;

    if (current_track_id) {
      
      let track = await fetch('https://imusic.am/dyn/queue/do_get_track', {
        method: 'POST',
        headers: new Headers({
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          imtoken: localStorage._im_token
        }),
        body: new URLSearchParams({
          "itemId": current_track_id
        })
      }).then(res => res.json());

      let filename = `${track.track_num.toString().padStart(2, '0')}. ${track.title}.mp3`;
      let url = `https://stream.imusic.am/${Date.now()}/${track.hash}/${filename}`;
      let artists = track.artists.main.map(p => p.artist);
      
      if (track.artists.featuring) {
        artists.concat(track.artists.featuring.map(p => p.artist));
      }

      let id3Writer = new ID3Writer(new ArrayBuffer(0));

      id3Writer
        .setFrame('TIT2', track.title)
        .setFrame('TPE1', artists)
        .setFrame('TALB', track.album)
        .setFrame('COMM', {
          description: '',
          text: ''
        })
        .setFrame('TRCK', track.track_num);

      id3Writer.addTag();

      let id3Tag = new Uint8Array(id3Writer.arrayBuffer);

      fetch(url, {
        method: "GET",
        headers: {
          "Range": "bytes=0-"
        },
      }).then(res => {
        let fileStream = streamSaver.createWriteStream(filename);
        let writer = fileStream.getWriter();
        let reader = res.body.getReader();
        let pump = () => reader.read()
          .then(({ value, done }) => done
            ? writer.close()
            : writer.write(value).then(pump)
          );

        writer.write(id3Tag).then(() => pump());
      });

    }
  }

})();