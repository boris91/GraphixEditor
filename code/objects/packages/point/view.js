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
	this.draw = function (drawOnForeground, movePoint, event) {
		if (GL.isNumber(event.clientX) && GL.isNumber(event.clientY) && movePoint) {
			var coords = device.getCoords(event.layerX, event.layerY);
			pointModel.moveTo(coords.x, coords.y);
		}
		device.draw(pointModel.getAttributes(), drawOnForeground);
	};
	this.render = function (drawOnForeground) {
		device.draw(pointModel.getAttributes(), drawOnForeground);
	};
	this.bindParentEventToFunc = function bindLayerEventToFunc(event, func) {
		device.connect(event, func);
	};
	this.unleashParentEvent = function unleashParentEvent(event, func) {
		device.disconnect(event, func);
	};
	this.clear = function clear(drawOnForeground) {
		device.clear(drawOnForeground);
	};

};