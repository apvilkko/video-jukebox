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

  function startVideo(url) {
    console.log('startVideo', url);
    player.src('videos/' + url);
    player.ready(function () {
      player.play();
      timer = setInterval(function () {
        if (player.remainingTime() < 2) {
          player.pause();
          clearInterval(timer);
          nextVideo();
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

  document.addEventListener('DOMContentLoaded', function() {
    main();
  });
})();
