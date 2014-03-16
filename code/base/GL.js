(function () {
	var self = window.GL = {
		/*{ scripts, scriptsToIgnore, scriptsBase, userIdentity, window, disallowUserInit, skipInternalLoading, listeners }*/
	    initialize: function (params) {
	        params = params || {};
	        //TODO: move to a separate file
	        this._styles = params.styles || [
                'common'
	        ];
	        this._stylesToIgnore = params.stylesToIgnore || [];
	        this._stylesBase = params.stylesBase || 'Styles/';
			this._scripts = params.scripts || [
					'TypesHelper',
					'Settings',
					'DomHelper',
					'UIGenerator',
					'XhrWrapper',
					'Keys',
					'Devices/Canvas/Stretcher',
					'Devices/Canvas/Painter',
					'Devices/Canvas/Canvas',
					'Devices/Canvas/CanvasManager',
					'Models/Helpers/Select',
					'Models/Objects/Base',
					'Models/Objects/Point',
					'Models/Objects/Line',
					'Models/Objects/Rect',
					'Models/Objects/Regpoly',
					'Models/Objects/Manager/OrdersHash',
					'Models/Objects/Manager/Layer',
					'Models/Objects/Manager/ObjectsManager',
					'Views/Helpers/Select',
					'Views/Objects/Point',
					'Views/Objects/Line',
					'Views/Objects/Rect',
					'Views/Objects/Regpoly',
					'Controllers/Helpers/Select',
					'Controllers/Objects/Point',
					'Controllers/Objects/Line',
					'Controllers/Objects/Rect',
					'Controllers/Objects/Regpoly',
					'User'
			];
			this._scriptsToIgnore = params.scriptsToIgnore || [];
			this._scriptsBase = params.scriptsBase || '';
			this._userIdentity = params.userIdentity || 'user';
			this._window = params.window || window;
			this.eventsManager.setup(this, this._window);
			if (!this._internalLoadingComplete && !params.skipInternalLoading) {
				this._addInternalLoadListeners(params.disallowUserInit, params.listeners || {});
				this._bindInternalLoadToWindowLoad();
			}
		},

		DOM: null,
		UI: null,
		XHR: null,
		debugMode: true,
		loadedScriptsCounter: 0,

		//+++constants+++
		stamp: '$legally_created_object$',
		ModesEnum: {
			NONE: 'none',
			SELECT: 'select',
			POINT: 'point',
			LINE: 'line',
			RECT: 'rect',
			REGPOLY: 'regpoly'
		},
		LineTypesEnum: {
			SOLID: 'Solid',
			DASHED: 'Dashed'
		},
		//---constants---

		_internalLoadingComplete: false,

		_addInternalLoadListeners: function (disallowUserInit, listeners) {
			var eventsManager = this.eventsManager,
				eventName, eventListeners, eventListenersCount, i;
			eventsManager.add(this, 'load', function () { self.extend(self, new self.TypesHelper()); });
			eventsManager.add(this, 'load', function () { self.DOM = new self.DomHelper(self._window); });
			eventsManager.add(this, 'load', function () { self.UI = new self.UIGenerator(true); });
			eventsManager.add(this, 'load', function () { self.XHR = new self.XhrWrapper(); });
			if (!disallowUserInit) {
				eventsManager.add(this, 'load', function () { self.initUser(self._window); });
			}
			for (eventName in listeners) {
				eventListeners = listeners[eventName];
				eventListenersCount = eventListeners.length;
				for (i = 0; i < eventListenersCount; i++) {
					eventsManager.add(this, eventName, eventListeners[i]);
				}
			}
		},
		_bindInternalLoadToWindowLoad: function () {
			var onloadHandler = function () {
					if (!self.allScriptsLoaded()) {
						return self.defer(onloadHandler, 0);
					}
					self.eventsManager.fire(self, 'load');
					self._internalLoadingComplete = true;
				},
				loadScriptsAndFireSelfLoad = function () {
				    self.loadAllStyles();
					self.loadAllScripts();
					onloadHandler();
				};
			if ('complete' !== this._window.document.readyState) {
				this._window.addEventListener('load', loadScriptsAndFireSelfLoad, false);
			} else {
				loadScriptsAndFireSelfLoad();
			}
		},

		eventsManager: {
			//private API
			_GL: null,
			_methodTriggeredId: '',
			_methodTriggeredComment: '',
			_typeNamePrefix: 'ON_',
			_getFullTypeName: function (type) {
				return this._typeNamePrefix + type.toUpperCase();
			},
			_window: null,
			//public API
			setup: function (glObj, winObj) {
				this._GL = glObj;
				this._window = winObj || window;
				this._methodTriggeredId = 'triggered_' + glObj.generateUniqueId();
				this._methodTriggeredComment = '/*' + this._methodTriggeredId + '*/';
			},
			add: function (target, type, listener) {
				var listenerId = this._GL.generateUniqueId();
				type = this._getFullTypeName(type);
				target.listeners = target.listeners || {};
				target.listeners[type] = target.listeners[type] || {};
				target.listeners[type][listenerId] = listener;
				return /*eventInfo*/{
					fullTypeName: type,
					listenerId: listenerId
				};
			},
			methodTriggered: function (target, methodName) {
				return (target[this._methodTriggeredId] && target[this._methodTriggeredId][methodName]);
			},
			createTrigger: function (target, methodName) {
				var methodText = 'var result = (' + this._methodTriggeredComment + target[methodName].toString() + this._methodTriggeredComment + ').apply(this, arguments);\n' +
					'GL.eventsManager.fire(this, \'' + methodName + '\', arguments);\n';
				'return result;';
				target[methodName] = new this._window.Function(methodText);
				target[this._methodTriggeredId] = target[this._methodTriggeredId] || {};
				target[this._methodTriggeredId][methodName] = true;
			},
			connect: function (target, methodName, listener) {
				if (!this.methodTriggered(target, methodName)) {
					this.createTrigger(target, methodName);
				}
				return this.add(target, methodName, listener);
			},
			disconnect: function (target, eventInfo) {
				this.remove(target, eventInfo);
			},
			remove: function (target, eventInfo) {
				var type = eventInfo.fullTypeName,
					listenerId = eventInfo.listenerId;
				if (target.listeners && target.listeners[type] && target.listeners[type][listenerId]) {
					delete target.listeners[type][listenerId];
					for (var prop in eventInfo) {
						delete eventInfo[prop];
					}
				}
			},
			clear: function (target, type) {
				var listeners;
				type = this._getFullTypeName(type);
				if (target.listeners && (listeners = target.listeners[type])) {
					for (var listenerId in listeners) {
						delete listeners[listenerId];
					}
				}
			},
			fire: function (target, type, args, windowObj) {
				var listenerId,
					listeners,
					event;
				if (!target || !target.listeners || !type || !(listeners = target.listeners[this._getFullTypeName(type)])) {
					return;
				}
				if (windowObj && windowObj !== this._window) {
					delete this._window;
					this._window = windowObj;
				}
				type = type.toLowerCase();
				event = {
					type: type,
					target: target,
					arguments: args,
					window: this._window,
					allowPropagate: true,
					stop: function () {
						this.allowPropagate = false;
					}
				};
				for (listenerId in listeners) {
					if (event.allowPropagate) {
						listeners[listenerId].apply(target, args || [event]);
					}
				}
			},
			stop: function (event) {
				event.allowPropagate = false;
			}
		},

		allScriptsLoaded: function () {
			return (this.loadedScriptsCounter === this._scripts.length);
		},

		initUser: function (aWindow) {
			var userDefaultProps = { mode: this.getDefaultMode() };
			aWindow = aWindow || this._window || window;
			aWindow[this._userIdentity] = new this.User(userDefaultProps);
		},

		getUser: function () {
			return this._window[this._userIdentity];
		},

		getDefaultMode: function (inUpperCase) {
			return inUpperCase ? this.ModesEnum.NONE.toUpperCase() : this.ModesEnum.NONE;
		},

		defer: function (/*Function/TextToEval, delayTimeInMs*/) {
			return this._window.setTimeout.apply(this._window, arguments);
		},

		loadStyle: function (stylePath, fromBase) {
		    var element;
		    if (stylePath && (-1 === this._stylesToIgnore.indexOf(stylePath))) {
		        element = this._window.document.createElement('link');
		        element.setAttribute('rel', 'stylesheet');
		        element.setAttribute('type', 'text/css');
		        element.setAttribute('href', (fromBase ? this._stylesBase : '') + stylePath + '.css');
		        this._window.document.head.appendChild(element);
		    }
		},

		getStylesBase: function () {
		    return this._stylesBase;
		},

		setStylesBase: function (value) {
		    if (typeof value === 'string') {
		        this._stylesBase = value;
		    }
		},

		ignoreStyle: function (path) {
		    this._stylesToIgnore.push(path);
		},

		dontIgnoreStyle: function (path) {
		    this._stylesToIgnore.slice(this._stylesToIgnore.indexOf(path), 1);
		},

		loadAllStyles: function () {
		    var i;
		    for (i = 0; i < this._styles.length; i++) {
		        this.loadStyle(this._styles[i], true);
		    }
		    for (i = 0; i < arguments.length; i++) {
		        this.loadStyle(arguments[i].path, arguments[i].fromBase);
		    }
		},

		loadScript: function (scriptPath, fromBase) {
			var element;
			if (scriptPath && (-1 === this._scriptsToIgnore.indexOf(scriptPath))) {
				element = this._window.document.createElement('script');
				element.setAttribute('type', 'text/javascript');
				element.setAttribute('src', (fromBase ? this._scriptsBase : '') + scriptPath + '.js');
				element.addEventListener('load', function () { self.loadedScriptsCounter++; }, false);
				this._window.document.head.appendChild(element);
			}
		},

		getScriptsBase: function () {
			return this._scriptsBase;
		},

		setScriptsBase: function (value) {
			if (typeof value === 'string') {
				this._scriptsBase = value;
			}
		},

		ignoreScript: function (path) {
			this._scriptsToIgnore.push(path);
		},

		dontIgnoreScript: function (path) {
			this._scriptsToIgnore.slice(this._scriptsToIgnore.indexOf(path), 1);
		},

		loadAllScripts: function () {
			var i;
			for (i = 0; i < this._scripts.length; i++) {
				this.loadScript(this._scripts[i], true);
			}
			for (i = 0; i < arguments.length; i++) {
				this.loadScript(arguments[i].path, arguments[i].fromBase);
			}
		},

		uniqueIdsGenerator: (function () {
			var _idLength = 32,
				_portionCount = 100,
				_ids = [],
				CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
				CHARS_COUNT = CHARS.length,
				_generate = function () {
					var id = '',
						i;
					for (i = 0; i < _idLength; i++) {
						id += CHARS[Math.floor(Math.random() * CHARS_COUNT)];
					}
					_ids.push(id);
				},
				_generatePortion = function (portionCount) {
					var i;
					portionCount = portionCount || _portionCount;
					for (i = 0; i < portionCount; i++) {
						_generate();
					}
				};

			_generatePortion(10000);

			return {
				setIdLength: function (value) {
					if ("number" === typeof value && value > 0) {
						_idLength = value;
					}
				},
				setPortionCount: function (value) {
					if ("number" === typeof value && value > 0) {
						_portionCount = value;
					}
				},
				get: function () {
					if (1 === _ids.length) {
						_generatePortion();
					}
					return _ids.pop();
				},
				getRange: function (count) {
					//TODO: implement
					count = ("number" === typeof count && count > 0) ? count : _portionCount;
					if (count > _ids.length) {
						_generatePortion(count - _ids.length + 1);
					}
					return _ids.splice(_ids.length - count, count);
				}
			};
		})(),

		generateUniqueId: function () {
			return this.uniqueIdsGenerator.get();
		},
		
		generateUniqueIdsRange: function (count) {
			return this.uniqueIdsGenerator.getRange(count);
		},

		create: function (type, arg1) {
			var ctorType,
				args = '',
				object,
				i;
			type = type.slice(0, 1).toUpperCase() + type.slice(1);
			if ('view' !== arg1 && 'controller' !== arg1) {
				ctorType = 'Model';
				args = 'arguments[1]';
			} else {
				ctorType = arg1.slice(0, 1).toUpperCase() + arg1.slice(1);
				for (i = 2; i < arguments.length; i++) {
					args += 'arguments[' + i + ']';
					if (i < arguments.length - 1) {
						args += ', ';
					}
				}
			}
			object = eval('new GL.' + type + ctorType + '(' + args + ');');
			object[this.stamp] = true;
			return object;
		},

		inherit: function (base, child) {
			var i;
			for (i in base.prototype) {
				if (!child.prototype[i]) {
					child.prototype[i] = base.prototype[i];
				}
			}
			child.prototype._base = base.prototype;
		},

		extend: function (target, source) {
			var i;
			for (i in source) {
				target[i] = source[i];
			}
			return target;
		},

		raiseException: function (error, message, description) {
			var text = error + ': ' + message + ((description && typeof description === 'string') && ('\nDescription: ' + description));
			if (this.debugMode && confirm(text + '\nDebug it?')) {
				debugger;
			}
		}
	};
})();