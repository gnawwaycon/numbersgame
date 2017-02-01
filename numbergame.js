function init(){
    var s = new CanvasState(document.getElementById('gameArea'));
    s.addShape(20,520,s.numGen(), true)
    s.addShape(150,520,s.numGen(),false)
    s.addShape(280,520,s.numGen(),true)
}


function Shape(x, y, w, h, num, draggable) {
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 60;
  this.h = h || 60;
  this.num = num || 1;
  this.draggable = draggable || false;
}


Shape.prototype.draw = function(ctx) {
  img = new Image();
  img.src = "./img/" + this.num + ".jpg";
  ctx.drawImage(img, this.x, this.y);
}


Shape.prototype.contains = function(mx, my) {


  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {


  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');


  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }


  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;



  this.valid = false;
  this.shapes = [];
  this.bottom = [];
  this.dragging = false;
  this.selection = null;
  this.dragoffx = 0;
  this.dragoffy = 0;








  var myState = this;


  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    console.log(shapes)
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my) && shapes[i].draggable) {
        var mySel = shapes[i];


        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.dragging = true;
        myState.selection = mySel;
        myState.valid = false;
        return;
      }
    }


    if (myState.selection) {
      myState.selection = null;
      myState.valid = false;
    }
  }, true);
  canvas.addEventListener('mousemove', function(e) {
    if (myState.dragging){
      var mouse = myState.getMouse(e);


      myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;
      myState.valid = false;
    }
  }, true);
  canvas.addEventListener('mouseup', function(e) {
    myState.dragging = false;
    console.log("hererere");/////// function call
  }, true);

  // canvas.addEventListener('dblclick', function(e) {
  //   var mouse = myState.getMouse(e);
  //   myState.addShape(new Shape(mouse.x - 60, mouse.y - 60, 120, 120, 'rgba(0,255,0,.6)'));
  // }, true);



  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

/////////
////////
////////
////////
CanvasState.prototype.addShape = function(x,y,n,draggable) {
  shape = new Shape(x,y,120,120,n,draggable)
  this.shapes.push(shape);
  shape.draw(this.ctx);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.addblock = function() {
  console.log(this.shapes)
}

CanvasState.prototype.checkCollapse = function() {

}



CanvasState.prototype.draw = function() {

  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();


    for (var i = 0; i < 4; i++) {
      ctx.strokeStyle="#000000";
      ctx.beginPath();
      ctx.moveTo(125 + i * 125, 0);
      ctx.lineTo(125 + i * 125, 500);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 125 + i * 125);
      ctx.lineTo(500, 125 + i * 125);
      ctx.stroke();
    }

    var l = shapes.length;
    console.log(l)
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];

      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }



    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      var img = new Image();
      img.onload = function(){
          ctx.drawImage(this, mySel.x,mySel.y);
      };
      img.src = "./img/" + mySel.num + ".jpg";

    }



    this.valid = true;
  }
}




CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;


  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }



  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;


  return {x: mx, y: my};
}

CanvasState.prototype.numGen = function() {
  var max = 1;
  for (var i = 0; i < this.shapes.length; i++) {
    if(this.shapes[i].num > max) {
      max = this.shapes[i].num;
    }
  }
  if(max <= 4) {
    var data = [[-1, 1],
                [-2, 1],
                [-3, 1],
                [-4, 1],
                [0, 2],
                [1, 10],
                [2, 100],
                [3, 8],
                [4, 5]]
    var wl = new WeightedList(data);
  } else if(max <= 7) {
    var data = [[-1, 1],
                [-2, 1],
                [-3, 1],
                [-4, 1],
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
                [5, 1],
                [6, 1],
                [7, 1],
                [8, 1],
                [9, 1]];
    var wl = new WeightedList(data);
  } else {
    var data = [[-1, 1],
                [-2, 1],
                [-3, 1],
                [-4, 1],
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
                [5, 1],
                [6, 1],
                [7, 1],
                [8, 1],
                [9, 1]];
    var wl = new WeightedList(data);
  }




  return wl.peek();
}
