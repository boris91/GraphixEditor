GL.RegpolyView = function (regpolyModel, device) {

	this.setModel = function(newModel) {
		if(newModel) {
			regpolyModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RegpolyView.setModel()-method.');
		}
	};
	this.getModel = function() {
		return regpolyModel;
	};
	this.fixTempCenter = function (event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		regpolyModel.moveTempCenterTo(coords.x, coords.y);
	};
	this.render = function () {
		device.draw(regpolyModel.getAttributes());
	};
	this.draw = function (fore_or_back, event) {
		var attributes = regpolyModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY),
			x = coords.x - (GL.isNumber(attributes.tempCenter.x) ? attributes.tempCenter.x : attributes.center.x),
			y = coords.y - (GL.isNumber(attributes.tempCenter.y) ? attributes.tempCenter.y : attributes.center.y);
		if(fore_or_back === 'fore') {
			this.clear('fore');
		}
		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;
		regpolyModel.setRadius(x < y ? x : y);
		device.draw(regpolyModel.getAttributes(), 'fore' === fore_or_back ? device.FORE : device.BACK);
	};
	this.fixRegpoly = function (event) {
		var attributes = regpolyModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY),
			x = coords.x - (GL.isNumber(attributes.tempCenter.x) ? attributes.tempCenter.x : attributes.center.x),
			y = coords.y - (GL.isNumber(attributes.tempCenter.y) ? attributes.tempCenter.y : attributes.center.y);
		this.clear('fore');
		x = x < 0 ? -x : x;
		y = y < 0 ? -y : y;
		regpolyModel.setRadius(x < y ? x : y);
		regpolyModel.fixRegpoly();
		this.clear('fore');
		device.draw(regpolyModel.getAttributes(), device.BACK);
	};
	this.bindParentEventToFunc = function (event, func) {
		device.connect(event, func);
	};
	this.unleashParentEvent = function (event, func) {
		device.disconnect(event, func);
	};
	this.clear = function (fore_or_back) {
		device.clear('fore' === fore_or_back ? device.FORE : device.BACK);
	};

};