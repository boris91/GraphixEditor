GL.LineView = function (lineModel, device) {

	this.setModel = function(newModel) {
		if(newModel) {
			lineModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.LineView.setModel()-method.');
		}
	};
	this.getModel = function() {
		return lineModel;
	};
	this.fixTemp1 = function fixTemp1(event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		lineModel.moveTemp1To(coords.x, coords.y);
	};
	this.render = function () {
		device.draw(lineModel.getAttributes());
	};
	this.draw = function (fore_or_back, event) {
		if(fore_or_back === 'fore') {
			device.clear(device.FORE);
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
		device.draw(attributes, fore_or_back === 'fore' ? device.FORE : device.BACK);
	};
	this.fixLine = function fixLine(event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		lineModel.moveTemp2To(coords.x, coords.y);
		device.clear(device.FORE);
		device.draw(lineModel.getAttributes(), device.BACK);
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