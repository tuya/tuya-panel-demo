export default function video(url, poster = 'https://segmentfault.com/img/bVX8GW?w=640&h=364') {
  return `<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<script type="text/javascript">
  function onResponse(type, result = 'success') {
    window.postMessage(JSON.stringify({
      type,
      result,
        }));
      }
  const stop = () => {
    var videoEle = document.querySelector("video")
    onResponse('stop', 'success');
    videoEle.paused();
  }
  const play = () => {
    var videoEle = document.querySelector("video")
    onResponse('play', 'success');
    videoEle.play();
  }
  function hide() {
    onResponse('fullScreen', 'success');
  }
  document.addEventListener('message', e => {
    e.data === 'play' && play();
    e.data === 'stop' && stop();
  })
</script>
<style>
  body{
    background: #000;
    color: #333;
    font-size: 12px;
    margin-top: 5px;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent
  }
  </style>

<body>
  <div class="container">
    <video
      class="video"
      width="100%"
      height="85%"
      controls="controls"
      poster=${poster}
      webkit-playsinline="true"
      style="object-fit: cover"
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
    >
      <source src="${url}" type="video/mp4">
    </video>
  </div>
</body>

</html>`;
}
