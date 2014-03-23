GL.RegpolyView = function (regpolyModel, device) {

	this.setModel = function (newModel) {
		if (newModel) {
			regpolyModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyView.setModel()-method.');
		}
	};
	this.getModel = function () {
		return regpolyModel;
	};
	this.fixTempCenter = function (event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		regpolyModel.moveTempCenterTo(coords.x, coords.y);
	};
	this.render = function (drawOnForeground) {
		device.draw(regpolyModel.getAttributes(), drawOnForeground);
	};
	this.draw = function (drawOnForeground, event) {
		var attributes = regpolyModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY),
			x = coords.x - (GL.isNumber(attributes.tempCenter.x) ? attributes.tempCenter.x : attributes.center.x),
			y = coords.y - (GL.isNumber(attributes.tempCenter.y) ? attributes.tempCenter.y : attributes.center.y);
		if (drawOnForeground) {
			this.clear(true);
		}
		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;
		regpolyModel.setRadius(x < y ? x : y);
		device.draw(regpolyModel.getAttributes(), drawOnForeground);
	};
	this.fixRegpoly = function (event) {
		var attributes = regpolyModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY),
			x = coords.x - (GL.isNumber(attributes.tempCenter.x) ? attributes.tempCenter.x : attributes.center.x),
			y = coords.y - (GL.isNumber(attributes.tempCenter.y) ? attributes.tempCenter.y : attributes.center.y);
		this.clear(true);
		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;
		regpolyModel.setRadius(x < y ? x : y);
		regpolyModel.fixRegpoly();
		this.clear(true);
		device.draw(regpolyModel.getAttributes(), false);
	};
	this.bindParentEventToFunc = function (event, func) {
		device.connect(event, func);
	};
	this.unleashParentEvent = function (event, func) {
		device.disconnect(event, func);
	};
	this.clear = function (drawOnForeground) {
		device.clear(drawOnForeground);
	};

};