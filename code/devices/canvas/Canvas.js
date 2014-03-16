//{context, scaleStep, shiftStep, forDom, visible}
GL.Canvas = function GL_Canvas(attributes) {
	attributes = attributes || {};
	this._id = attributes.id || (attributes.forDom && attributes.forDom.id ? attributes.forDom.id : 'canvas_' + GL.generateUniqueId());
	this._context = attributes.context;
	this._scaleX = 1;
	this._scaleY = 1;
	this._shiftX = 0;
	this._shiftY = 0;
	this._scaleStep = GL.isNumber(attributes.scaleStep) && attributes.scaleStep > 0 && attributes.scaleStep !== 1 ? attributes.scaleStep : 1.1;
	this._shiftStep = GL.isNumber(attributes.shiftStep) && attributes.shiftStep !== 0 ? attributes.shiftStep : 1;
	this._domAttributes =  attributes.forDom ? attributes.forDom : {
			id: this._id,
			style: {
				position: 'absolute',
				left: '250px',
				top: '50px',
				backgroundColor: 'rgba(0,0,0,0.01)',
				border: 'none'
			},
			width: '500px',
			height: '300px'
		};
	this._domParent = GL.DOM.byId(attributes.parentId) || document.body;
	if (!this._context) {
		if (!this._domAttributes.id) {
			this._domAttributes.id = this._id;
		}
		this._context = GL.DOM.add('canvas', { attributes: this._domAttributes }, this._domParent).getContext('2d');
	}
	this._visible = GL.isBoolean(attributes.visible) ? attributes.visible : true;
	
	if (this._context) {
		this.initialize();
	}

	this._onDrag = attributes.onDrag || function () {};
	this._onMove = attributes.onMove || function () {};
	this._onDrop = attributes.onDrop || function () {};
	this._onZoom = attributes.onZoom || function () {};
	this._onContextMenu = attributes.onContextMenu || function () {};

	if (attributes.connectAll) {
		this.connectAll();
	}
};

GL.Canvas.prototype = {
	initialize: function () {
		var context = this._context;
		context.scale(1/this._scaleX, 1/this._scaleY);
		context.translate(0, 0);
		context.save();
		context.scale(this._scaleX, this._scaleY);
		context.translate(-this._shiftX, -this._shiftY);
	},
	
	getId: function () {
		return this._id;
	},
	
	getDomAttributes: function () {
		return this._domAttributes;
	},
	
	getDomParent: function () {
		return this._domParent;
	},
	
	getCoordX: function (layerX) {
		return layerX / this._scaleX + this._shiftX;
	},

	getCoordY: function (layerY) {
		return layerY / this._scaleY + this._shiftY;
	},

	getContext: function () {
		return this._context;
	},

	getRegion: function () {
		return {
			l: this._shiftX,
			t: this._shiftY,
			w: this._context.canvas.offsetWidth / this._scaleX,
			h: this._context.canvas.offsetHeight / this._scaleY
		};
	},

	getScale: function () {
		return {x: this._scaleX, y: this._scaleY};
	},

	getShift: function () {
		return {x: this._shiftX, y: this._shiftY};
	},

	getScaleX: function () {
		return this._scaleX;
	},

	getScaleY: function () {
		return this._scaleY;
	},

	getScaleStep: function () {
		return this._scaleStep;
	},

	getShiftX: function () {
		return this._shiftX;
	},

	getShiftY: function () {
		return this._shiftY;
	},

	getShiftStep: function () {
		return this._shiftStep;
	},

	isVisible: function () {
		return this._visible;
	},

	setScaleStep: function (scaleStep) {
		if (GL.isNumber(scaleStep) && scaleStep > 0 && scaleStep !== 1) {
			this._scaleStep = scaleStep;
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.setScaleStep');
		}
	},

	setShiftStep: function (shiftStep) {
		if (GL.isNumber(shiftStep) && shiftStep !== 0) {
			this._shiftStep = shiftStep;
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.setShiftStep');
		}
	},

	setContext: function (context) {
		if (context && context instanceof CanvasRenderingContext2D) {
			this._context = context;
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.setContext');
		}
	},

	//operations under canvas paint frame [VIEW]

	restore: function () {
		this._context.restore();
		this._context.save();
		this._scaleX = this._scaleY = 1;
		this._shiftX = this._shiftY = 0;
	},
	
	clear: function (rectToClear) {
		rectToClear =	GL.isObject(rectToClear) &&
						GL.objectHasAllProperties(rectToClear, ['l', 't', 'w', 'h']) &&
						GL.haveType([rectToClear.l, rectToClear.t, rectToClear.w, rectToClear.h], 'number') ? rectToClear : this.getRegion();
		this._context.clearRect(rectToClear.l, rectToClear.t, rectToClear.w, rectToClear.h);
	},

	draw: function (objectType, objectData) {
		if (GL.isNotEmptyString(objectType) && GL.objectHasProperty(GL.Painter, 'render' + objectType.slice(0, 1).toUpperCase() + objectType.slice(1).toLowerCase()) && GL.isObject(objectData)) {
			GL.Painter['render' + objectType.slice(0,1).toUpperCase() + objectType.slice(1).toLowerCase()](this._context, objectData);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.draw');
		}
	},

	dispropZoom: function (xCoef, yCoef) {
		if (GL.isNumber(xCoef) && GL.isNumber(yCoef)) {
			this._shiftX /= xCoef;
			this._shiftY /= yCoef;
			this._scaleX *= xCoef;
			this._scaleY *= yCoef;
			this._context.scale(xCoef, yCoef);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.dispropZoom');
		}
	},

	zoom: function (coef) {
		if (GL.isNumber(coef)) {
			this._shiftX /= coef;
			this._shiftY /= coef;
			this._scaleX *= coef;
			this._scaleY *= coef;
			this._context.scale(coef, coef);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.zoom');
		}
	},

	zoomAuto: function (out) {
		this.zoom(out ? 1/this._scaleStep : this._scaleStep);
	},

	shiftByX: function (value) {
		if (GL.isNumber(value)) {
			this._context.translate(-value, 0);
			this._shiftX += value;
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.shiftByX');
		}
	},

	shiftByY: function (value) {
		if (GL.isNumber(value)) {
			this._context.translate(0, -value);
			this._shiftY += value;
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.shiftByY');
		}
	},

	shift: function (xValue, yValue) {
		if (GL.isNumber(xValue) && GL.isNumber(yValue)) {
			this._shiftX += xValue;
			this._shiftY += yValue;
			this._context.translate(-xValue, -yValue);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.shift');
		}
	},

	shiftAuto: function (xSign, ySign) {
		if ([-1, 0, 1].indexOf(xSign) > -1 && [-1, 0, 1].indexOf(ySign) > -1) {
			this.shift(this._shiftStep*xSign, this._shiftStep*ySign);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.shiftAuto');
		}
	},

	/*
	focusOn: function (xCoord, yCoord) {//TODO: rewrite method due to wrong behaviour during random point focusing
		if (GL.isNumber(xCoord) && GL.isNumber(yCoord)) {
			this.shift(	- xCoord + (this._context.canvas.width/2) - this._shiftX,
						- yCoord + (this._context.canvas.height/2) - this._shiftY);
		} else if (!GL.isNumber(xCoord) && !GL.isNumber(yCoord)) {
			this.focusOn(this._context.canvas.width/this._scaleX/2, this._context.canvas.height/this._scaleY/2);
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.focusOn');
		}
	},
	*/

	//.

	//operations under canvas DOM-element

	getDomRegion: function () {
		var canvas = this._context.canvas;
		return {
				l: canvas.offsetLeft,
				t: canvas.offsetTop,
				w: canvas.offsetWidth,
				h: canvas.offsetHeight
			};
	},

	moveOn: function (x, y) {
		if (GL.isNumber(x) && GL.isNumber(y)) {
			var canvas = this._context.canvas;
			canvas.style.left = (canvas.offsetLeft + x) + 'px';
			canvas.style.top = (canvas.offsetTop + y) + 'px';
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.moveOn');
		}
	},

	moveTo: function (x, y) {
		if (GL.isNumber(x) && GL.isNumber(y)) {
			this._context.canvas.style.left = x + 'px';
			this._context.canvas.style.top = y + 'px';
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.moveTo');
		}
	},

	resizeOn: function (x, y) {
		return (this.resizeTo(this._context.canvas.offsetWidth + x, this._context.canvas.offsetHeight + y) ? {dx:x, dy:y} : {dx:0, dy:0});
	},

	resizeTo: function (x, y) {
		if (GL.isNumber(x) && GL.isNumber(y) && x >= 10 && y >= 10) {
			this._context.canvas.setAttribute('width', x + 'px');
			this._context.canvas.setAttribute('height', y + 'px');
			return true;
		}
	},
	
	toggleVisibility: function (value) {
		if (GL.isBoolean(value)) {
			this._visible = value;
		} else {
			this._visible = !this._visible;
		}
		this._context.canvas.style.display = this._visible ? 'block' : 'none';
	},

	emptyEventHandling: function (eventName) {
		if (GL.isNotEmptyString(eventName) && (('on'+eventName) in this._context.canvas)) {
			this._context.canvas['on'+eventName] = function () { return false; };
		} else {
			GL.raiseException(GL.exceptionTypes.invalidArguments, 'Canvas.emptyEventHandling', false);
		}
	},

	connectAll: function () {
		this.connect('onmousewheel' in this._context.canvas ? 'mousewheel' : 'DOMMouseScroll', this._onZoom);
		this.connect('mousedown', this._onDrag);
		this.connect('mousemove', this._onMove);
		this.connect('mouseup', this._onDrop);
		this._context.canvas.oncontextmenu = function () { return false; };
		this.connect('contextmenu', this._onContextMenu);
	},

	connect: function (eventName, listener) {
		this._context.canvas.addEventListener(eventName, listener, false);
		return {
				eventName: eventName,
				listener: listener
			};
	},

	disconnect: function (eventName, listener) {
		this._context.canvas.removeEventListener(eventName, listener);
	}

	//.

};