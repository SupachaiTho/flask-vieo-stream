$(document).ready(function(){
  let namespace = "/test";
  let video = document.querySelector("#videoElement");
  let canvas = document.querySelector("#canvasElement");
  let ctx = canvas.getContext('2d');
  photo = document.getElementById('photo');
  var localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
   $('#logSend').text('Start Sending');
   $('#logReceive').text('Start Receiving');
  function sendSnapshot() {
   var rndValue;
    rndValue = Math.floor((Math.random() * 50));
    if (!localMediaStream) {
      return;
    }

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 300, 150);

    let dataURL = canvas.toDataURL('image/jpeg');
     $('#logSend').text('Sending  '+rndValue+', '+dataURL.substr(dataURL.length - 10));
    socket.emit('input image', dataURL);

    socket.emit('output image')
//    logSend.append('<p>'+rndValue + '-send   '+ dataURL+'</p>');
    var img = new Image();
    socket.on('out-image-event',function(data){
        var rndValue2;
        rndValue2 = Math.floor((Math.random() * 50));
        $('#logReceive').text('Receiving2 '+rndValue2+','+data.image_data.substr(data.image_data.length - 10));
        img.src = dataURL
        photo.src = data.image_data;
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
    }, 250);
  }).catch(function(error) {
    console.log(error);
  });
});

