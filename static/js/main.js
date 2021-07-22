$(document).ready(function(){
  let namespace = "/test";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#canvasElement");
  let ctx = canvas.getContext('2d');
  photo = document.getElementById('photo');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendSnapshot() {
   var rndValue;
    rndValue = Math.floor((Math.random() * 50));
      $('#logSend').text('Sending');
    if (!localMediaStream) {
      return;
    }

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 300, 150);

    let dataURL = canvas.toDataURL('image/jpeg');
    socket.emit('input image', dataURL);

    socket.emit('output image')
//    logSend.append('<p>'+rndValue + '-send   '+ dataURL+'</p>');
    var img = new Image();
    socket.on('out-image-event',function(data){
        $('#logReceive').text('Receive');
        var rndValue;
        rndValue = Math.floor((Math.random() * 50));

        img.src = dataURL//data.image_data
//        logReceive.append('<p>'+rndValue + '-receive   '+ data.image_data+'</p>');
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

