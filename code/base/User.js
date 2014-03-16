GL.User = function GL_User(defaultProps, objectsData) {
	var self = this;
	defaultProps = defaultProps || {};
	this._device = new GL.CanvasManager({
		onRedraw: (function (self, methodName) {
			return function () {
				self[methodName]();
			};
		})(this, "redrawAllObjects")
	});
	this._mode = defaultProps.mode || GL.ModesEnum.POINT;
	this._settings = new GL.Settings();
	this._models = {
		objects: new GL.ObjectsManager(objectsData),
		select: GL.create('select')
	};

	this._selectionFixed = false;

	this._initViewsAndControllers();
	this._addListenersToSelectionEvents();

	this.toggleMode(this._mode);
};


GL.User.prototype = {
	_initViewsAndControllers: function () {
		var isSelect,
			type,
			models = this._models,
			views = this._views = {},
			controllers = this._controllers = {},
			settings = this._settings,
			modes = GL.ModesEnum;
		for (var i in modes) {
			type = modes[i];
			if (type === modes.NONE) {
				continue;
			}
			isSelect = (modes.SELECT === type);
			views[type] = GL.create(type, 'view', (isSelect ? models.select : GL.create(type)), this._device);
			controllers[type] = GL.create(type, 'controller', (isSelect ? models.select : models.objects), views[type], (settings[isSelect ? 'getForSelectOperations' : 'getForObjects']()));
		}
	},
	_addListenersToSelectionEvents: function () {
		var selectModel = this._models.select,
			eventsManager = GL.eventsManager,
			self = this,
			getCallback = function (methodName) {
				return function (event) {
					self[methodName](event);
				};
			};
		eventsManager.add(selectModel, 'fix', getCallback('fixSelected'));
		eventsManager.add(selectModel, 'unfix', getCallback('unfixSelected'));
		eventsManager.add(selectModel, 'remove', getCallback('removeSelected'));
		eventsManager.add(selectModel, 'shift', getCallback('shiftSelected'));
		eventsManager.add(selectModel, 'resize', getCallback('resizeSelected'));
		eventsManager.add(selectModel, 'rotate', getCallback('rotateSelected'));
	},

	getMode: function (inUpperCase) {
		return inUpperCase ? this._mode.toUpperCase() : this._mode;
	},

	getSettings: function () {
		return this._settings;
	},

	redrawSelectedObjects: function (preHandler /*for each object, optional*/, postHandler /*for each object, optional*/) {
		var i,
			length,
			localRegion,
			objectType,
			device = this._device,
			views = this._views;
		preHandler = preHandler || function () { };
		postHandler = postHandler || function () { };
		device.clear(device.FORE);
		//for objects
		this._models.objects.forEachSelected(function (object, id) {
			if (object.isVisible()) {
				preHandler(object, id);
				objectType = object.getType();
				views[objectType].setModel(object);
				views[objectType].render(device.FORE);
				localRegion = object.getRegion();
				device.draw({
					type: 'select',
					left: localRegion.l,
					top: localRegion.t,
					width: localRegion.w,
					height: localRegion.h
				}, device.FORE);
				postHandler(object, id);
			}
		});
	},

	redrawAllObjects: function (preHandler /*for each object, optional*/, postHandler /*for each object, optional*/) {
		var i,
			length,
			localRegion,
			objectType,
			objectIsSelected,
			device = this._device,
			views = this._views;
		preHandler = preHandler || function () { };
		postHandler = postHandler || function () { };
		device.clear(device.FORE);
		device.clear(device.BACK);
		//for objects
		this._models.objects.forEach(function (object, id) {
			if (object.isVisible()) {
				objectType = object.getType();
				objectIsSelected = object.isSelected();
				preHandler(object, id, objectIsSelected);
				views[objectType].setModel(object);
				if (objectIsSelected) {
					views[objectType].render(device.FORE);
					localRegion = object.getRegion();
					device.draw({
						type: 'select',
						left: localRegion.l,
						top: localRegion.t,
						width: localRegion.w,
						height: localRegion.h
					}, device.FORE);
				} else {
					views[objectType].render(device.BACK);
				}
				postHandler(object, id, objectIsSelected);
			}
		});
	},
		
	resetSelection: function() {
		this._models.objects.clearSelection();
		this._controllers.select.attachActions();
	},

	fixSelected: function () {
		this.resetSelection();
		var device = this._device,
			models = this._models,
			views = this._views,
			region = models.select.getRegion(),
			regionLeft = region.l,
			regionTop = region.t,
			regionWidth = region.w,
			regionHeight = region.h,
			rationalSelect = GL.create('select'),
			objectIsInRegion;
		rationalSelect.setRegion({ l: null, t: null, w: null, h: null });
		//for objects
		models.objects.forEach(function (object, id) {
			var objectIsInRegion = object.isInRegion(regionLeft, regionTop, regionWidth, regionHeight),
				localRegion;
			if (objectIsInRegion) {
				rationalSelect.addRegion(object.getRegion());
				models.objects.select(id);
				localRegion = object.getRegion();
				device.draw({
						type: 'select',
						left: localRegion.l,
						top: localRegion.t,
						width: localRegion.w,
						height: localRegion.h
					}, device.FORE);
			}
		});
		models.select.setRegion(rationalSelect.getRegion());
		this._selectionFixed = true;
	},

	unfixSelected: function (event) {
		if (GL.keys.ESCAPE === event.keyCode) {
			this.resetSelection();
			this.redrawAllObjects();
			this._selectionFixed = false;
		}
	},

	redrawOnAction: function (preHandler, postHandler) {
		//TODO: implement for every action with selected objects (remove, shift, resize, rotate)
		//TODO: use it on every action
	},

	removeSelected: function (event) {
		if (GL.keys.DELETE === event.keyCode) {
			//for objects
			var objectsManager = this._models.objects;
			objectsManager.forEachSelected(function (object, id) { objectsManager.remove(id); });
			this.redrawAllObjects();
		}
	},

	shiftSelected: function(event) {
		var x = 0, y = 0,
			keyCode = event.keyCode,
			keyApproached = true,
			shiftFactor = this._settings.getForSelectOperations().shiftFactor;
		switch (keyCode) {
			case GL.keys.LEFT_ARROW:
				x = -shiftFactor;
				y = 0;
				break;
			case GL.keys.UP_ARROW:
				x = 0;
				y = -shiftFactor;
				break;
			case GL.keys.RIGHT_ARROW:
				x = shiftFactor;
				y = 0;
				break;
			case GL.keys.DOWN_ARROW:
				x = 0;
				y = shiftFactor;
				break;
			default:
				keyApproached = false;
				break;
		}
		if (keyApproached) {
			this.redrawAllObjects(function (object, id, isSelected) {
				if (isSelected) {
					object.shift(x, y);
				}
			});
			//this.redrawSelectedObjects(function (object, id) { object.shift(x, y); });
		}
	},

	resizeSelected: function(event) {
		var x = 0, y = 0,
			keyCode = event.keyCode,
			keyApproached = true,
			resizeFactor = this._settings.getResizeFactor();
		switch (keyCode) {
		case GL.keys.NUMPAD_4:
			x = -resizeFactor;
			y = 0;
			break;
		case GL.keys.NUMPAD_6:
			x = resizeFactor;
			y = 0;
			break;
		case GL.keys.NUMPAD_2:
			x = 0;
			y = -resizeFactor;
			break;
		case GL.keys.NUMPAD_8:
			x = 0;
			y = resizeFactor;
			break;
		default:
			keyApproached = false;
			break;
		}
		if (keyApproached) {
			this.redrawSelectedObjects(function (object, id) { object.resize(x, y); });
		}
	},

	rotateSelected: function (event) {
		var angle,
			center,
			keyCode = event.keyCode,
			keyApproached = true,
			rotateFactor = this._settings.getForSelectOperations().rotateFactor;
		switch (keyCode) {
		case GL.keys.NUMPAD_7:
			angle = -rotateFactor;
			break;
		case GL.keys.NUMPAD_9:
			angle = rotateFactor;
			break;
		default:
			keyApproached = false;
			break;
		}
		if (keyApproached) {
			center = this._models.select.getCenter();
			this.redrawSelectedObjects(function (object, id) { object.rotate(angle, center.x, center.y); });
		}
	},

	toggleMode: function (newMode) {
		var noneMode = GL.ModesEnum.NONE;
		if(!newMode) {
			newMode = this._mode;
		}
		if (this._mode !== noneMode) {
			this._controllers[this._mode].detachActions();
		}
		if (newMode && 'string' === typeof newMode && newMode !== noneMode) {
			this._mode = newMode;
			this._controllers[this._mode].attachActions();
		} else if (newMode === noneMode) {
			this._mode = newMode;
		}
	}
};