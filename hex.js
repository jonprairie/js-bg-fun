function randInt(start=1, end=100) {
    return Math.floor((end - start) * Math.random()) + start;
}

/**
  * parameters:
  *   numColors
function genHuesFromAngleSpread(numColors, spread, angle) {
    let deltaAngle = spread / numColors,
	hues = [];

    for(var i=0; i<numColors; ++i) {
	hues.push((angle + i * deltaAngle) % 1);
    }

    return hues;
}

/** 
  * parameters:
  *   h in [0, 1] - hue 
  *   s in [0, 1] - saturation
  *   l in [0, 1] - lightness 
  *
  * return:
  *   [r, g, b], r/g/b in [0, 255]
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
  * parameters:
  *   rgbArray like [r, g, b], r/g/b in [0, 255]
  *
  * return:
  *   rgb hex value in the form '#rrggbb'
  */
function rgbArrayToHex(rgbArray) {
    return '#' + (rgbArray[0] << 16 | rgbArray[1] << 8 | rgbArray[2]).toString(16);
}

/**
  * parameters:
  *   colors = array of rgb hex values in the form '#rrggbb'
  *
  * side effects:
  *   draw color swatches across window
  */
function drawColorSwatches(ctx, colors, sqrsPerRow, sqrsPerCol, sqrWidth, sqrHeight) {
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

function coinFlip () { return randInt(0, 2); }

function flatSquaresBG() {
    var c = document.getElementById('bg');
    var ctx = c.getContext('2d');

    c.height = window.innerHeight;
    c.width  = window.innerWidth;

    let numSquaresWide = 16,
	sqrWidth = c.width / numSquaresWide + 1,
	numSquaresTall = Math.floor(c.height / sqrWidth),
	sqrHeight = sqrWidth + (c.height % sqrWidth) / numSquaresTall + 1,
	totalNumSquares = (Math.floor(c.height * numSquaresWide / c.width) + 1) * numSquaresWide + 1,
	colorWheelSpread = .4,
	startColorAngle = Math.random(),
	saturation = () => randInt(3000, 5000) / 10000,
	lightness = () => randInt(3000, 7000) / 10000,
	colors = ((seq) => coinFlip() ? seq : seq.reverse()) (
		    genHuesFromAngleSpread(totalNumSquares, colorWheelSpread, startColorAngle)
			.map(x => hslToRgb(x, saturation(), lightness()))
			.map(rgbArrayToHex)
		 );
	
    drawColorSwatches(ctx, colors, numSquaresWide, numSquaresTall, sqrWidth, sqrHeight);
}

flatSquaresBG();

document.addEventListener('touchmove', (e) => e.preventDefault());
document.onclick = (e) => flatSquaresBG();
document.ontouchstart = (e) => flatSquaresBG();
window.onresize = (e) => flatSquaresBG();
