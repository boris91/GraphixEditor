//{ id, name, visible, active, children, childrenOrder, allowSubLayers }
GL.LayerModel = function GL_LayerModel(attributes) {
	attributes = attributes ? ('string' === typeof attributes ? JSON.parse(attributes) : attributes) : {};
	this._id = attributes.id || 'layer_' + GL.generateUniqueId();
	this._name = (attributes.name && 'string' === typeof attributes.name) ? attributes.name : 'Untitled';
	this._type = 'layer';
	this._createdOn = attributes.createdOn ? new Date(attributes.createdOn) : new Date();
	this._children = {};
	this._childrenOrder = new GL.OrdersHash();
	this._visible = !!attributes.visible;
	this._active = !!attributes.active;
	this._allowSubLayers = attributes.allowSubLayers || false;
	if (attributes.children) {
		this.addRange(attributes.children, attributes.childrenOrder);
	}
	this._getters = {
		id: 'getId',
		name: 'getName',
		createdOn: 'getCreationDate',
		count: 'getCount',
		visible: 'isVisible',
		active: 'isActive',
		type: 'getType',
		empty: 'isEmpty',
		data: 'getData',
		subLayers: 'areSubLayersAllowed',
		children: 'getChildren',
		childrenOrder: 'getChildrenOrder'
	};
	this._setters = {
		name: 'setName',
		visible: 'toggleVisibility',
		active: 'toggleActivity',
		subLayers: 'allowSubLayers'
	};
};

GL.LayerModel.prototype = {
	range: function (action, arg1) {
		var i,
			j,
			args,
			result = [];
		for (i = 0; i < arg1.length; i++) {
			args = [];
			for (j = 1; j < arguments.length; j++) {
				args.push(arguments[j][i]);
			}
			result.push(this[action].apply(this, args));
		}
		return result;
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

	getName: function (id) {
		return this._name;
	},

	getCreationDate: function (id) {
		return this._createdOn;
	},

	getAttributes: function () {
		return {
			type: this._type,
			id: this._id,
			name: this._name,
			createdOn: new Date(this._createdOn),
			visible: this._visible,
			active: this._active,
			children: this._children
		};
	},

	getCount: function () {
		var count = 0,
			i;
		for (i in this._children) {
			count++;
		}
		return count;
	},

	getOrder: function (id) {
		return this._childrenOrder.get(id) || -1;
	},

	areSubLayersAllowed: function () {
		return this._allowSubLayers;
	},

	isVisible: function () {
		return this._visible;
	},

	isActive: function () {
		return this._active;
	},

	getType: function (id) {
		return this._type;
	},

	hasType: function (value) {
		return value === this._type;
	},

	getChildren: function (exceptFor) {
		return this._children;
	},

	isEmpty: function () {
		return 0 === this.getCount();
	},

	setName: function (value) {
		if (value && 'string' === typeof value) {
			this._name = value;
		}
	},

	allowSubLayers: function (value) {
		if ('boolean' !== typeof value) {
			this._allowSubLayers = this._allowSubLayers ? false : true;
		} else {
			this._allowSubLayers = value;
		}
	},

	setOrder: function (id, order) {
		this._childrenOrder.set(id, order);
	},

	toggleVisibility: function (value) {
		if ('boolean' !== typeof value) {
			this._visible = this._visible ? false : true;
		} else {
			this._visible = value;
		}
	},

	toggleActivity: function (value) {
		if ('boolean' !== typeof value) {
			this._active = this._active ? false : true;
		} else {
			this._active = value;
		}
	},

	addRange: function (children, childrenOrder) {
		childrenOrder = childrenOrder || [];
		for (var id in children) {
			this.add(id, childrenOrder.indexOf(id));
		}
	},

	add: function (id, order) {
		if (!this._children[id]) {
			this._children[id] = true;
			this._childrenOrder.add(id, order);
		} else {
			GL.raiseException('Error', 'child already exists', 'object[' + id + '] already exists in layer[' + this._id + ']');
		}
	},

	remove: function (id) {
		delete this._children[id];
		this._childrenOrder.remove(id);
	},

	clear: function () {
		var id;
		for (id in this._children) {
			delete this._children[id];
		}
		this._childrenOrder.clear();
	},

	getData: function (asObject) {
		var jsonObject = {
			type: this._type,
			id: this._id,
			name: this._name,
			createdOn: this._createdOn,
			visible: this._visible,
			active: this._active,
			allowSubLayers: this._allowSubLayers,
			children: this._children,
			childrenOrder: this._childrenOrder.getAll(),
			jsoned: true
		};
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}
};