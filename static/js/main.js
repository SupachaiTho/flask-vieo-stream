$(document).ready(function(){
  let namespace = "/test";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#canvasElement");
  let logSend = document.querySelector("#logSend");
  let logReceive = document.querySelector("#logReceive");
  let ctx = canvas.getContext('2d');
  photo = document.getElementById('photo');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  function sendSnapshot() {
    if (!localMediaStream) {
    console.log('no localMediaStream');
      return;
    }

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 300, 150);

    let dataURL = canvas.toDataURL('image/jpeg');
    socket.emit('input image', dataURL);

    socket.emit('output image')
    var rndValue;
    rndValue = Math.floor((Math.random() * 50));
//    logSend.append('<p>'+rndValue + '-send   '+ dataURL+'</p>');
 logSend.append(dataURL);
 alert(dataURL);
    var img = new Image();
    socket.on('out-image-event',function(data){
        var rndValue;
        rndValue = Math.floor((Math.random() * 50));

        img.src = dataURL//data.image_data
//        logReceive.append('<p>'+rndValue + '-receive   '+ data.image_data+'</p>');
        logReceive.append(rndValue);
         alert(rndValue+'  '+ data.image_data);
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
    alert('send');
      sendSnapshot();
    }, 50);
  }).catch(function(error) {
    console.log(error);
  });
});

