// tessellates the screen with color swatches


function randInt(start=1, end=100) {
    return Math.floor((end - start) * Math.random()) + start;
}


/**
  * parameters:
  *   numColors - number of colors to generate
  *   spread in interval [0, 1] - how much of the color wheel to span
  *   angle in interval [0, 1] - where to start on color wheel
  *
  * return:
  *   array of values in interval [0, 1], representing angles on the color wheel
  */
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
  *   h in interval [0, 1] - hue 
  *   s in interval [0, 1] - saturation
  *   l in interval [0, 1] - lightness 
  *
  * return:
  *   [r, g, b], r/g/b being integers between 0 and 255 inclusive
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
  *   rgbArray like [r, g, b], r/g/b being integers between 0 and 255 inclusive
  *
  * return:
  *   rgb hex value in the form '#rrggbb'
  */
function rgbArrayToHex(rgbArray) {
    return '#' + (rgbArray[0] << 16 | rgbArray[1] << 8 | rgbArray[2]).toString(16);
}


/**
  * parameters:
  *   placeSqr - a function that maps an index to an [x, y] square placement
  *   sqrWidth - width of squares in pixels
  *   sqrHeight - height of squares in pixels
  *
  * return:
  *   function that takes a context, index and color and draws a square on
  *   the context using the given color
  */
function genColorSwatchDrawer(placeSqr, sqrWidth, sqrHeight) {
    return function (ctx, sqr_i, color) {
	let sqrPos = placeSqr(sqr_i),
	    x = sqrPos[0] * sqrWidth,
    	    y = sqrPos[1] * sqrHeight,
    	    tempAlpha = ctx.globalAlpha;
	ctx.globalAlpha = 1;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, sqrWidth, sqrHeight);
	ctx.globalAlpha = tempAlpha;
    };
}


/**
  * parameters:
  *   dividend - number to divide into
  *   divisor - number to divide by
  * 
  * returns: 
  *   [q, r] where q is the quotient and r is the remainder
  */
function quotient(dividend, divisor) {
    return [ dividend % divisor, Math.floor(dividend / divisor) ];
}


/**
  * parameters:
  *   screenWidth - width of screen, in squares
  *   screenHeight - height of screen, in squares
  * 
  * return:
  *   function that takes an index and returns the [x, y] placement 
  *   of the corresponding square. Squares are placed left to right,
  *   top to bottom.
  */
function topDownGradient(screenWidth, screenHeight) {
    return (i) => quotient(i, screenWidth);
}


/**
  * parameters:
  *   screenWidth - width of screen, in squares
  *   screenHeight - height of screen, in squares
  *
  * return:
  *   a list of 'psuedo' triangle numbers. Triangle numbers start
  *   at one. The difference between successive triangle numbers 
  *   starts at one as well, then increments after each triangle number.
  *   ex: 1, 3, 6, 10, 15 ...
  *   because screens are generally rectangles, not triangles, we actually
  *   need to generate 'pseudo' triangle numbers. The difference between
  *   each successive pseudo triangle number also increments by one, but
  *   remains constant once we reach an index greater than the smaller of
  *   the screen width and screen height. The difference then starts to 
  *   decrement once we reach an index greater than the larger of the two. 
  */
function genTriNumbers(screenWidth, screenHeight) {
    let n = screenWidth + screenHeight - 1,
	diff = 1,
	lastTri = 0,
	triNumbers = [];

    for(let i = 0; i < n; ++i) {
	triNumbers = triNumbers.concat(lastTri);
	if(i < (screenHeight - 1) && i < (screenWidth - 1)) {
	    diff += 1;
	} else if (i >= (screenHeight - 1) && i >= (screenWidth - 1)) {
	    diff -= 1;
	}
	lastTri += diff;
    }

    return triNumbers;
}


function diagGradient(screenWidth, screenHeight) {
    let triNumbers = genTriNumbers(screenWidth, screenHeight),
	getNextTriNumber = function(list, indx) {
	    let l = list.length,
		mid = Math.floor(l / 2);

	    if (l == 1) {
		let triNumberIndx = list[mid] == indx ?
		    triNumbers.indexOf(list[mid])
		    : triNumbers.indexOf(list[mid]) + 1;
		return [
		    triNumbers[triNumberIndx],
		    triNumberIndx - screenHeight + 1 > 0 ? triNumberIndx - screenHeight + 1 : 0,
		    Math.min(screenHeight - 1, triNumberIndx)
		];
	    } else {
		if (list[mid] > indx) {
		    return getNextTriNumber(list.slice(0, mid), indx);
		} else if (list[mid] <= indx) {
		    return getNextTriNumber(list.slice(mid, l), indx);
		} 
	    }
	};

    return function(i) {
	let nextTriNumber = getNextTriNumber(triNumbers, i),
	    diff = nextTriNumber[0] - i;
	return [nextTriNumber[1] + diff, nextTriNumber[2] - diff];
    };
}


function coinFlip() { return randInt(0, 2); }


function coolDown(t, f) {
    let locked = false;
    let unlock = () => locked = false;

    return function( ... args ) {
	if (!locked) {
	    locked = true;
	    setTimeout(unlock, t);
	    f( ... args );
	}
    };
}


var flatSquaresBG = coolDown(500, function (animationLength) {
    var c = document.getElementById('bg');
    var ctx = c.getContext('2d');

    c.height = window.innerHeight;
    c.width  = window.innerWidth;

    let numSquaresWide = 16,
	sqrWidth = Math.ceil(c.width / numSquaresWide + 1),
	numSquaresTall = Math.floor(c.height / sqrWidth),
	sqrHeight = Math.ceil(sqrWidth + (c.height % sqrWidth) / numSquaresTall + 1),
	totalNumSquares = (Math.floor(c.height / sqrHeight) + 1) * numSquaresWide,
	colorWheelSpread = .4,
	startColorAngle = Math.random(),
	saturation = () => randInt(3000, 5000) / 10000,
	lightness = () => randInt(3000, 7000) / 10000,
	colors = ((seq) => coinFlip() ? seq : seq.reverse()) (
		    genHuesFromAngleSpread(totalNumSquares, colorWheelSpread, startColorAngle)
			.map(x => hslToRgb(x, saturation(), lightness()))
			.map(rgbArrayToHex)
		 );

    // swatchDrawer = genColorSwatchDrawer((i) => quotient(i, numSquaresWide), sqrWidth, sqrHeight);
    swatchDrawer = genColorSwatchDrawer(
	diagGradient(numSquaresWide, numSquaresTall),
	sqrWidth,
	sqrHeight
    );
    colors.forEach((c, i) => setTimeout(() => swatchDrawer(ctx, i, c), randInt(1,animationLength)));
});

window.onload = 
document.onclick = 
document.ontouchstart = 
window.onresize = (e) => flatSquaresBG(500);
