(function () {
  function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }
    return array;
  }

  function empty(id) {
    const wrap = document.getElementById(id);
    while(wrap.firstChild) wrap.removeChild(wrap.firstChild);
    return wrap;
  }

  function addChild(cont, el) {
    const child = document.createElement(el);
    cont.appendChild(child);
    return child;
  }

  const VIDEO_CONTAINER = 'video-container';
  const VIDEO_ID = 'the-video';
  let player = null;
  let currentIndex = 0;
  let list = null;
  let timer = null;

  function setupVideo() {
    const container = empty(VIDEO_CONTAINER);
    const video = addChild(container, 'video');
    video.id = VIDEO_ID;
    const source = addChild(video, 'source');
    source.type = 'video/mp4';
    player = videojs(VIDEO_ID, {
      controls: false,
      autoplay: false,
      fluid: true,
      muted: false,
    });
  }

  function shuffleVideos() {
    return shuffle(VIDEOS.slice(0));
  }

  function nextVideo() {
    currentIndex++;
    if (currentIndex >= list.length) {
      currentIndex = 0;
      list = shuffleVideos();
    }
    startVideo(list[currentIndex]);
  }

  function getYear(filename) {
    const yearMatch = filename.match(/\((\d{4})\)/);
    if (yearMatch) {
      return yearMatch[1];
    }
    return '';
  }

  function getMetadata(filename) {
    if (METADATA[filename]) {
      return METADATA[filename];
    }
    const match = filename.match(/[^_]+_(.*) - ([^(]+).*\.mp4/);
    if (match && match.length > 1) {
      return {
        artist: match[1].trim(),
        track: match[2].trim(),
        year: getYear(filename),
        album: match[2].trim(),
      }
    }
    return {
      artist: '',
      track: filename,
      year: '',
      album: '',
    };
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    el.textContent = text;
  }

  function setClass(id, className) {
    const el = document.getElementById(id);
    el.classList.add(className);
  }
  function removeClass(id, className) {
    const el = document.getElementById(id);
    el.classList.remove(className);
  }

  function showMetadata() {
    setClass('title', 'visible');
    setClass('album', 'visible');
    setClass('year', 'visible');

    setClass('title', 'slide-in');
    setTimeout(() => {setClass('album', 'slide-in')}, 1000);
    setTimeout(() => {setClass('year', 'slide-in')}, 2000);

    setTimeout(() => {
      removeClass('title', 'slide-in');
      setTimeout(() => {removeClass('album', 'slide-in')}, 1000);
      setTimeout(() => {removeClass('year', 'slide-in')}, 2000);

      setTimeout(() => {
        removeClass('title', 'visible');
        removeClass('album', 'visible');
        removeClass('year', 'visible');
      }, 5000);

    }, 5000);

  }

  function setMetadata(metadata) {
    setText('title', '“' + metadata.track + '”');
    setText('album', metadata.artist);
    setText('year', metadata.album + ' (' + metadata.year + ')');
  }

  const METADATA_OFFSET = 10;

  const DEBUG_METADATA = false;

  function startVideo(url) {
    console.log('startVideo', url);
    const metadata = getMetadata(url);
    setMetadata(metadata);
    let showIn = false;
    let showOut = false;
    player.src('videos/' + url);
    player.ready(function () {
      player.play();
      timer = setInterval(function () {
        const rem = player.remainingTime();
        if (rem < 2) {
          player.pause();
          clearInterval(timer);
          nextVideo();
        }
        if (player.currentTime() > METADATA_OFFSET && !showIn) {
          showIn = true;
          showMetadata();
        }
        if ((rem <= (METADATA_OFFSET + 5) || (DEBUG_METADATA && Math.round(rem) % 10 === 0)) && !showOut) {
          showOut = DEBUG_METADATA ? false : true;
          showMetadata();
        }
      }, 1000);
    });
  }

  function main() {
    setupVideo();
    list = shuffleVideos();
    currentIndex = 0;
    startVideo(list[currentIndex]);
  }

  function onClick() {
    main();
    document.removeEventListener('click', onClick);
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', onClick);
  });
})();
