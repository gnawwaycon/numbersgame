function draw(){
  var canvas = document.getElementById('tutorial');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
  }
  for (var i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(125 + i * 125, 0);
    ctx.lineTo(125 + i * 125, 500);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 125 + i * 125);
    ctx.lineTo(500, 125 + i * 125);
    ctx.stroke();
  }
}
