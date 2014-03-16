GL.Settings = function GL_Settings () {
	this._forSelectOperations = {
		shiftFactor: 1,
		resizeFactor: 1,
		rotateFactor: 1
	};
	this._forObjects = {
		color: {
			r: 0,
			g: 0,
			b: 0,
			a: 1
		},
		fillColor: {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		},
		lineType: [
			GL.LineTypesEnum.SOLID,
			[5,2]
		],
		penWidth: 10,
		anglesCount: 5,
		firstAngle: -90
	};
};

GL.Settings.prototype = {
	_hexToRgb: function (hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	},
	getForSelectOperations: function () {
		return this._forSelectOperations;
	},
	getForObjects: function () {
		return this._forObjects;
	},
	setShiftFactor: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
			this._forSelectOperations.shiftFactor = value;
		}
	},
	setResizeFactor: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
			this._forSelectOperations.resizeFactor = value;
		}
	},
	setRotateFactor: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
			this._forSelectOperations.rotateFactor = value;
		}
	},
	setColor: function (r, g, b, a) {
		if (typeof r === 'number' && !isNaN(r) && r >= 0 && r <= 255 &&
			typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 255 &&
			typeof b === 'number' && !isNaN(b) && b >= 0 && b <= 255 &&
			typeof a === 'number' && !isNaN(a) && a >= 0 && a <= 255) {
			this._forObjects.color.r = r;
			this._forObjects.color.g = g;
			this._forObjects.color.b = b;
			this._forObjects.color.a = a;
		}
	},
	setColorRgb: function (hex) {
		var rgb = this._hexToRgb(hex),
			color = this._forObjects.color;
		color.r = rgb.r;
		color.g = rgb.g;
		color.b = rgb.b;
	},
	setColorAlpha: function (value) {
		this._forObjects.color.a = value;
	},
	setFillColor: function (r, g, b, a) {
		if (typeof r === 'number' && !isNaN(r) && r >= 0 && r <= 255 &&
			typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 255 &&
			typeof b === 'number' && !isNaN(b) && b >= 0 && b <= 255 &&
			typeof a === 'number' && !isNaN(a) && a >= 0 && a <= 255) {
			this._forObjects.fillColor.r = r;
			this._forObjects.fillColor.g = g;
			this._forObjects.fillColor.b = b;
			this._forObjects.fillColor.a = a;
		}
	},
	setFillColorRgb: function (hex) {
		var rgb = this._hexToRgb(hex),
			fillColor = this._forObjects.fillColor;
		fillColor.r = rgb.r;
		fillColor.g = rgb.g;
		fillColor.b = rgb.b;
	},
	setFillColorAlpha: function (value) {
		this._forObjects.fillColor.a = value;
	},
	setLineType: function (value) {
		if (typeof value === 'object' && 'length' in value && value.length > 0 && typeof value[0] === 'string' && value[0].toUpperCase() in GL.LineTypesEnum) {
			this._forObjects.lineType[0] = value[0]+'';
			if (value[0] === GL.LineTypesEnum.DASHED && value[1] && 'length' in value[1] && value.length === 2 &&
				typeof value[1][0] === 'number' && !isNaN(value[1][0]) && value[1][0] > 0 && value[1][0] <= 100 &&
				typeof value[1][1] === 'number' && !isNaN(value[1][1]) && value[1][1] > 0 && value[1][1] <= 100) {
				this._forObjects.lineType[1][0] = value[1][0];
				this._forObjects.lineType[1][1] = value[1][1];
			}
		}
	},
	setLineTypeSolidOrDashed: function (value /* true for DASHED, false for SOLID */) {
		this._forObjects.lineType[0] = GL.LineTypesEnum[value ? "DASHED" : "SOLID"];
	},
	setLineTypeFillLength: function (value) {
		if ('number' === typeof value) {
			this._forObjects.lineType[1][0] = value;
		}
	},
	setLineTypeEmptyLength: function (value) {
		if ('number' === typeof value) {
			this._forObjects.lineType[1][1] = value;
		}
	},
	setPenWidth: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
			this._forObjects.penWidth = value;
		}
	},
	setAnglesCount: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value >= 3 && value <= 100) {
			this._forObjects.anglesCount = value;
		}
	},
	setFirstAngle: function (value) {
		if (typeof value === 'number' && !isNaN(value) && value >= -180 && value <= 180) {
			this._forObjects.firstAngle = value;
		}
	},
	getShiftFactor: function () {
		return this._forSelectOperations.shiftFactor;
	},
	getResizeFactor: function () {
		return this._forSelectOperations.resizeFactor;
	},
	getRotateFactor: function () {
		return this._forSelectOperations.rotateFactor;
	},
	getColor: function () {
		return {
			r: this._forObjects.color.r,
			g: this._forObjects.color.g,
			b: this._forObjects.color.b,
			a: this._forObjects.color.a
		};
	},
	getFillColor: function () {
		return {
			r: this._forObjects.fillColor.r,
			g: this._forObjects.fillColor.g,
			b: this._forObjects.fillColor.b,
			a: this._forObjects.fillColor.a
		};
	},
	getLineType: function () {
		return [
			this._forObjects.lineType[0],
			[
				this._forObjects.lineType[1][0],
				this._forObjects.lineType[1][1]
			]
		];
	},
	getPenWidth: function () {
		return this._forObjects.penWidth;
	},
	getAnglesCount: function () {
		return this._forObjects.anglesCount;
	},
	getFirstAngle: function () {
		return this._forObjects.firstAngle;
	}
};