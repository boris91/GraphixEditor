GL.DomHelper = function GL_DomHelper(windowObj) {
	this._document = windowObj.document || window.document;
};

GL.DomHelper.prototype = {
	setDocument: function (documentObj) {
		this._document = documentObj;
	},
	create: function (tagName, params/*{ attributes, properties, listeners }*/) {
		var element = this._document.createElement(tagName);
		if (params) {
			var attrs = params.attributes || {},
				props = params.properties || {},
				lists = params.listeners || [],
				i, j;
			for (i in attrs) {
				if ('object' !== typeof attrs[i]) {
					element.setAttribute(i, attrs[i] + '');
				} else {
					for (j in attrs[i]) {
						element[i][j] = attrs[i][j];
					}
				}
			}
			for (i in props) {
				element[i] = props[i];
			}
			for (i in lists) {
				for (j = 0; j < lists[i].length; j++) {
					element.addEventListener(i, lists[i][j], false);
				}
			}
		}
		return element;
	},
	add: function (tagName, params/*{ attributes, properties, listeners }*/, parentElem) {
		var element = this.create(tagName, params);
		parentElem = (('string' === typeof parentElem ? this._document.getElementById(parentElem) : parentElem) || this._document.body);
		parentElem.appendChild(element);
		return element;
	},
	remove: function (id) {
		var element = this._document.getElementById(id);
		element.parentElement.removeChild(element);
	},
	edit: function (id, attributesHashtable) {
		var element = this._document.getElementById(id),
			attribute;
		for (attribute in attributesHashtable) {
			element.setAttribute(attribute, attributesHashtable[attribute]);
		}
	},
	byId: function (id, doc) {
		return (doc || this._document).getElementById(id);
	},
	byName: function (name, doc, onlyFirst) {
		return onlyFirst ? (doc || this._document).getElementsByName(name)[0] : (doc || this._document).getElementsByName(name);
	},
	byTagName: function (tagName, doc, onlyFirst) {
		return onlyFirst ? (doc || this._document).getElementsByTagName(tagName)[0] : (doc || this._document).getElementsByTagName(tagName);
	},
	connect: function (target, eventType, handler) {
		target.addEventListener(eventType, handler, false);
		return /*eventInfo*/{
			eventType: eventType,
			handler: handler
		};
	},
	disconnect: function (target, eventInfo) {
		target.removeEventListener(eventInfo.eventType, eventInfo.handler);
	}
};