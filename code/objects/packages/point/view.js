GL.PointView = function (pointModel, device) {

	this.setModel = function (newModel) {
		if (newModel) {
			pointModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointView.setModel()-method.');
		}
	};
	this.getModel = function () {
		return pointModel;
	};
	this.draw = function (fore_or_back, movePoint, event) {
		if (GL.isNumber(event.clientX) && GL.isNumber(event.clientY) && movePoint) {
			var coords = device.getCoords(event.layerX, event.layerY);
			pointModel.moveTo(coords.x, coords.y);
		}
		device.draw(pointModel.getAttributes(), fore_or_back === 'fore' ? device.FORE : device.BACK);
	};
	this.render = function (fore_or_back) {
		device.draw(pointModel.getAttributes(), fore_or_back === 'fore' ? device.FORE : device.BACK, false);
	};
	this.bindParentEventToFunc = function bindLayerEventToFunc(event, func) {
		device.connect(event, func);
	};
	this.unleashParentEvent = function unleashParentEvent(event, func) {
		device.disconnect(event, func);
	};
	this.clear = function clear(fore_or_back) {
		device.clear(fore_or_back === 'fore' ? device.FORE : device.BACK);
	};

};