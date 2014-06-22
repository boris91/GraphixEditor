GL.SelectView = function (selectModel, device) {
	var _selectModel = selectModel,
		_device = device;
	return {
		fixTempLeftTop: function (event) {
			var coords = _device.getCoords(event.layerX, event.layerY, true);
			_selectModel.moveTempLeftTopTo(coords.x, coords.y);
		},
		draw: function (event) {
			var attributes = _selectModel.getAttributes(),
				coords = _device.getCoords(event.layerX, event.layerY, true);
			attributes.left = GL.isNumber(attributes.tempLeftTop.x) ? attributes.tempLeftTop.x : attributes.left;
			attributes.top = GL.isNumber(attributes.tempLeftTop.y) ? attributes.tempLeftTop.y : attributes.top;
			attributes.width = coords.x - attributes.left;
			attributes.height = coords.y - attributes.top;
			_device.clear();
			_device.draw(attributes);
		},
		fix: function (event) {
			if (GL.isNumber(event.clientX) && GL.isNumber(event.clientY)) {
				var coords = _device.getCoords(event.layerX, event.layerY, true);
				_selectModel.moveTempRightBottomTo(coords.x, coords.y);
			}
			_device.clear();
		},
		bindParentEventToFunc: function bindLayerEventToFunc(event, func) {
			_device.connect(event, func);
		},
		unleashParentEvent: function unleashParentEvent(event, func) {
			_device.disconnect(event, func);
		},
		clear: function clear() {
			_device.clear();
		}
	};
};