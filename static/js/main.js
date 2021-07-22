$(document).ready(function(){
  let namespace = "/test";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#canvasElement");
  let logSend = document.querySelector("#log-send");
  let logReceive = document.querySelector("#log-receive");
  let ctx = canvas.getContext('2d');
  photo = document.getElementById('photo');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendSnapshot() {
    if (!localMediaStream) {
      return;
    }

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 300, 150);

    let dataURL = canvas.toDataURL('image/jpeg');
    socket.emit('input image', dataURL);

    socket.emit('output image')
    var rndValue;
    rndValue = Math.floor((Math.random() * 50));
    logSend.text(rndValue + '-send   '+ dataURL);

    var img = new Image();
    socket.on('out-image-event',function(data){
        var rndValue;
        rndValue = Math.floor((Math.random() * 50));

        img.src = dataURL//data.image_data
        logReceive.text(rndValue + '-receive   '+ data.image_data);
        photo.setAttribute('src', data.image_data);

    });


  }

  socket.on('connect', function() {
    console.log('Connected!');
  });

  var constraints = {
    video: {
      width: { min: 640 },
      height: { min: 480 }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    localMediaStream = stream;

    setInterval(function () {
      sendSnapshot();
    }, 50);
  }).catch(function(error) {
    console.log(error);
  });
});

