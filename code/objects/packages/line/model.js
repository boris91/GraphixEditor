//{ x1, y1, x2, y2, width, lineType, color, order, visible }
GL.LineModel = function GL_LineModel(attributes) {
	attributes = attributes ? ('string' === typeof attributes ? JSON.parse(attributes) : attributes) : {};
	GL.ObjectBase.call(this, GL.extend(attributes, { type: 'line' }));

	this._x1 = attributes.x1 || -1;
	this._y1 = attributes.y1 || -1;
	this._x2 = attributes.x2 || -1;
	this._y2 = attributes.y2 || -1;
	this._width = attributes.width || 1 / 2;
	this._lineType = attributes.lineType || [GL.LineTypesEnum.SOLID, [10, 3]];
	this._tempX = undefined;
	this._tempY = undefined;

	GL.extend(this._getters,
				{
					x1: 'getX1',
					y1: 'getY1',
					x2: 'getX2',
					y2: 'getY2',
					width: 'getWidth',
					lineType: 'getLineType',
					length: 'getLength',
					tempX: 'getTempX',
					tempY: 'getTempY',
					projectionX: 'getProjectionX',
					projectionY: 'getProjectionY',
					region: 'getRegion',
					attributes: 'getAttributes',
					data: 'getData'
				});

	GL.extend(this._setters,
				{
					x1: 'setX1',
					y1: 'setY1',
					x2: 'setX2',
					y2: 'setY2',
					point1: 'movePoint1To',
					point2: 'movePoint2To',
					position: 'moveTo',
					temp2: 'moveTemp2To',
					temp1: 'moveTemp1To',
					shift: 'shift',
					resize: 'resize',
					rotation: 'rotate',
					width: 'setWidth',
					lineType: 'setLineType'
				});
};

GL.LineModel.prototype = {
	getAttributes: function () {
		return GL.extend(this._base.getAttributes.call(this),
						{
							x1: this._x1,
							y1: this._y1,
							x2: this._x2,
							y2: this._y2,
							width: this._width,
							lineType: this._lineType,
							tempX: this._tempX,
							tempY: this._tempY,
							region: this.getRegion()
						});
	},
	getLineType: function () {
		return this._lineType;
	},
	getRegion: function () {
		return {
			l: (this._x1 < this._x2 ? this._x1 : this._x2) - this._width / 2,
			t: (this._y1 < this._y2 ? this._y1 : this._y2) - this._width / 2,
			w: (this._x1 < this._x2 ? this._x2 : this._x1) - (this._x1 < this._x2 ? this._x1 : this._x2) + this._width,
			h: (this._y1 < this._y2 ? this._y2 : this._y1) - (this._y1 < this._y2 ? this._y1 : this._y2) + this._width
		};
	},
	getLength: function () {
		return Math.pow(Math.pow(this._x2 - this._x1, 2) + Math.pow(this._y2 - this._y1, 2), 0.5);
	},
	getX1: function () {
		return this._x1;
	},
	getY1: function () {
		return this._y1;
	},
	getX2: function () {
		return this._x2;
	},
	getY2: function () {
		return this._y2;
	},
	getTempX: function () {
		return this._tempX;
	},
	getTempY: function () {
		return this._tempY;
	},
	getProjectionX: function () {
		var head = this._x2 > this._x1 ? this._x2 : this._x1,
			tail = head === this._x2 ? this._x1 : this._x2;
		return head - tail;
	},
	getProjectionY: function () {
		var head = this._y2 > this._y1 ? this._y2 : this._y1,
			tail = head === this._y2 ? this._y1 : this._y2;
		return head - tail;
	},
	getWidth: function () {
		return this._width;
	},
	setX1: function (value) {
		if (typeof value === 'number' && !isNaN(value)) {
			this._x1 = value;
		} else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.LineModel.setX1()-method.');
		}
	},
	setY1: function (value) {
		if (typeof value === 'number' && !isNaN(value)) {
			this._y1 = value;
		} else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.LineModel.setY1()-method.');
		}
	},
	setX2: function (value) {
		if (typeof value === 'number' && !isNaN(value)) {
			this._x2 = value;
		} else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.LineModel.setX2()-method.');
		}
	},
	setY2: function (value) {
		if (typeof value === 'number' && !isNaN(value)) {
			this._y2 = value;
		} else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.LineModel.setY2()-method.');
		}
	},
	movePoint1To: function (x, y) {
		this.setX1(x);
		this.setY1(y);
	},
	movePoint2To: function (x, y) {
		this.setX2(x);
		this.setY2(y);
	},
	moveTo: function (X1, Y1, X2, Y2) {
		this.movePoint1To(X1, Y1);
		this.movePoint2To(X2, Y2);
	},
	moveTemp1To: function (X1, Y1) {
		if (typeof X1 === 'number' && typeof Y1 === 'number' && !isNaN(X1) && !isNaN(Y1)) {
			this._tempX = X1;
			this._tempY = Y1;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.moveTemp1To()-method.');
		}
	},
	moveTemp2To: function (X2, Y2) {
		if (typeof X2 === 'number' && typeof Y2 === 'number' && typeof this._tempX === 'number' && typeof this._tempY === 'number' &&
			!isNaN(X2) && !isNaN(Y2) && !isNaN(this._tempX) && !isNaN(this._tempY)) {
			if (X2 === this._tempX && Y2 === this._tempY) {
				X2++;
				Y2++;
			}
			this.moveTo(this._tempX, this._tempY, X2, Y2);
			this._tempX = this._tempY = undefined;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.moveTemp2To()-method.');
		}
	},
	shift: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			this._x1 += x;
			this._y1 += y;
			this._x2 += x;
			this._y2 += y;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.shift()-method.');
		}
	},
	resize: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			if (this._x1 < this._x2) {
				this._x1 -= x / 2;
				this._x2 += x / 2;
			}
			else {
				this._x1 += x / 2;
				this._x2 -= x / 2;
			}

			if (this._y1 < this._y2) {
				this._y1 -= y / 2;
				this._y2 += y / 2;
			}
			else {
				this._y1 += y / 2;
				this._y2 -= y / 2;
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.resize()-method.');
		}
	},
	rotate: function (angle, centerX, centerY) {
		var X,
			Y,
			region;
		if (typeof angle === 'number' && !isNaN(angle)) {
			//ROTATE LINE
			if (!(typeof centerX === 'number' && typeof centerY === 'number' && !isNaN(centerX) && !isNaN(centerY))) {
				region = this.getRegion();
				centerX = region.l + region.w / 2;
				centerY = region.t + region.h / 2;
			}
			angle *= Math.PI / 180;
			X = this._x1 * Math.cos(angle) - this._y1 * Math.sin(angle) - centerX * (Math.cos(angle) - 1) + centerY * Math.sin(angle);
			Y = this._x1 * Math.sin(angle) + this._y1 * Math.cos(angle) - centerX * Math.sin(angle) - centerY * (Math.cos(angle) - 1);
			this._x1 = X;
			this._y1 = Y;
			X = this._x2 * Math.cos(angle) - this._y2 * Math.sin(angle) - centerX * (Math.cos(angle) - 1) + centerY * Math.sin(angle);
			Y = this._x2 * Math.sin(angle) + this._y2 * Math.cos(angle) - centerX * Math.sin(angle) - centerY * (Math.cos(angle) - 1);
			this._x2 = X;
			this._y2 = Y;
		}
	},
	setWidth: function (w) {
		if (typeof w === 'number' && w >= 0) {
			this._width = w;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.setWidth()-method.');
		}
	},
	setLineType: function (t) {
		if (typeof t === 'object') {
			if (typeof t[0] === 'string' && typeof t[1] === 'object') {
				if (typeof t[1][0] === 'number' && typeof [1][1] === 'number' && t[0] in GL.LineTypesEnum) {
					this._lineType = t;
					return;
				}
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineModel.setLineType()-method.');
		}
	},
	getData: function (asObject) {
		var jsonObject = GL.extend({
			x1: this._x1,
			y1: this._y1,
			x2: this._x2,
			y2: this._y2,
			width: this._width,
			lineType: this._lineType
		},
			this._base.getData.call(this, true));
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}
};

(function () {
	(function inheritObjectBase() {
		if (!GL.ObjectBase) {
			GL.defer(inheritObjectBase, 0);
			return;
		}
		GL.inherit(GL.ObjectBase, GL.LineModel);
	}());
}());