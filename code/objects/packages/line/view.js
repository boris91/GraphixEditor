GL.LineView = function (lineModel, device) {

	this.setModel = function (newModel) {
		if (newModel) {
			lineModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineView.setModel()-method.');
		}
	};
	this.getModel = function () {
		return lineModel;
	};
	this.fixTemp1 = function fixTemp1(event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		lineModel.moveTemp1To(coords.x, coords.y);
	};
	this.render = function (drawOnForeground) {
		device.draw(lineModel.getAttributes(), drawOnForeground);
	};
	this.draw = function (drawOnForeground, event) {
		if (drawOnForeground) {
			device.clear(true);
		}
		var attributes = lineModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY);

		if (GL.isNumber(attributes.tempX)) {
			attributes.x1 = attributes.tempX;
			attributes.y1 = attributes.tempY;
		} else {
			attributes.x1 = attributes.x1;
			attributes.y1 = attributes.y1;
		}
		attributes.x2 = coords.x;
		attributes.y2 = coords.y;
		device.draw(attributes, drawOnForeground);
	};
	this.fixLine = function fixLine(event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		lineModel.moveTemp2To(coords.x, coords.y);
		device.clear(true);
		device.draw(lineModel.getAttributes(), false);
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