GL.SelectView = function (selectModel, device) {
	this.fixTempLeftTop = function(event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		selectModel.moveTempLeftTopTo(coords.x, coords.y);
	};
	this.draw = function (event) {
		var attributes = selectModel.getAttributes(),
			coords = device.getCoords(event.layerX, event.layerY);
		attributes.left = GL.isNumber(attributes.tempLeftTop.x) ? attributes.tempLeftTop.x : attributes.left;
		attributes.top = GL.isNumber(attributes.tempLeftTop.y) ? attributes.tempLeftTop.y : attributes.top;
		attributes.width = coords.x - attributes.left;
		attributes.height = coords.y - attributes.top;
		device.clear(device.FORE);
		device.draw(attributes, device.FORE);
	};
	this.fix = function (event) {
		if(GL.isNumber(event.clientX) && GL.isNumber(event.clientY)) {
			var coords = device.getCoords(event.layerX, event.layerY);
			selectModel.moveTempRightBottomTo(coords.x, coords.y);
		}
		device.clear(device.FORE);
	};
	this.bindParentEventToFunc = function bindLayerEventToFunc (event, func) {
		device.connect(event, func);
	};
	this.unleashParentEvent = function unleashParentEvent (event, func) {
		device.disconnect(event, func);
	};
	this.clear = function clear () {
		device.clear();
	};
};