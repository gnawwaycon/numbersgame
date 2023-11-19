function init(){
    var s = new CanvasState(document.getElementById('gameArea'));
    s.addShape(20,520,s.numGen(), false)
    s.addShape(150,520,s.numGen(),false)
    s.addShape(350,520,s.numGen(),true)
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
  // img = new Image();
  // sprite = "./img/sprite.png"
  // ctx.drawImage(sprites,srcX,srcY,srcW,srcH,destX,destY,destW,destH);

  // // ctx.drawImage(sprite,0,0)
  // img.src = "./img/" + this.num + ".jpg";
  // ctx.drawImage(img, this.x, this.y);
  sprite = new Image();
  sprite.src = "./img/sprite.png"
  x = (this.num + 4)*120
  ctx.drawImage(sprite,x,0,120,120,this.x,this.y,120,120);
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
  this.dragging = false;
  this.selection = null;  //number being moved
  this.dragoffx = 0;
  this.dragoffy = 0;
  this.mx = 0;
  this.my = 0;


  var myState = this;


  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my) && shapes[i].draggable) {
        var mySel = shapes[i];


        myState.dragoffx = mx - mySel.x;
        myState.dragoffy = my - mySel.y;
        myState.mx = mx;
        myState.my = my;
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
    var mouse = myState.getMouse(e);
    if(myState.didMove(mouse.x, mouse.y)){
      if(myState.validateMove(mouse.x,mouse.y) && myState.dragging){ //if dragging is false then the user was not dragging a cube
        myState.addBlock();
        myState.mx = mouse.x;
        myState.my = mouse.y;
        myState.checkCollapse();
        myState.draw();
        myState.valid = false;
      }
    }
    myState.dragging = false;
  }, true);


  //copy pasta from bard on how to implement touch screen functionality
  function handleTouchStart(e) {
  // Extract touch coordinates
  var touch = e.touches[0];
  var mx = touch.pageX;
  var my = touch.pageY;

  // Check for interactions with shapes
  var shapes = myState.shapes;
  var l = shapes.length;
  for (var i = l - 1; i >= 0; i--) {
    if (shapes[i].contains(mx, my) && shapes[i].draggable) {
      // Handle dragging
      myState.dragoffx = mx - shapes[i].x;
      myState.dragoffy = my - shapes[i].y;
      myState.mx = mx;
      myState.my = my;
      myState.dragging = true;
      myState.selection = shapes[i];
      myState.valid = false;
      return;
    }
  }

  if (myState.selection) {
    myState.selection = null;
    myState.valid = false;
  }
}

function handleTouchMove(e) {
  if (myState.dragging) {
    // Update shape position based on touch coordinates
    var touch = e.touches[0];
    var mx = touch.pageX;
    var my = touch.pageY;
    myState.selection.x = mx - myState.dragoffx;
    myState.selection.y = my - myState.dragoffy;
    myState.valid = false;
  }
}

function handleTouchEnd(e) {
  // Update game state based on touch end
  var touch = e.changedTouches[0];
  var mx = touch.pageX;
  var my = touch.pageY;

  if (myState.didMove(mx, my)) {
    // Check for valid move and add block
    if (myState.validateMove(mx, my) && myState.dragging) {
      myState.addBlock();
      myState.mx = mx;
      myState.my = my;
      myState.checkCollapse();
      myState.draw();
      myState.valid = false;
    }
  }
  myState.dragging = false;
}

  canvas.addEventListener('touchstart', function(e) { handleTouchStart(e); }, false);

canvas.addEventListener('touchmove', function(e) { handleTouchMove(e); }, true);

canvas.addEventListener('touchend', function(e) { handleTouchEnd(e); }, true);

  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.didMove = function(x,y) {
  if(this.mx == x && this.my == y){
    return false;
  }
  return true;
}

CanvasState.prototype.validateMove = function(x,y) {
  this.selection.x = Math.round((x - this.dragoffx)/125) * 125 + 3;
  this.selection.y = Math.round((y - this.dragoffy)/125) * 125 + 4;
  // this.mx = Math.round((x - this.dragoffx)/125) * 125 + 2;
  // this.my = Math.round((y - this.dragoffy)/125) * 125 + 2;
  // for(var i = 2; i < this.shapes.length; i++){
    // if(this.shapes[i] !==){

    // }
  // }
  // if(this.mx == x && this.my == y){
  //   return true;
  // }
  return true;
}

CanvasState.prototype.addShape = function(x,y,n,draggable) {
  shape = new Shape(x,y,120,120,n,draggable)
  this.shapes.push(shape);
  shape.draw(this.ctx);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.addBlock = function() { //shift blocks over one or create one
  this.shapes.forEach(function(shape, index){
    if (shape.x == 20 && shape.y == 520){
      shape.x = 150;
    } else if (shape.x == 150 && shape.y == 520) {
      shape.x = 350;
      shape.draggable = true;
    } else {
      shape.draggable = false;
    }
  })
  this.addShape(20,520,this.numGen(), false)
}

CanvasState.prototype.checkCollapse = function() {
  var mx = this.mx;
  var my = this.my;
  var shapes = this.shapes;


  var index = 0;
  var l = shapes.length;
  var increment = false;
  var list = [];
  for (var i = l-1; i >= 0; i--) {
    if(shapes[i].contains(mx, my)) {
      index = i;
      switch(shapes[index].num) {
        case -4:
            collapseLeft();
            break;
        case -3:
            collapseUp();
            break;
        case -2:
            collapseRight();
            break;
        case -1:
            collapseDown();
            break;
        case 0:
            break;
        default:
            collapseNum();
      }
    }
  }

  function collapseDown() {
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].y !== 520) {
        if(shapes[i].contains(mx, my) ||
           shapes[i].contains(mx, my+120) ||
           shapes[i].contains(mx, my+240) ||
           shapes[i].contains(mx, my+360)) {
             list.push(i);
           }
      }
    }
  }
  function collapseRight() {
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].y !== 520) {
        if(shapes[i].contains(mx, my) ||
           shapes[i].contains(mx+120, my) ||
           shapes[i].contains(mx+240, my) ||
           shapes[i].contains(mx+360, my)) {
             list.push(i);
           }
      }
    }
  }
  function collapseUp() {

    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].y !== 520) {
        if(shapes[i].contains(mx, my) ||
           shapes[i].contains(mx, my-120) ||
           shapes[i].contains(mx, my-240) ||
           shapes[i].contains(mx, my-360)) {
             list.push(i);
           }
      }
    }
  }
  function collapseLeft() {

    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].y !== 520) {
        if(shapes[i].contains(mx, my) ||
           shapes[i].contains(mx-120, my) ||
           shapes[i].contains(mx-240, my) ||
           shapes[i].contains(mx-360, my)) {
             list.push(i);
           }
      }
    }
  }

  function collapseNum() {
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].y !== 520) {
        if(shapes[i].contains(mx-120, my) || shapes[i].contains(mx+120, my) ||
           shapes[i].contains(mx, my+120) || shapes[i].contains(mx, my-120) ||
           shapes[i].contains(mx-120, my+120) || shapes[i].contains(mx+120, my+120) ||
           shapes[i].contains(mx-120, my-120) || shapes[i].contains(mx+120, my-120)) {
             if(shapes[i].num == shapes[index].num){
               increment = true;
               list.push(i);
             }
           }
      }
    }
  }

  if(increment){
    shapes[index].num++;
  }

  list.sort(function(a,b){ return a - b; });
  for (var i = list.length-1; i >= 0; i--) {
    shapes.splice(list[i],1);
    if(increment){
      this.checkCollapse();
    }
  }
  this.draw();
}

CanvasState.prototype.draw = function() {

  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();


    // for (var i = 0; i < 4; i++) {
    //   ctx.strokeStyle="#000000";
    //   ctx.beginPath();
    //   ctx.moveTo(125 + i * 125, 0);
    //   ctx.lineTo(125 + i * 125, 500);
    //   ctx.stroke();
    //   ctx.beginPath();
    //   ctx.moveTo(0, 125 + i * 125);
    //   ctx.lineTo(500, 125 + i * 125);
    //   ctx.stroke();
    // }

    var l = shapes.length;
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];

      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
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
    var data = [[-1, 2],
                [-2, 2],
                [-3, 2],
                [-4, 2],
                [0, 5],
                [1, 20],
                [2, 20],
                [3, 10],
                [4, 3]]
    var wl = new WeightedList(data);
  } else if(max <= 7) {
    var data = [[-1, 3],
                [-2, 3],
                [-3, 3],
                [-4, 3],
                [0, 10],
                [1, 5],
                [2, 5],
                [3, 10],
                [4, 15],
                [5, 20],
                [6, 15],
                [7, 7]];
    var wl = new WeightedList(data);
  } else {
    var data = [[-1, 3],
                [-2, 3],
                [-3, 3],
                [-4, 3],
                [0, 10],
                [1, 3],
                [2, 3],
                [3, 3],
                [4, 20],
                [5, 20],
                [6, 20],
                [7, 10],
                [8, 7],
                [9, 3]];
    var wl = new WeightedList(data);
  }




  return Number(wl.peek()[0]);
}
