var c = document.getElementById('bg');
var ctx = c.getContext('2d');

c.height = window.innerHeight;
c.width  = window.innerWidth;

var hexAngle = Math.PI / 3,
    hexCos = Math.cos(hexAngle),
    hexSin = Math.sin(hexAngle);

function randInt(start=1, end=100) {
    return Math.floor((end - start) * Math.random()) + start;
}

/** 
 * generates and returns an array of colors that (hopefully) look good together
 */
function randColorSeq(numColors, colorSeed=2*Math.PI*Math.random()) {
    let colors = [];

    for(var i=0; i<numColors; ++i) {
	colorSeed += 2 * Math.PI / 3;
	colors.push('#' + (Math.cos(colorSeed) * 127 + 128 << 16
			   | Math.cos(colorSeed + 2 * Math.PI / 3) * 127 + 128 << 8
			   | Math.cos(colorSeed + Math.PI / 3) * 127 + 128).toString(16));
    }

    return colors;
}

function genHuesFromAngleSpread(numColors, spread, angle) {
    let deltaAngle = spread / numColors,
	hues = [];

    for(var i=0; i<numColors; ++i) {
	hues.push((angle + i * deltaAngle) % 1);
    }

    return hues;
}

/** 
  * paramaters:
  *   h = [0, 1] hue 
  *   s = [0, 1] saturation
  *   l = [0, 1] lightness 
  *
  * returns:
  *   r = [0, 255] red
  *   g = [0, 255] green
  *   b = [0, 255] blue
  */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
  * paramaters:
  *   rgbArray = [r, g, b], r/g/b belonging to [0, 255]
  *
  * returns:
  *   rgb hex value in the form '#rrggbb'
  */
function rgbArrayToHex(rgbArray) {
    return '#' + (rgbArray[0] << 16 | rgbArray[1] << 8 | rgbArray[2]).toString(16);
}

/**
  * paramaters:
  *   colors = array of rgb hex values in the form '#rrggbb'
  *
  * side effects:
  *   draw color swatches across window
  */
function drawColorSwatches(colors, sqrsPerRow, sqrWidth, sqrHeight) {
    let x = 0,
	y = 0,
	tempAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;
    for(var i=0; i<colors.length; ++i) {
	ctx.fillStyle = colors[i];
	ctx.fillRect(x,y,sqrWidth,sqrHeight);
	if (i != 0 && i % sqrsPerRow == 0) {
	    y += sqrHeight - 1;
	    x = 0;
	}
	else {
	    x += sqrWidth - 1;
	}
    }
    ctx.globalAlpha = tempAlpha;
}

function hex(x, y, size, color) {
    return {
	"x": x,
	"y": y,
	"size": size,
	"color": color
    };
}

function hexSnake(len, size, color, x, y) {
    return {
	"hexes": buildHexSnake(len, size, color, x, y),
	"len": len,
	"size": size,
	"color": color,
	"x": x,
	"y": y
    };
}

function buildHexSnake(len, size, color, x, y) {
    hexes = [];
    hexes.push(hex(x, y, size, color));
    for(let i=1; i<len; ++i) {
	hexes.push(getNextHex(hexes[i-1]));
    }
    return hexes;
}

function getNextHex(h, newColor=undefined) {
    var scaledHexCos = h.size * hexCos,
	scaledHexSin = h.size * hexSin,
	bufferX = h.size / 5,
	bufferY = h.size / 2.5,
	nextHexUpProb = .5,
	nextHexUpLimit = .2,
	nextHexProbStack = .1,
	nextHex;

    if (h.y < 0) {
	nextHex = -1;
    }
    else if(h.y > c.height) {
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
    
    nextX = h.x + h.size + scaledHexCos + bufferX;
    nextY = h.y + nextHex * scaledHexSin + nextHex * bufferY;

    return hex(nextX, nextY, h.size, newColor ? newColor : h.color);
}

function drawHex(h) {
    ctx.fillStyle = h.color;
    ctx.moveTo( h.x, h.y );
    ctx.beginPath();
    ctx.lineTo( h.x + h.size, h.y );
    ctx.lineTo(
	h.x + h.size + h.size * hexCos,
	h.y + h.size * hexSin
    );
    ctx.lineTo(
	h.x + h.size,
	h.y + 2 * h.size * hexSin
    );
    ctx.lineTo(
	h.x,
	h.y + 2 * h.size * hexSin
    );
    ctx.lineTo(
	h.x - h.size * hexCos,
	h.y + h.size * hexSin
    );
    ctx.lineTo(h.x, h.y);
    ctx.closePath();
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect(0, 0, c.width, c.height);
}

function randHexSnakes(numSnakes) {
    let snakes = [],
	colors = randColorSeq(numSnakes);

    for(let i=0; i<numSnakes; ++i) {
	snakes.push(
	    hexSnake(
		randInt(3, 5),
		randInt(15, 250),
		colors[i],
		randInt(0, c.width),
		randInt(0, c.height)
	    )
	);
    }
    return snakes;
}

function setAlphaFromSize(size) {
    // ctx.globalAlpha = .3 + (1 / size);
    ctx.globalAlpha = 1 - (.7 / (1 + (50/size)));
}

function drawHexSnake() {
    hexSnakes = randHexSnakes(3);
    hexSnakes.forEach(
	function(snake) {
	    setAlphaFromSize(snake.size);
	    ctx.shadowBlur = 20;
	    ctx.shadowColor = "black"; 
	    snake.hexes.forEach(drawHex);
	}
    );
    return hexSnakes;
}

function hexSnakesBG() {
    for(let i=0; i<2; ++i) {
	hexSnakesBG();
    }
}

function flatSquaresBG() {
    let numSquaresWide = 16,
	totalNumSquares = (Math.floor(c.height * numSquaresWide / c.width) + 1) * numSquaresWide + 1,
	colorWheelSpread = .4,
	sqrWidth = c.width / numSquaresWide + 1,
	sqrHeight = sqrWidth + (c.height % sqrWidth) / Math.floor(c.height / sqrWidth) + 1,
	startColorAngle = Math.random(),
	saturation = () => randInt(3000, 5000) / 10000,
	lightness = () => randInt(3000, 7000) / 10000,
	colors = ((seq) => randInt(0, 2) ? seq : seq.reverse()) (
		    genHuesFromAngleSpread(totalNumSquares, colorWheelSpread, startColorAngle)
			.map(x => hslToRgb(x, saturation(), lightness()))
			.map(rgbArrayToHex)
		 );
	
    drawColorSwatches(colors, numSquaresWide, sqrWidth, sqrHeight);
}
		    
flatSquaresBG();
