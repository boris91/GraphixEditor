//GL.ObjectBase: { type, name, color, order, visible }
GL.ObjectBase = function GL_ObjectBase(attributes) {
	this._id = attributes.id || attributes.type + '_' + GL.generateUniqueId();
	this._type = attributes.type || 'untyped';
	this._name = attributes.name || 'Untitled';
	this._createdOn = attributes.createdOn ? new Date(attributes.createdOn) : new Date();
	this._color = attributes.color || {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	};
	this._visible = ('boolean' === typeof attributes.visible) ? attributes.visible : true;
	this._order = ('number' === typeof attributes.order) ? attributes.order : -1;
	this._selected = false;

	this._getters = {
		id: 'getId',
		type: 'getType',
		name: 'getName',
		createdOn: 'getCreationDate',
		color: 'getColor',
		visible: 'isVisible',
		selected: 'isSelected',
		order: 'getOrder',
		crosses: 'crossesRegion',
		inRegion: 'isInRegion',
		data: 'getData'
	};

	this._setters = {
		name: 'setName',
		color: 'setColor',
		visible: 'toggleVisibility',
		selected: 'toggleSelection',
		order: 'setOrder'
	};
};

GL.ObjectBase.prototype = {
	getAttributes: function () {
		return {
			id: this._id,
			type: this._type,
			name: this._name,
			createdOn: new Date(this._createdOn),
			color: {
				r: this._color.r,
				g: this._color.g,
				b: this._color.b,
				a: this._color.a
			},
			visible: this._visible,
			order: this._order,
			selected: this._selected
		};
	},
	get: function (key) {
		return this[this._getters[key]].apply(this, Array.prototype.slice.call(arguments, 1));
	},
	set: function (key) {
		this[this._setters[key]].apply(this, Array.prototype.slice.call(arguments, 1));
	},
	getId: function () {
		return this._id;
	},
	getType: function () {
		return this._type;
	},
	hasType: function (value) {
		return value === this._type;
	},
	getName: function () {
		return this._name;
	},
	getCreationDate: function () {
		return new Date(this._createdOn);
	},
	getColor: function () {
		return {
			r: this._color.r,
			g: this._color.g,
			b: this._color.b,
			a: this._color.a
		};
	},
	isInRegion: function (l, t, w, h) {
		var region = this.getRegion();
		return region.l >= l && region.t >= t && region.l + region.w <= (l + w) && region.t + region.h <= (t + h);
	},
	crossesRegion: function (l, t, w, h) {
		var region = this.getRegion();
		return (
			l <= region.l && region.l <= (l + w) ||
			region.l <= l && l <= (region.l + region.w)
		) && (
			t <= region.t && region.t <= (t + h) ||
			region.t <= t && t <= (region.t + region.h)
		);
	},
	isVisible: function () {
		return this._visible;
	},
	isSelected: function () {
		return this._selected;
	},
	getOrder: function () {
		return this._order;
	},
	setName: function (value) {
		if (value && 'string' === typeof value) {
			this._name = value;
		}
	},
	setColor: function (red, green, blue, alpha) {
		alpha = alpha || 1.0;
		if (typeof red === 'number' && typeof green === 'number' && typeof blue === 'number' && typeof alpha === 'number' &&
			red >= 0 && green >= 0 && blue >= 0 && alpha >= 0.0 && red <= 255 && green <= 255 && blue <= 255 && alpha <= 1.0) {
			this._color.r = red;
			this._color.g = green;
			this._color.b = blue;
			this._color.a = alpha;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.ObjectBase.setColor()-method.');
		}
	},
	toggleVisibility: function (value) {
		if (typeof value !== 'boolean') {
			this._visible = this._visible ? false : true;
		}
		else {
			this._visible = value;
		}
	},
	toggleSelection: function (value) {
		if (typeof value !== 'boolean') {
			this._selected = this._selected ? false : true;
		}
		else {
			this._selected = value;
		}
	},
	setOrder: function (value) {
		if (typeof value === 'number' && Math.round(value) === value && value >= -1) {
			this._order = value;
		} else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.ObjectBase.setOrder()-method.');
		}
	},
	getData: function (asObject) {
		var jsonObject = {
			id: this._id,
			type: this._type,
			name: this._name,
			createdOn: this._createdOn,
			color: this._color,
			visible: this._visible,
			order: this._order,
			selected: this._selected
		};
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}
};