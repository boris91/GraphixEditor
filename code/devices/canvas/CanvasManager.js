GL.CanvasManager = function GL_CanvasManager(data) {
	data = data || {};
	var self = this;

	this._onRedraw = data.onRedraw || function () { };

	this._back = data.back || new GL.Canvas({
		id: 'canvasBackground',
		forDom: {
			class: 'forBackCanvas',
			width: '700px',
			height: '300px'
		},
		parentId: 'totalLayer',
	});
	this._fore = data.fore || new GL.Canvas({
		id: 'canvasForeground',
		forDom: {
			class: 'forForeCanvas',
			width: '700px',
			height: '300px'
		},
		parentId: 'totalLayer'
	});
	this._extra = data.extra || new GL.Canvas({
		id: 'canvasExtra',
		forDom: {
			class: 'forExtraCanvas',
			width: '700px',
			height: '300px'
		},
		parentId: 'totalLayer',
		onZoom: zoom,
		onDrag: drag,
		onMove: move,
		onDrop: drop,
		onContextMenu: function () { },
		connectAll: true
	});
	this._stretcher = new GL.Stretcher({
		onMove: function (moveX, moveY) {
			self._back.restore();
			self._fore.restore();
			self._back.resizeOn(moveX, moveY);
			return self._fore.resizeOn(moveX, moveY);
		},
		onReDraw: self._onRedraw
	});

	//BINDING EVENT LISTENERS [CANVAS MANAGER HANDLE]
	function zoom(event) {
		var zoomOut = ('wheelDelta' in event ? -event.wheelDelta / 120 : event.detail / 3) > 0;
		self._back.clear();
		self._fore.clear();
		self._back.zoomAuto(zoomOut);
		self._fore.zoomAuto(zoomOut);
		self._onRedraw();
	}
	function drag(event) {
		if (('which' in event && event.which === 2) || event.button === 4) {
			self.moveX = event.layerX;
			self.moveY = event.layerY;
		}
	}
	function move(event) {
		var x = self._back.getCoordX(event.layerX).toFixed(2),
			y = self._back.getCoordY(event.layerY).toFixed(2);
		GL.DOM.byId('lblPosition').innerHTML = 'POS: ' + x + ', ' + y;
		if ('moveX' in self && 'moveY' in self) {
			var moveX = -(event.layerX - self.moveX) / self._back.getScaleX(),
				moveY = -(event.layerY - self.moveY) / self._back.getScaleY();
			self.moveX = event.layerX;
			self.moveY = event.layerY;
			self._back.clear();
			self._fore.clear();
			self._back.shift(moveX, moveY);
			self._fore.shift(moveX, moveY);
			self._onRedraw();
		}
	}
	function drop(event) {
		if (('which' in event && event.which === 2) || event.button === 4) {
			delete self.moveX;
			delete self.moveY;
		}
	}
};

GL.CanvasManager.prototype = {
	getScale: function (fromExtra) {
		var scale = this._getCanvas(fromExtra ? undefined : false).getScale();
		return {
			x: scale.x,
			y: scale.y
		};
	},

	getShift: function (fromExtra) {
		var shift = this._getCanvas(fromExtra ? undefined : false).getShift();
		return {
			x: shift.x,
			y: shift.y
		};
	},

	getCoords: function (layerX, layerY, fromExtra) {
		return {
			x: this._getCanvas(fromExtra ? undefined : false).getCoordX(layerX),
			y: this._getCanvas(fromExtra ? undefined : false).getCoordY(layerY)
		};
	},

	getDomParent: function (fromExtra) {
		return this._getCanvas(fromExtra ? undefined : false).getDomParent();
	},

	getRegion: function (fromExtra) {
		return this._getCanvas(fromExtra ? undefined : false).getRegion();
	},

	setScaleStep: function (scaleStep) {
		this._back.setScaleStep(scaleStep);
		this._fore.setScaleStep(scaleStep);
	},

	setShiftStep: function (shiftStep) {
		this._back.setShiftStep(shiftStep);
		this._fore.setShiftStep(shiftStep);
	},

	_getCanvas: function (requiredForeground) {
		var nickname = ('boolean' === typeof requiredForeground ? (requiredForeground ? '_fore' : '_back') : '_extra');
		return this[nickname];
	},

	restore: function (drawOnForeground) {
		this._getCanvas(drawOnForeground).restore();
	},

	clear: function (drawOnForeground) {
		this._getCanvas(drawOnForeground).clear();
	},

	clearAll: function () {
		this._back.clear();
		this._fore.clear();
		this._extra.clear();
	},

	draw: function (attributes, drawOnForeground) {
		this._getCanvas(drawOnForeground).draw(attributes.type, attributes);
	},

	connect: function (eventName, handler) {
		this._extra.connect(eventName, handler);
	},

	disconnect: function (eventName, handler) {
		this._extra.disconnect(eventName, handler);
	}
};