GL.RectView = function (rectModel, device) {

	this.setModel = function (newModel) {
		if (newModel) {
			rectModel = newModel;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectView.setModel()-method.');
		}
	};
	this.getModel = function () {
		return rectModel;
	};
	this.fixTempLeftTop = function (event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		rectModel.moveTempLeftTopTo(coords.x, coords.y);
	};
	this.render = function (drawOnForeground) {
		device.draw(rectModel.getAttributes(), drawOnForeground);
	};
	this.draw = function (drawOnForeground, event) {
		var coords = device.getCoords(event.layerX, event.layerY),
			attributes = rectModel.getAttributes(),
			tempLeft = GL.isNumber(attributes.tempLeftTop.x) ? attributes.tempLeftTop.x : attributes.points[0].x,
			tempTop = GL.isNumber(attributes.tempLeftTop.y) ? attributes.tempLeftTop.y : attributes.points[0].y;
		attributes.points = [{ x: tempLeft, y: tempTop },
								{ x: coords.x, y: tempTop },
								{ x: coords.x, y: coords.y },
								{ x: tempLeft, y: coords.y }];
		if (drawOnForeground) {
			this.clear(true);
		}
		device.draw(attributes, drawOnForeground);
	};
	this.fixRect = function (event) {
		var coords = device.getCoords(event.layerX, event.layerY);
		rectModel.moveTempRightBottomTo(coords.x, coords.y);
		this.clear(true);
		device.draw(rectModel.getAttributes(), false);
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