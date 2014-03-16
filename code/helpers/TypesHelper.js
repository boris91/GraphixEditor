GL.TypesHelper = function GL_TypesHelper() {
};

GL.TypesHelper.prototype = {
	exists: function (value) {
		var stringView = Object.prototype.toString.call(value);
		return stringView !== '[object Null]' && stringView !== '[object Undefined]';
	},
	isBoolean: function (value) {
		return Object.prototype.toString.call(value) === '[object Boolean]';
	},
	isString: function (value) {
		return Object.prototype.toString.call(value) === '[object String]';
	},
	isNotEmptyString: function (value) {
		return (Object.prototype.toString.call(value) === '[object String]' && value);
	},
	isFunction: function (value) {
		return Object.prototype.toString.call(value) === '[object Function]';
	},
	isObject: function (value) {
		return Object.prototype.toString.call(value) === '[object Object]';
	},
	isNumber: function (value) {
		return (Object.prototype.toString.call(value) === '[object Number]' && !isNaN(value) && isFinite(value));
	},
	isArray: function (value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	},
	isCanvasElement: function (value) {
		return value.toString() === '[object HTMLCanvasElement]';
	},
	isCanvasContext2D: function (value) {
		return value.toString() === '[object CanvasRenderingContext2D]';
	},
	hasType: function (value, typeName) {
		return Object.prototype.toString.call(value) === '[object ' + typeName.slice(0, 1).toUpperCase() + typeName.slice(1).toLowerCase() + ']';
	},
	haveType: function (values, typeName) {
		var i;
		for (i = 0; i < values.length; i++) {
			if (!this.hasType(values[i], typeName)) {
				return false;
			}
		}
		return true;
	},
	typeOf: function (object) {
		if (this.isObject(object)) {
			return object.getType ? '[object ' + object.getType() + ']' : '[object Object]';
		}
	},
	isLimited: function (value, comparers, strictly) {
		if (this.isNumber(value) && this.isArray(comparers) && comparers.length >= 2 && this.isNumber(comparers[0]) && this.isNumber(comparers[1])) {
			return strictly ? (value > Math.min(comparers[0], comparers[1]) && value < Math.max(comparers[0], comparers[1])) : (value >= Math.min(comparers[0], comparers[1]) && value <= Math.max(comparers[0], comparers[1]));
		}
	},
	objectHasProperty: function (object, property, own) {
		if (this.isObject(object) && this.isNotEmptyString(property)) {
			return own ? object.hasOwnProperty(property) : property in object;
		} else {
			GL.raiseException(this.exceptionTypes.invalidArguments, 'GL.objectHasProperties');
		}
	},
	objectHasAllProperties: function (object, properties, own) {
		if (this.isObject(object) && this.isArray(properties)) {
			var i;
			own = own || [];
			for (i = 0; i < properties.length; i++) {
				if (!this.objectHasProperty(object, properties[i], own[i])) {
					return false;
				}
			}
			return true;
		} else {
			GL.raiseException(this.exceptionTypes.invalidArguments, 'GL.objectHasProperties');
		}
	}
};