GL.SelectModel = function (left, top, width, height, visible) {
	this._type = 'select';
	this._left = left || 0;
	this._top = top || 0;
	this._width = width || 0;
	this._height = height || 0;
	this._visible = visible || false;
	this._tempLeft = undefined;
	this._tempTop = undefined;
};

GL.SelectModel.prototype = {
	getAttributes: function () {
		return {
				type: this._type,
				left: this._left,
				top: this._top,
				width: this._width,
				height: this._height,
				visible: this._visible,
				tempLeftTop: {
					x: this._tempLeft,
					y: this._tempTop
				}
			};
	},
	getDiameter: function() {
		return Math.pow(Math.pow(this._width, 2)+Math.pow(this._height, 2), 0.5);
	},
	getLeft: function() {
		return this._left;
	},
	getTop: function() {
		return this._top;
	},
	getRight: function() {
		return this._left+this._width;
	},
	getBottom: function() {
		return this._top+this._height;
	},
	getWidth: function() {
		return this._width;
	},
	getHeight: function() {
		return this._height;
	},
	getTempLeft: function() {
		return this._tempLeft;
	},
	getTempTop: function() {
		return this._tempTop;
	},
	getTempLeftTop: function () {
		return {
				x: this._tempLeft,
				y: this._tempTop
			};
	},
	setRegion: function (region) {
		this._left = region.l;
		this._top = region.t;
		this._width = region.w;
		this._height = region.h;
	},
	getRegion: function() {
		return {
			l: this._left,
			t: this._top,
			w: this._width,
			h: this._height
		};
	},
	getCenter: function() {
		return {
			x: this._left + this._width/2,
			y: this._top + this._height/2
		};
	},
	isVisible: function() {
		return this._visible;
	},
	moveLeftTopTo: function(l, t) {
		if(typeof l === 'number' && typeof t === 'number' && !isNaN(l) && !isNaN(t)) {
			this._left = l;
			this._top = t;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.SelectModel.moveLeftTopTo()-method.');
		}
	},
	moveRightBottomTo: function(r, b) {
		if(typeof r === 'number' && typeof b === 'number' && r >= this._left && b >= this._top) {
			this._width = r - this._left;
			this._height = b - this._top;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.SelectModel.moveRightBottomTo()-method.');
		}
	},
	moveTempLeftTopTo: function(X1, Y1) {
		if(typeof X1 === 'number' && typeof Y1 === 'number' && !isNaN(X1) && !isNaN(Y1)) {
			this._tempLeft = X1;
			this._tempTop = Y1;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.SelectModel.moveTempLeftTopTo()-method.');
		}
	},
	moveTempRightBottomTo: function (r, b) {
		if(typeof r === 'number' && typeof b === 'number' && !isNaN(r) && !isNaN(b)) {
			if(this._tempLeft > r) {
				this._left = r;
				r = this._tempLeft;
				this._tempLeft = this._left;
			}
			if(this._tempTop > b) {
				this._top = b;
				b = this._tempTop;
				this._tempTop = this._top;
			}
			this.moveLeftTopTo(this._tempLeft, this._tempTop);
			this.moveRightBottomTo(r, b);
			this._tempLeft = this._tempTop = undefined;
			GL.eventsManager.fire(this, 'fix');
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.SelectModel.moveTempRightBottomTo()-method.');
		}
	},
	setWidth: function(w) {
		if(typeof w === 'number' && w >= 0) {
			this._width = w;
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.SelectModel.setWidth()-method.');
		}
	},
	setHeight: function(h) {
		if(typeof h === 'number' && h >= 0) {
			this._height = h;
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.SelectModel.setHeight()-method.');
		}
	},
	addRegion: function (region) {
		if (GL.isNumber(this._left) && GL.isNumber(this._top) && GL.isNumber(this._width) && GL.isNumber(this._height)) {
			var left = Math.min(this._left, region.l),
				top = Math.min(this._top, region.t),
				width = Math.max(this._left + this._width, region.l + region.w) - left,
				height = Math.max(this._top + this._height, region.t + region.h) - top;
			this._left = left;
			this._top = top;
			this._width = width;
			this._height = height;
		} else {
			this._left = region.l;
			this._top = region.t;
			this._width = region.w;
			this._height = region.h;
		}
	},
	toggleVisibility: function(value) {
		if(typeof value !== 'boolean') {
			this._visible = this._visible ? false : true;
		}
		else {
			this._visible = value;
		}
	}
};