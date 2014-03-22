GL.Settings = function GL_Settings() {
	var _forSelectOperations = {
		shiftFactor: 1,
		resizeFactor: 1,
		rotateFactor: 1
	},
	    _forObjects = {
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
			    [5, 2]
	    	],
	    	penWidth: 10,
	    	anglesCount: 5,
	    	firstAngle: -90
	    },
	    _hexToRgb = function (hex) {
	    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    	return result ? {
	    		r: parseInt(result[1], 16),
	    		g: parseInt(result[2], 16),
	    		b: parseInt(result[3], 16)
	    	} : null;
	    };

	return {
		getForSelectOperations: function () {
			return _forSelectOperations;
		},
		getForObjects: function () {
			return _forObjects;
		},
		setShiftFactor: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
				_forSelectOperations.shiftFactor = value;
			}
		},
		setResizeFactor: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
				_forSelectOperations.resizeFactor = value;
			}
		},
		setRotateFactor: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
				_forSelectOperations.rotateFactor = value;
			}
		},
		setColor: function (r, g, b, a) {
			if (typeof r === 'number' && !isNaN(r) && r >= 0 && r <= 255 &&
			    typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 255 &&
			    typeof b === 'number' && !isNaN(b) && b >= 0 && b <= 255 &&
			    typeof a === 'number' && !isNaN(a) && a >= 0 && a <= 255) {
				_forObjects.color.r = r;
				_forObjects.color.g = g;
				_forObjects.color.b = b;
				_forObjects.color.a = a;
			}
		},
		setColorRgb: function (hex) {
			var rgb = _hexToRgb(hex),
			    color = _forObjects.color;
			color.r = rgb.r;
			color.g = rgb.g;
			color.b = rgb.b;
		},
		setColorAlpha: function (value) {
			_forObjects.color.a = value;
		},
		setFillColor: function (r, g, b, a) {
			if (typeof r === 'number' && !isNaN(r) && r >= 0 && r <= 255 &&
			    typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 255 &&
			    typeof b === 'number' && !isNaN(b) && b >= 0 && b <= 255 &&
			    typeof a === 'number' && !isNaN(a) && a >= 0 && a <= 255) {
				_forObjects.fillColor.r = r;
				_forObjects.fillColor.g = g;
				_forObjects.fillColor.b = b;
				_forObjects.fillColor.a = a;
			}
		},
		setFillColorRgb: function (hex) {
			var rgb = _hexToRgb(hex),
			    fillColor = _forObjects.fillColor;
			fillColor.r = rgb.r;
			fillColor.g = rgb.g;
			fillColor.b = rgb.b;
		},
		setFillColorAlpha: function (value) {
			_forObjects.fillColor.a = value;
		},
		setLineType: function (value) {
			if (typeof value === 'object' && 'length' in value && value.length > 0 && typeof value[0] === 'string' && value[0].toUpperCase() in GL.LineTypesEnum) {
				_forObjects.lineType[0] = value[0] + '';
				if (value[0] === GL.LineTypesEnum.DASHED && value[1] && 'length' in value[1] && value.length === 2 &&
				    typeof value[1][0] === 'number' && !isNaN(value[1][0]) && value[1][0] > 0 && value[1][0] <= 100 &&
				    typeof value[1][1] === 'number' && !isNaN(value[1][1]) && value[1][1] > 0 && value[1][1] <= 100) {
					_forObjects.lineType[1][0] = value[1][0];
					_forObjects.lineType[1][1] = value[1][1];
				}
			}
		},
		setLineTypeSolidOrDashed: function (value /* true for DASHED, false for SOLID */) {
			_forObjects.lineType[0] = GL.LineTypesEnum[value ? "DASHED" : "SOLID"];
		},
		setLineTypeFillLength: function (value) {
			if ('number' === typeof value) {
				_forObjects.lineType[1][0] = value;
			}
		},
		setLineTypeEmptyLength: function (value) {
			if ('number' === typeof value) {
				_forObjects.lineType[1][1] = value;
			}
		},
		setPenWidth: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value > 0 && value <= 100) {
				_forObjects.penWidth = value;
			}
		},
		setAnglesCount: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value >= 3 && value <= 100) {
				_forObjects.anglesCount = value;
			}
		},
		setFirstAngle: function (value) {
			if (typeof value === 'number' && !isNaN(value) && value >= -180 && value <= 180) {
				_forObjects.firstAngle = value;
			}
		},
		getShiftFactor: function () {
			return _forSelectOperations.shiftFactor;
		},
		getResizeFactor: function () {
			return _forSelectOperations.resizeFactor;
		},
		getRotateFactor: function () {
			return _forSelectOperations.rotateFactor;
		},
		getColor: function () {
			return {
				r: _forObjects.color.r,
				g: _forObjects.color.g,
				b: _forObjects.color.b,
				a: _forObjects.color.a
			};
		},
		getFillColor: function () {
			return {
				r: _forObjects.fillColor.r,
				g: _forObjects.fillColor.g,
				b: _forObjects.fillColor.b,
				a: _forObjects.fillColor.a
			};
		},
		getLineType: function () {
			return [
			    _forObjects.lineType[0],
			    [
				    _forObjects.lineType[1][0],
				    _forObjects.lineType[1][1]
			    ]
			];
		},
		getPenWidth: function () {
			return _forObjects.penWidth;
		},
		getAnglesCount: function () {
			return _forObjects.anglesCount;
		},
		getFirstAngle: function () {
			return _forObjects.firstAngle;
		}
	};
};