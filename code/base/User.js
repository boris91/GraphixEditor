GL.User = function GL_User(defaultProps, objectsData) {
	defaultProps = defaultProps || {};
	var _self = null,
	    _device = new GL.CanvasManager({
	    	onRedraw: function () { _self.redrawAllObjects(); }
	    }),
        _mode = defaultProps.mode || GL.ModesEnum.POINT,
	    _settings = new GL.Settings(),
	    _models = {
	    	objects: new GL.ObjectsManager(objectsData),
	    	select: GL.create('select')
	    },
        _views = {},
        _controllers = {},
	    _selectionFixed = false,
	    _initViewsAndControllers = function () {
	    	var isSelect,
			    type,
			    modes = GL.ModesEnum;
	    	for (var i in modes) {
	    		type = modes[i];
	    		if (type === modes.NONE) {
	    			continue;
	    		}
	    		isSelect = (modes.SELECT === type);
	    		_views[type] = GL.create(type, 'view', (isSelect ? _models.select : GL.create(type)), _device);
	    		_controllers[type] = GL.create(type, 'controller', (isSelect ? _models.select : _models.objects), _views[type], (_settings[isSelect ? 'getForSelectOperations' : 'getForObjects']()));
	    	}
	    },
	    _addListenersToSelectionEvents = function () {
	    	GL.eventsManager.addRanges(_models.select, {
	    		'fix': [function () { _self.fixSelected(); }],
	    		'unfix': [function (event) { _self.unfixSelected(event); }],
	    		'remove': [function (event) { _self.removeSelected(event); }],
	    		'shift': [function (event) { _self.shiftSelected(event); }],
	    		'resize': [function (event) { _self.resizeSelected(event); }],
	    		'rotate': [function (event) { _self.rotateSelected(event); }]
	    	});
	    };

	_self = {
		getMode: function (inUpperCase) {
			return inUpperCase ? _mode.toUpperCase() : _mode;
		},

		getSettings: function () {
			return _settings;
		},

		redrawSelectedObjects: function (preHandler /*for each object, optional*/, postHandler /*for each object, optional*/) {
			var DEVICE_FORE = _device.FORE,
	            i, length, localRegion, objectType;
			preHandler = preHandler || function () { };
			postHandler = postHandler || function () { };
			_device.clear(DEVICE_FORE);
			//for objects
			_models.objects.forEachSelected(function (object, id) {
				if (object.isVisible()) {
					preHandler(object, id);
					objectType = object.getType();
					_views[objectType].setModel(object);
					_views[objectType].render(DEVICE_FORE);
					localRegion = object.getRegion();
					_device.draw({
						type: 'select',
						left: localRegion.l,
						top: localRegion.t,
						width: localRegion.w,
						height: localRegion.h
					}, DEVICE_FORE);
					postHandler(object, id);
				}
			});
		},

		redrawAllObjects: function (preHandler /*for each object, optional*/, postHandler /*for each object, optional*/) {
			var DEVICE_FORE = _device.FORE,
                DEVICE_BACK = _device.BACK,
                i, length, localRegion, objectType, objectIsSelected;
			preHandler = preHandler || function () { };
			postHandler = postHandler || function () { };
			_device.clear(DEVICE_FORE);
			_device.clear(DEVICE_BACK);
			//for objects
			_models.objects.forEach(function (object, id) {
				if (object.isVisible()) {
					objectType = object.getType();
					objectIsSelected = object.isSelected();
					preHandler(object, id, objectIsSelected);
					_views[objectType].setModel(object);
					if (objectIsSelected) {
						_views[objectType].render(DEVICE_FORE);
						localRegion = object.getRegion();
						_device.draw({
							type: 'select',
							left: localRegion.l,
							top: localRegion.t,
							width: localRegion.w,
							height: localRegion.h
						}, DEVICE_FORE);
					} else {
						_views[objectType].render(DEVICE_BACK);
					}
					postHandler(object, id, objectIsSelected);
				}
			});
		},

		resetSelection: function () {
			_models.objects.clearSelection();
			_controllers.select.attachActions();
		},

		fixSelected: function () {
			this.resetSelection();
			var region = _models.select.getRegion(),
                regionLeft = region.l,
                regionTop = region.t,
                regionWidth = region.w,
                regionHeight = region.h,
                rationalSelect = GL.create('select'),
                DEVICE_FORE = _device.FORE,
                objectIsInRegion;
			rationalSelect.setRegion({ l: null, t: null, w: null, h: null });
			//for objects
			_models.objects.forEach(function (object, id) {
				var objectIsInRegion = object.isInRegion(regionLeft, regionTop, regionWidth, regionHeight),
                    localRegion;
				if (objectIsInRegion) {
					rationalSelect.addRegion(object.getRegion());
					_models.objects.select(id);
					localRegion = object.getRegion();
					_device.draw({
						type: 'select',
						left: localRegion.l,
						top: localRegion.t,
						width: localRegion.w,
						height: localRegion.h
					}, DEVICE_FORE);
				}
			});
			_models.select.setRegion(rationalSelect.getRegion());
			_selectionFixed = true;
		},

		unfixSelected: function (event) {
			if (GL.keys.ESCAPE === event.keyCode) {
				this.resetSelection();
				this.redrawAllObjects();
				_selectionFixed = false;
			}
		},

		redrawOnAction: function (preHandler, postHandler) {
			//TODO: implement for every action with selected objects (remove, shift, resize, rotate)
			//TODO: use it on every action
		},

		removeSelected: function (event) {
			if (GL.keys.DELETE === event.keyCode) {
				//for objects
				var objectsManager = _models.objects;
				objectsManager.forEachSelected(function (object, id) { objectsManager.remove(id); });
				this.redrawAllObjects();
			}
		},

		shiftSelected: function (event) {
			var x = 0,
				y = 0,
                keyApproached = true,
                shiftFactor = _settings.getForSelectOperations().shiftFactor;
			switch (event.keyCode) {
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

		resizeSelected: function (event) {
			var x = 0,
				y = 0,
                keyApproached = true,
                resizeFactor = _settings.getResizeFactor();
			switch (event.keyCode) {
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
			var keyApproached = true,
                rotateFactor = _settings.getForSelectOperations().rotateFactor,
	            angle, center;
			switch (event.keyCode) {
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
				center = _models.select.getCenter();
				this.redrawSelectedObjects(function (object, id) { object.rotate(angle, center.x, center.y); });
			}
		},

		toggleMode: function (newMode) {
			var noneMode = GL.ModesEnum.NONE;
			if (!newMode) {
				newMode = _mode;
			}
			if (_mode !== noneMode) {
				_controllers[_mode].detachActions();
			}
			if (newMode && 'string' === typeof newMode && newMode !== noneMode) {
				_mode = newMode;
				_controllers[_mode].attachActions();
			} else if (newMode === noneMode) {
				_mode = newMode;
			}
		}
	};

	_initViewsAndControllers();
	_addListenersToSelectionEvents();

	_self.toggleMode(_mode);

	return _self;
};