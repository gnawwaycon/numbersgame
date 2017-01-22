function draw(){
  var canvas = document.getElementById('tutorial');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
  }
  for (var i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(125 + i * 125, 5);
    ctx.lineTo(125 + i * 125, 495);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, 125 + i * 125);
    ctx.lineTo(495, 125 + i * 125);
    ctx.stroke();
  }
}
