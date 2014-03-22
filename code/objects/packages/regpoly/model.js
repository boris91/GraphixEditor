//{ center, radius, anglesCount, firstAngle, thickness, fillColor, lineType, color, visible }
GL.RegpolyModel = function GL_RegpolyModel(attributes) {
	attributes = attributes ? ('string' === typeof attributes ? JSON.parse(attributes) : attributes) : {};
	GL.ObjectBase.call(this, GL.extend(attributes, { type: 'regpoly' }));

	this._center = attributes.center && 'x' in attributes.center && 'y' in attributes.center ? attributes.center : { x: 0, y: 0 };
	this._radius = attributes.radius || 0;
	this._anglesCount = ('number' === typeof attributes.anglesCount && attributes.anglesCount >= 3 && Math.round(attributes.anglesCount) === attributes.anglesCount) ? attributes.anglesCount : 3;
	this._firstAngle = attributes.firstAngle || 0;
	this._thickness = attributes.thickness || 1 / 2;
	this._fillColor = attributes.fillColor || {
		r: 0,
		g: 0,
		b: 0,
		a: 0
	};
	this._lineType = attributes.lineType || [
		GL.LineTypesEnum.SOLID,
		[2, 2]
	];
	this._tempCenter = { x: undefined, y: undefined };
	this._points = [];
	this.calculatePointsCoords();

	GL.extend(this._getters,
				{
					center: 'getCenter',
					radius: 'getRadius',
					anglesCount: 'getAnglesCount',
					firstAngle: 'getFirstAngle',
					thickness: 'getThickness',
					fillColor: 'getFillColor',
					lineType: 'getLineType',
					points: 'getPoints',
					point: 'getPoint',
					tempCenter: 'getTempCenter',
					region: 'getRegion',
					attributes: 'getAttributes',
					data: 'getData'
				});

	GL.extend(this._setters,
				{
					radius: 'setRadius',
					firstAngle: 'setFirstAngle',
					thickness: 'setThickness',
					fillColor: 'setFillColor',
					lineType: 'setLineType',
					center: 'moveCenterTo',
					tempCenter: 'moveTempCenterTo',
					shift: 'shift',
					resize: 'resize',
					rotation: 'rotate'
				});
};

GL.RegpolyModel.prototype = {
	getAttributes: function () {
		return GL.extend(this._base.getAttributes.call(this),
						{
							center: this._center,
							radius: this._radius,
							anglesCount: this._anglesCount,
							firstAngle: this._firstAngle,
							points: this._points,
							thickness: this._thickness,
							fillColor: {
								r: this._fillColor.r,
								g: this._fillColor.g,
								b: this._fillColor.b,
								a: this._fillColor.a
							},
							lineType: this._lineType,
							tempCenter: this._tempCenter,
							region: this.getRegion()
						});
	},
	getLineType: function () {
		return this._lineType;
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
			GL.raiseExcepton('ERROR', 'Wrong values provided to GL.RegpolyModel.setLineType()-method.');
		}
	},
	calculatePointsCoords: function () {
		var x,
			y,
			c;
		if (this._tempCenter !== undefined) {
			c = this._tempCenter.x !== undefined && this._tempCenter.y !== undefined ? this._tempCenter : this._center;
		}
		else {
			c = this._center;
		}
		this._points = [];
		for (i = 0; i < this._anglesCount; i++) {
			x = c.x + this._radius * Math.cos(this._firstAngle * Math.PI / 180 + 2 * Math.PI * i / this._anglesCount);
			y = c.y + this._radius * Math.sin(this._firstAngle * Math.PI / 180 + 2 * Math.PI * i / this._anglesCount);
			this._points.push({ x: x, y: y });
		}
	},
	calculateRadius: function () {
		this._radius = Math.pow(Math.pow(this._points[1].x - this._points[0].x, 2) + Math.pow(this._points[1].y - this._points[0].y, 2), 1 / 2) / (2 * Math.sin(Math.PI / this._anglesCount));
	},
	calculateFirstAngle: function () {
		var signX = this._points[0].x - this._center.x > 0 ? 1 : -1,
			signY = this._points[0].y - this._center.y > 0 ? 1 : -1;
		this.setFirstAngle(signY * ((Math.acos((this._points[0].x - this._center.x) / this._radius) * 180 / Math.PI)), signX);
	},
	resize: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			if (this._radius + x / 2 > 0 && this._radius + y / 2 > 0) {
				this._radius += (x || y) / 2;
				this.calculatePointsCoords();
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.resize()-method.');
		}
	},
	rotate: function (angle, centerX, centerY) {
		var x,
			y,
			i;
		if (typeof angle === 'number' && !isNaN(angle)) {
			if (centerX === undefined && centerY === undefined) {
				this._firstAngle += angle;
				this.calculatePointsCoords();
			}
			else {
				angle *= Math.PI / 180;
				for (i = 0; i < this._points.length; i++) {
					x = this._points[i].x * Math.cos(angle) - this._points[i].y * Math.sin(angle) - centerX * (Math.cos(angle) - 1) + centerY * Math.sin(angle);
					y = this._points[i].x * Math.sin(angle) + this._points[i].y * Math.cos(angle) - centerX * Math.sin(angle) - centerY * (Math.cos(angle) - 1);
					this._points[i].x = x;
					this._points[i].y = y;
				}
				x = this._center.x * Math.cos(angle) - this._center.y * Math.sin(angle) - centerX * (Math.cos(angle) - 1) + centerY * Math.sin(angle);
				y = this._center.x * Math.sin(angle) + this._center.y * Math.cos(angle) - centerX * Math.sin(angle) - centerY * (Math.cos(angle) - 1);
				this._center.x = x;
				this._center.y = y;
				this.calculateFirstAngle();
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.RegpolyModel.rotate()-method.');
		}
	},
	getRegion: function () {
		var i,
			left = this._points[0].x,
			top = this._points[0].y,
			right = this._points[0].x,
			bottom = this._points[0].y;
		for (i = 1; i < this._points.length; i++) {
			if (this._points[i].x < left) {
				left = this._points[i].x;
			}
			else {
				if (this._points[i].x > right) {
					right = this._points[i].x;
				}
			}
			if (this._points[i].y < top) {
				top = this._points[i].y;
			}
			else {
				if (this._points[i].y > bottom) {
					bottom = this._points[i].y;
				}
			}
		}
		return {
			l: left - this._thickness / 2,
			t: top - this._thickness / 2,
			w: right - left + this._thickness,
			h: bottom - top + this._thickness
		};
	},
	getCenter: function () {
		return this._center;
	},
	getRadius: function () {
		return this._radius;
	},
	getTempCenter: function () {
		return this._tempCenter;
	},
	getAnglesCount: function () {
		return this._anglesCount;
	},
	getFirstAngle: function () {
		return this._firstAngle;
	},
	getThickness: function () {
		return this._thickness;
	},
	getFillColor: function () {
		return this._fillColor;
	},
	getPoints: function () {
		return this._points;
	},
	getPoint: function (i) {
		if (i >= 0 && i <= this._points.length) {
			if (this._points[i]) {
				return this._points[i];
			}
		}
		GL.raiseException('ERROR', 'Wrong value provided to GL.RectModel.getPoint()-method.');
	},
	moveCenterTo: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			this._center.x = x;
			this._center.y = y;
			this.calculatePointsCoords();
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.moveCenterTo()-method.');
		}
	},
	moveTempCenterTo: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			this._tempCenter.x = x;
			this._tempCenter.y = y;
			this.calculatePointsCoords();
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.moveTempCenterTo()-method.');
		}
	},
	shift: function (x, y) {
		if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			this._center.x += x;
			this._center.y += y;
			this.calculatePointsCoords();
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.shift()-method.');
		}
	},
	setFillColor: function (red, green, blue, alpha) {
		if (red >= 0 && green >= 0 && blue >= 0 && alpha >= 0.0 && red <= 255 && green <= 255 && blue <= 255 && alpha <= 1.0 &&
		   typeof red === 'number' && typeof green === 'number' && typeof blue === 'number' && typeof alpha === 'number') {
			this._fillColor.r = red;
			this._fillColor.g = green;
			this._fillColor.b = blue;
			this._fillColor.a = alpha;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.setFillColor()-method.');
		}
	},
	setRadius: function (r) {
		if (typeof r === 'number' && r >= 0 && !isNaN(r)) {
			this._radius = r;
			this.calculatePointsCoords();
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.RegpolyModel.setRadius()-method.');
		}
	},
	setFirstAngle: function (angle, sign) {
		if (typeof angle !== 'number' || isNaN(angle)) {
			angle = sign === 1 ? 0 : 180;
		}
		this._firstAngle = angle;
	},
	fixRegpoly: function () {
		this._center.x = this._tempCenter.x;
		this._center.y = this._tempCenter.y;
		this._tempCenter = { x: undefined, y: undefined };
		this.calculatePointsCoords();
	},
	setThickness: function (t) {
		if (typeof t === 'number' && t >= 0) {
			this._thickness = t;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyModel.setThickness()-method.');
		}
	},
	getData: function (asObject) {
		var jsonObject = GL.extend({
			center: this._center,
			radius: this._radius,
			anglesCount: this._anglesCount,
			firstAngle: this._firstAngle,
			thickness: this._thickness,
			fillColor: this._fillColor,
			lineType: this._lineType
		},
			this._base.getData.call(this, true));
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}
};

//GL.inherit(GL.ObjectBase, GL.RegpolyModel);
(function () {
	(function inheritObjectBase() {
		if (!GL.ObjectBase) {
			GL.defer(inheritObjectBase, 0);
			return;
		}
		GL.inherit(GL.ObjectBase, GL.RegpolyModel);
	}());
}());