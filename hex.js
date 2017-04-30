var c = document.getElementById('c');
var c2 = c.getContext('2d');

c.height = window.innerHeight-15;
c.width  = window.innerWidth-15;

c2.shadowBlur = 5;
c2.globalAlpha = .6;
//c2.shadowColor = 'rgb(0, 0, 0)';

function randInt(start=1, end=100) {
	return Math.floor((end - start) * Math.random()) + start;
}

function drawHex(x, y, size = 100, color = 0) {
	if (color == 0) {
  	var colorR = (randInt(256)).toString(16);
    var colorG = (randInt(256)).toString(16);
    var colorB = (randInt(256)).toString(16);
    color = '#' + colorR + colorG + colorB; 
    c2.shadowColor = color;
  }
  c2.fillStyle = color;
  c2.moveTo(x, y);
  c2.beginPath();
  c2.lineTo(x+size, y);
  c2.lineTo(x+size+size*Math.cos(Math.PI/3), y+size*Math.sin(Math.PI/3));
  c2.lineTo(x+size, y+2*size*Math.sin(Math.PI/3));
  c2.lineTo(x, y+2*size*Math.sin(Math.PI/3));
  c2.lineTo(x-size*Math.cos(Math.PI/3), y+size*Math.sin(Math.PI/3));
  c2.lineTo(x, y);
  c2.closePath();
  c2.fill();
}

function stringHex(x=0, y=0, size = 100) {
	var c = document.getElementById('c'),
  		hexAngle = Math.PI/3,
      hexCos = Math.cos(hexAngle),
      hexSin = Math.cos(hexAngle),
      scaledHexCos = size * hexCos,
      scaledHexSin = size * hexSin,
      bufferX = size / 5,
      bufferY = size / 2.5,
      nextHexUpProb = .5,
      nextHexUpLimit = .2,
			nextHexProbStack = .1,
      nextHex;
  
  for(i=0; x < c.width; ++i) {
  
    setTimeout(function (a, b, c) {
    	return function() {drawHex(a, b, c);};
		}(x, y, size), i*500);
    
    if (y < 0) {
      nextHex = -1;
    }
    else if(y > c.height) {
      nextHex = 1;
    }
    else if(Math.random() < nextHexUpProb) {
      nextHex = 1;
    }
    else {
      nextHex = -1;
    }
    
		if (nextHex == 1 && nextHexUpProb < (1-nextHexUpLimit)) {
    	nextHexUpProb += ( (1 - nextHexUpProb) * nextHexProbStack);
    }
    else if (nextHexUpProb < nextHexUpLimit) {
    	nextHexUpProb -= (nextHexUpProb * nextHexProbStack);
    }
  
	  x = x + size + scaledHexCos + bufferX;
  	y = y + nextHex * scaledHexSin + nextHex * bufferY;
  }
  
  //drawHex(x, y, size);
}

s = 15
h = randInt(c.height)

stringHex(0, h, s);
stringHex(0, h, s);
stringHex(0, h, s);
