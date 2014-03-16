GL.OrdersHash = function GL_OrdersHash(order, collectionByIds) {
	order = ('object' === typeof order ? order : (order ? JSON.parse(order) : []));
	if (0 === order.length && collectionByIds) {
		for (var i in collectionByIds) {
			order.push(i);
		}
	}

	function _getIndex (key) {
		return ('number' === typeof key ? (key < order.length && key >= 0 ? key : -1) : order.indexOf(key));
	}

	this.exists = function (key) {
		return (order.indexOf(key) > -1 || 'undefined' !== typeof order[key]);
	};
	this.add = function (id, index) {
		order.push(id);
		if ('number' === typeof index) {
			this.set(id, index);
		}
	};
	this.get = function (index) {
		return order[_getIndex(index)];
	};
	this.set = function (key, index) {
		if (index >= 0 && index < order.length) {
			order.splice(index, 0, this.remove(key)[0]);
		}
	};
	this.remove = function (index) {
		return order.splice(_getIndex(index), 1);
	};
	this.getAll = function () {
		return order;
	};
	this.clear = function () {
		order = [];
	};
};