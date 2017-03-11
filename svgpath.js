// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

// SVGPath
// Fahri Aydos, aydos.com
// 2016-06-18
// https://aydos.com/svgedit

/** @constructor */
(SVGPath = function() {
'use strict'

var dec = -1
var segs = []

/** @constructor */
var Segment = function() {		// All value are absolute
	this.t = ""					// relatives are calculate via px and py
	this.x = undefined			// this is good for optimize, analyse, rotate, etc
	this.y = undefined			// bad for round, so round logic updated
	this.px = undefined
	this.py = undefined
	this.x1 = undefined
	this.y1 = undefined
	this.x2 = undefined
	this.y2 = undefined
	this.r1 = undefined
	this.r2 = undefined
	this.ar = undefined
	this.af = undefined
	this.sf = undefined
}

// format the segment for export
// check absolute-relative, and round decimals
function formatsegment(s) {
	var seg = new Segment()
	seg.t = s.t
	seg.x = s.t.charCodeAt(0)<96 ? rounddec(s.x) : rounddec(s.x - s.px)
	seg.y = s.t.charCodeAt(0)<96 ? rounddec(s.y) : rounddec(s.y - s.py)
	seg.x1 = s.x1==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.x1) : rounddec(s.x1 - s.px)
	seg.y1 = s.y1==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.y1) : rounddec(s.y1 - s.py)
	seg.x2 = s.x2==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.x2) : rounddec(s.x2 - s.px)
	seg.y2 = s.y2==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.y2) : rounddec(s.y2 - s.py)
	seg.r1 = s.r1==undefined ? undefined : rounddec(s.r1)
	seg.r2 = s.r1==undefined ? undefined : rounddec(s.r2)
	seg.ar = s.ar==undefined ? undefined : rounddec(s.ar)
	seg.af = s.af
	seg.sf = s.sf
	return seg
}

// import path from string
this.import = function(str) {
	str = str.replace(/\s/g, " ")						// white spaces
	str = str.trim()									// spaces at begin and end
	str = str.replace(/,/g, " ")						// commas
	str = str.replace(/([A-Za-z])([A-Za-z])/g, "$1 $2")	// two chars
	str = str.replace(/([A-Za-z])(\d)/g, "$1 $2")		// char + decimal
	str = str.replace(/([A-Za-z])(\.)/g, "$1 .")		// char + dot
	str = str.replace(/([A-Za-z])(-)/g, "$1 -")			// char + negative number
	str = str.replace(/(\d)([A-Za-z])/g, "$1 $2")		// decimal + char
	str = str.replace(/(\d)(-)/g, "$1 -")				// decimal + negative number
	var reg = /((?:-?[\d]*)\.\d+)((?:\.\d+)+)/g			// decimal + dot + decimal + dot + decimal
	while (reg.test(str)) {
		str = str.replace(reg, "$1 $2")
	}
	while (/  /.test(str)) {
		str = str.replace(/  /g, " ")					// clear double spaces
	}
	var list = str.split(" ")
	var pret = ""
	var prex = 0
	var prey = 0
	var begx = 0
	var begy = 0
	var j = 0
	var i = 0
	segs = []

	while (i<list.length) {
		var seg = new Segment()

		if (list[i].charCodeAt(0)>64) {
			seg.t = list[i++]
		} else {
			if (pret == "")
				break
			seg.t = pret == "M" ? "L" : pret == "m" ? "l" : pret
		}
		pret = seg.t

		switch (seg.t) {
		case "Z":
		case "z":
			seg.x = begx
			seg.y = begy
			break
		case "M":
		case "L":
		case "H":
		case "V":
		case "T":
			seg.x = seg.t=="V" ? prex : Number(list[i++])
			seg.y = seg.t=="H" ? prey : Number(list[i++])
			begx = seg.t=="M" ? seg.x : begx
			begy = seg.t=="M" ? seg.y : begy
			break
		case "m":
		case "l":
		case "h":
		case "v":
		case "t":
			seg.x = seg.t=="v" ? prex : prex + Number(list[i++])
			seg.y = seg.t=="h" ? prey : prey + Number(list[i++])
			begx = seg.t=="m" ? seg.x : begx
			begy = seg.t=="m" ? seg.y : begy
			break
		case "A":
		case "a":
			seg.r1 = Number(list[i++])
			seg.r2 = Number(list[i++])
			seg.ar = Number(list[i++])
			seg.af = Number(list[i++])
			seg.sf = Number(list[i++])
			seg.x = seg.t=="A" ? Number(list[i++]) : prex + Number(list[i++])
			seg.y = seg.t=="A" ? Number(list[i++]) : prey + Number(list[i++])
			break
		case "C":
		case "Q":
		case "S":
			seg.x1 = seg.t=="S" ? undefined : Number(list[i++])
			seg.y1 = seg.t=="S" ? undefined : Number(list[i++])
			seg.x2 = seg.t=="Q" ? undefined : Number(list[i++])
			seg.y2 = seg.t=="Q" ? undefined : Number(list[i++])
			seg.x = Number(list[i++])
			seg.y = Number(list[i++])
			break
		case "c":
		case "q":
		case "s":
			seg.x1 = seg.t=="s" ? undefined : prex + Number(list[i++])
			seg.y1 = seg.t=="s" ? undefined : prey + Number(list[i++])
			seg.x2 = seg.t=="q" ? undefined : prex + Number(list[i++])
			seg.y2 = seg.t=="q" ? undefined : prey + Number(list[i++])
			seg.x = prex + Number(list[i++])
			seg.y = prey + Number(list[i++])
			break
		default:
			i++
		}
		seg.px = prex
		seg.py = prey
		prex = seg.x
		prey = seg.y
		segs[j++] = seg
	}
}

// export path for final usage in <svg>
this.export = function(dec) {
	var str = ""
	var pre = ""
	
	for (var i=0; i<segs.length; i++) {
		var seg = formatsegment(segs[i])
		switch (seg.t) {
		case "Z":
		case "z":
			str += seg.t
			break
		case "M":
		case "m":
			str += seg.t + seg.x + " " + seg.y
			break
		case "L":
			str += (pre==seg.t || pre=="M") ? " " : "L"
			str += seg.x + " " + seg.y
			break
		case "l":
			str += (pre==seg.t || pre=="m") ? " " : "l"
			str += seg.x + " " + seg.y
			break
		case "H":
		case "h":
			str += pre==seg.t ? " " : seg.t
			str += seg.x
			break
		case "V":
		case "v":
			str += pre==seg.t ? " " : seg.t
			str += seg.y
			break
		case "A":
		case "a":
			str += pre==seg.t ? " " : seg.t
			str += seg.r1 + " " + seg.r2 + " " + seg.ar + " " + seg.af + " " + seg.sf + " " + seg.x + " " + seg.y
			break
		case "C":
		case "c":
			str += pre==seg.t ? " " : seg.t
			str += seg.x1 + " " + seg.y1 + " " + seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "Q":
		case "q":
			str += pre==seg.t ? " " : seg.t
			str += seg.x1 + " " + seg.y1 + " " + seg.x + " " + seg.y
			break
		case "S":
		case "s":
			str += pre==seg.t ? " " : seg.t
			str += seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "T":
		case "t":
			str += pre==seg.t ? " " : seg.t
			str += seg.x + " " + seg.y
			break
		}
		pre = seg.t
	}
	str = str.replace(/ -/g, "-")
	str = str.replace(/-0\./g, "-.")
	str = str.replace(/ 0\./g, " .")
	str = str.replace(/(\.\d+) \./g, "$1.")
	return str
}

// import from segment list, one segment on each line
// comments are after #
this.importlist = function(list, nocommentedline) {
	nocommentedline = nocommentedline==undefined ? false : nocommentedline	
	var str = ""
	var lines = list.split("\n")
	for (var i=0; i<lines.length; i++) {
		var ind = lines[i].indexOf("#")					// check comments
		if (ind<0) {
			str += lines[i] + " "						// no comments
		} else {
			if (nocommentedline)
				continue								// dont import commented line
			str += lines[i].substring(0, ind) + " "		// remove comments
		}
	}
	this.import(str)
}

// export to segment list, one segment on each line
// cannot be used in <svg>, may contain analysis comments
this.exportlist = function(dist) {

	var str = ""
	dist = Number(dist)
	if (isNaN(dist))
		dist = 0
	if (dist < 0)
		dist = 0

	for (var i=0; i<segs.length; i++) {
		var seg = formatsegment(segs[i])
		str += seg.t
		str += seg.x1==undefined ? "" : " " + seg.x1
		str += seg.y1==undefined ? "" : " " + seg.y1
		str += seg.x2==undefined ? "" : " " + seg.x2
		str += seg.y2==undefined ? "" : " " + seg.y2
		str += seg.r1==undefined ? "" : " " + seg.r1
		str += seg.r2==undefined ? "" : " " + seg.r2
		str += seg.ar==undefined ? "" : " " + seg.ar
		str += seg.af==undefined ? "" : seg.af ? " 1" : " 0"
		str += seg.sf==undefined ? "" : seg.sf ? " 1" : " 0"
		str += (seg.t.toUpperCase()=="V" || seg.t.toUpperCase()=="Z") ? "" : " " + seg.x
		str += (seg.t.toUpperCase()=="H" || seg.t.toUpperCase()=="Z") ? "" : " " + seg.y

		if (dist == 0) {
			str += "\n"
		} else {
			var x = segs[i].x - segs[i].px
			var y = segs[i].y - segs[i].py
			var d = Math.sqrt(x*x + y*y)
			if (d <= dist) {
				str += " # D " + d + "\n"
			} else {
				str += "\n"
			}
		}
	}
	return str
}

// make all segments absolute
this.absolute = function() {
	for (var i=0; i<segs.length; i++) {
		segs[i].t = segs[i].t.toUpperCase()
	}
}

// make all segments relative
this.relative = function() {
	for (var i=0; i<segs.length; i++) {
		segs[i].t = segs[i].t.toLowerCase()
	}
}

// set the global dec variable, to rounding decimals
this.round = function(d) {
	d = Number(d)
	if (isNaN(d))
		d = 0
	if (d<0)
		d = -1
	dec = Math.floor(d)
}

function rounddec(num) {
	if (dec<0)
		return num
	if (num % 1 === 0) {
		return num
	} else if (dec==0) {
		return Math.round(num)
	} else {
		var pow = Math.pow(10, dec)
		return Math.round(num * pow) / pow
	}
}

// move path with given dx, dy
this.move = function(dx, dy) {
	for (var i=0; i<segs.length; i++) {
		segs[i].x += dx
		segs[i].y += dy
		segs[i].px += dx
		segs[i].py += dy
		segs[i].x1 = segs[i].x1==undefined ? undefined : segs[i].x1 + dx
		segs[i].y1 = segs[i].y1==undefined ? undefined : segs[i].y1 + dy
		segs[i].x2 = segs[i].x2==undefined ? undefined : segs[i].x2 + dx
		segs[i].y2 = segs[i].y2==undefined ? undefined : segs[i].y2 + dy
	}
	segs[0].px = 0
	segs[0].py = 0
}

// flip horizontally with flip(0, center)
// flip vertically, with flip(center, 0)
this.flip = function(x, y) {
	for (var i=0; i<segs.length; i++) {
		if (x==0) {
			segs[i].y = y + (y - segs[i].y)
			segs[i].py = y + (y - segs[i].py)
			segs[i].y1 = segs[i].y1==undefined ? undefined : y + (y - segs[i].y1)
			segs[i].y2 = segs[i].y2==undefined ? undefined : y + (y - segs[i].y2)
		}
		if (y==0) {
			segs[i].x = x + (x - segs[i].x)
			segs[i].px = x + (x - segs[i].px)
			segs[i].x1 = segs[i].x1==undefined ? undefined : x + (x - segs[i].x1)
			segs[i].x2 = segs[i].x2==undefined ? undefined : x + (x - segs[i].x2)
		}
		segs[i].sf = segs[i].sf==undefined ? undefined : (segs[i].sf+1)%2
	}
	segs[0].px = 0
	segs[0].py = 0
}

// move paths center to the given coordinates
this.center = function(x, y) {
	var minx = segs[0].x
	var miny = segs[0].y
	var maxx = segs[0].x
	var maxy = segs[0].y
	for (var i=1; i<segs.length; i++) {
		minx = segs[i].x<minx ? segs[i].x : minx
		miny = segs[i].y<miny ? segs[i].y : miny
		maxx = segs[i].x>maxx ? segs[i].x : maxx
		maxy = segs[i].y>maxy ? segs[i].y : maxy
	}
	var dx = x - minx - (maxx-minx)/2
	var dy = y - miny - (maxy-miny)/2
	this.move(dx, dy)
}

// scale path with a given ratio
this.scale = function (ratio) {
	ratio = Number(ratio)
	if (isNaN(ratio))
		return
	if (ratio <= 0)
		return
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		seg.x *= ratio
		seg.y *= ratio
		seg.px *= ratio
		seg.py *= ratio
		seg.x1 = seg.x1==undefined ? undefined : ratio * seg.x1
		seg.y1 = seg.y1==undefined ? undefined : ratio * seg.y1
		seg.x2 = seg.x2==undefined ? undefined : ratio * seg.x2
		seg.y2 = seg.y2==undefined ? undefined : ratio * seg.y2
		seg.r1 = seg.r1==undefined ? undefined : ratio * seg.r1
		seg.r2 = seg.r2==undefined ? undefined : ratio * seg.r2
	}
}

// rotate the path with given center and rotation degree
this.rotate = function(x, y, d) {
	d *= Math.PI/180
	var sin = Math.sin(d)
	var cos = Math.cos(d)
	for (var i=0; i<segs.length; i++) {
		var rp = rotatepoint(segs[i].x, segs[i].y, x, y, sin, cos)
		segs[i].x = rp[0]
		segs[i].y = rp[1]
		var rp = rotatepoint(segs[i].px, segs[i].py, x, y, sin, cos)
		segs[i].px = rp[0]
		segs[i].py = rp[1]
		if (segs[i].x1!=undefined) {
			var rp = rotatepoint(segs[i].x1, segs[i].y1, x, y, sin, cos)
			segs[i].x1 = rp[0]
			segs[i].y1 = rp[1]
		}
		if (segs[i].x2!=undefined) {
			var rp = rotatepoint(segs[i].x2, segs[i].y2, x, y, sin, cos)
			segs[i].x2 = rp[0]
			segs[i].y2 = rp[1]
		}
		if (segs[i].t=="H" || segs[i].t=="V") {
			segs[i].t = "L"
		}
		if (segs[i].t=="h" || segs[i].t=="v") {
			segs[i].t = "l"
		}
	}
	segs[0].px = 0
	segs[0].py = 0
}

function rotatepoint(px, py, ox, oy, sin, cos) {
	var x = cos * (px-ox) - sin * (py-oy) + ox
	var y = sin * (px-ox) + cos * (py-oy) + oy
	return [x, y]
}

}) // end of SVGPath
