﻿(function () {
	var _self = null,
	    //TODO: move to a separate file all string constants (files' paths, modes, packages info, etc.)
        DEBUG_MODE = true,
        STAMP = '$legally_created_object$',
        MODES = {
        	NONE: 'none',
        	SELECT: 'select',
        	POINT: 'point',
        	LINE: 'line',
        	RECT: 'rect',
        	REGPOLY: 'regpoly'
        },
        LINE_TYPES = {
        	SOLID: 'Solid',
        	DASHED: 'Dashed'
        },
        _styles = [
            'common'
        ],
        _stylesToIgnore = [],
        _stylesBase = 'styles/',
        _loadedScriptsCounter = 0,
        _scripts = [
		    'base/Settings',
		    'base/User',
		    'helpers/DomHelper',
		    'helpers/Keys',
		    'helpers/TypesHelper',
		    'helpers/UIGenerator',
		    'helpers/XhrManager',
		    'helpers/Stretcher',
		    'devices/canvas/Painter',
		    'devices/canvas/Canvas',
		    'devices/canvas/CanvasManager',
            'objects/base/model',
            'objects/containers/Layer',
            'objects/containers/ObjectsManager',
            'objects/containers/OrdersHash'
        ],
        _scriptsToIgnore = [],
        _scriptsBase = 'code/',
        _packages = [
            'select',
            'point',
            'line',
            'rect',
            'regpoly'
        ],
        _packagesModules = [
            'model',
            'view',
            'controller'
        ],
        _packagesBase = 'objects/packages/',
        _userIdentity = 'user',
        _window = window,
        _internalLoadingComplete = false,
		_uniqueIdsGenerator = (function () {
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
					count = ("number" === typeof count && count > 0) ? count : _portionCount;
					if (count > _ids.length) {
						_generatePortion(count - _ids.length + 1);
					}
					return _ids.splice(_ids.length - count, count);
				}
			};
		})(),
        _addInternalLoadListeners = function (disallowUserInit, disallowUICreation, listeners) {
        	var defaultLoadListeners = [
                function () { _self.extend(_self, new _self.TypesHelper()); },
                function () { _self.DOM = new _self.DomHelper(_window); },
                function () { _self.UI = new _self.UIGenerator(!disallowUICreation); },
                function () { _self.XHR = new _self.XhrManager(); },
                function () { (!disallowUserInit) && _self.initUser(_window); }
        	];
        	listeners['load'] = defaultLoadListeners.concat(listeners['load'] || []);
        	_self.eventsManager.addRanges(_self, listeners);
        },
        _bindInternalLoadToWindowLoad = function () {
        	var onloadHandler = function () {
        		if (!_self.allScriptsLoaded()) {
        			return _self.defer(onloadHandler, 0);
        		}
        		_self.eventsManager.fire(_self, 'load');
        		_internalLoadingComplete = true;
        	},
                loadScriptsAndFireSelfLoad = function () {
                	_self.loadAllStyles();
                	_self.loadAllScripts();
                	_self.loadAllPackages();
                	onloadHandler();
                };
        	if ('complete' !== _window.document.readyState) {
        		_window.addEventListener('load', loadScriptsAndFireSelfLoad, false);
        	} else {
        		loadScriptsAndFireSelfLoad();
        	}
        };
	_self = window.GL = {
		/*{ scripts, scriptsToIgnore, scriptsBase, userIdentity, window, disallowUserInit, disallowUICreation, skipInternalLoading, listeners }*/
		initialize: function (params) {
			params = params || {};
			_styles = params.styles || _styles;
			_stylesToIgnore = params.stylesToIgnore || _stylesToIgnore;
			_stylesBase = params.stylesBase || _stylesBase;
			_scripts = params.scripts || _scripts;
			_scriptsToIgnore = params.scriptsToIgnore || _scriptsToIgnore;
			_scriptsBase = params.scriptsBase || _scriptsBase;
			_packages = params.packages || _packages;
			_packagesModules = params.packagesModules || _packagesModules;
			_packagesBase = params.packagesBase || _packagesBase;
			_userIdentity = params.userIdentity || _userIdentity;
			_window = params.window || _window;
			this.eventsManager.setup();
			if (!_internalLoadingComplete && !params.skipInternalLoading) {
				_addInternalLoadListeners(params.disallowUserInit, params.disallowUICreation, params.listeners || {});
				_bindInternalLoadToWindowLoad();
			}
		},

		DOM: null,
		UI: null,
		XHR: null,

		eventsManager: (function () {
			var _methodTriggeredId = '',
		        _methodTriggeredComment = '',
		        TYPE_NAME_PREFIX = 'ON_',
		        _getFullTypeName = function (type) {
		        	return TYPE_NAME_PREFIX + type.toUpperCase();
		        },
		        _createTrigger = function (target, methodName) {
		        	var triggeredMethodText = _methodTriggeredComment + target[methodName].toString() + _methodTriggeredComment,
                        methodText = 'var result = (' + triggeredMethodText + ').apply(this, arguments);\n' +
					        'GL.eventsManager.fire(this, \'' + methodName + '\', arguments);\n' +
				            'return result;';
		        	target[methodName] = new _window.Function(methodText);
		        	target[_methodTriggeredId] = target[_methodTriggeredId] || {};
		        	target[_methodTriggeredId][methodName] = true;
		        };

			return {
				setup: function () {
					_methodTriggeredId = 'triggered_' + _self.generateUniqueId();
					_methodTriggeredComment = '/*' + _methodTriggeredId + '*/';
				},
				add: function (target, type, listener) {
					var listenerId = _self.generateUniqueId();
					type = _getFullTypeName(type);
					target.listeners = target.listeners || {};
					target.listeners[type] = target.listeners[type] || {};
					target.listeners[type][listenerId] = listener;
					return /*eventInfo*/{
						fullTypeName: type,
						listenerId: listenerId
					};
				},
				addRange: function (target, type, listeners) {
					var eventInfos = [],
                        listenersCount = listeners.length,
                        i;
					for (i = 0; i < listenersCount; i++) {
						eventInfos.push(this.add(target, type, listeners[i]));
					}
					return eventInfos;
				},
				addRanges: function (target, listenersByType) {
					var eventsInfos = {},
                        type;
					for (type in listenersByType) {
						eventsInfos[type] = this.addRange(target, type, listenersByType[type]);
					}
					return eventsInfos;
				},
				methodTriggered: function (target, methodName) {
					return (target[_methodTriggeredId] && target[_methodTriggeredId][methodName]);
				},
				/* methods 'connect' and 'disconnect' use for injecting listeners' triggers into the target[methodName]-methods */
				connect: function (target, methodName, listener) {
					if (!this.methodTriggered(target, methodName)) {
						_createTrigger(target, methodName);
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
					type = _getFullTypeName(type);
					if (target.listeners && (listeners = target.listeners[type])) {
						for (var listenerId in listeners) {
							delete listeners[listenerId];
						}
					}
				},
				fire: function (target, type, args) {
					var listenerId,
					    listeners,
					    event;
					if (!target || !target.listeners || !type || !(listeners = target.listeners[_getFullTypeName(type)])) {
						return;
					}
					type = type.toLowerCase();
					event = {
						type: type,
						target: target,
						arguments: args,
						window: _window,
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
			};
		})(),

		allScriptsLoaded: function () {
			return (_loadedScriptsCounter === (_scripts.length + (_packages.length * _packagesModules.length)));
		},

		initUser: function (aWindow) {
			var userDefaultProps = { mode: this.getDefaultMode() };
			aWindow = aWindow || _window || window;
			aWindow[_userIdentity] = new this.User(userDefaultProps);
		},

		getUser: function () {
			return _window[_userIdentity];
		},

		getDefaultMode: function (inUpperCase) {
			return inUpperCase ? this.ModesEnum.NONE.toUpperCase() : this.ModesEnum.NONE;
		},

		defer: function (/*Function/TextToEval, delayTimeInMs*/) {
			return _window.setTimeout.apply(_window, arguments);
		},

		loadStyle: function (stylePath, fromBase) {
			var element;
			if (stylePath && (-1 === _stylesToIgnore.indexOf(stylePath))) {
				element = _window.document.createElement('link');
				element.setAttribute('rel', 'stylesheet');
				element.setAttribute('type', 'text/css');
				element.setAttribute('href', (fromBase ? _stylesBase : '') + stylePath + '.css');
				_window.document.head.appendChild(element);
			}
		},

		getStylesBase: function () {
			return _stylesBase;
		},

		setStylesBase: function (value) {
			if (typeof value === 'string') {
				_stylesBase = value;
			}
		},

		ignoreStyle: function (path) {
			_stylesToIgnore.push(path);
		},

		dontIgnoreStyle: function (path) {
			_stylesToIgnore.slice(_stylesToIgnore.indexOf(path), 1);
		},

		loadAllStyles: function () {
			var i;
			for (i = 0; i < _styles.length; i++) {
				this.loadStyle(_styles[i], true);
			}
			for (i = 0; i < arguments.length; i++) {
				this.loadStyle(arguments[i].path, arguments[i].fromBase);
			}
		},

		loadScript: function (scriptPath, fromBase) {
			var element;
			if (scriptPath && (-1 === _scriptsToIgnore.indexOf(scriptPath))) {
				element = _window.document.createElement('script');
				element.setAttribute('type', 'text/javascript');
				element.setAttribute('src', (fromBase ? _scriptsBase : '') + scriptPath + '.js');
				element.addEventListener('load', function () { _loadedScriptsCounter++; }, false);
				_window.document.head.appendChild(element);
			}
		},

		getScriptsBase: function () {
			return _scriptsBase;
		},

		setScriptsBase: function (value) {
			if (typeof value === 'string') {
				_scriptsBase = value;
			}
		},

		ignoreScript: function (path) {
			_scriptsToIgnore.push(path);
		},

		dontIgnoreScript: function (path) {
			_scriptsToIgnore.slice(_scriptsToIgnore.indexOf(path), 1);
		},

		loadAllScripts: function () {
			var i;
			for (i = 0; i < _scripts.length; i++) {
				this.loadScript(_scripts[i], true);
			}
			for (i = 0; i < arguments.length; i++) {
				this.loadScript(arguments[i].path, arguments[i].fromBase);
			}
		},

		loadPackage: function (packageName) {
			var packagePath = _packagesBase + packageName + '/',
                i;
			for (i = 0; i < _packagesModules.length; i++) {
				this.loadScript(packagePath + _packagesModules[i], true);
			}
		},

		getPackagesBase: function () {
			return _packagesBase;
		},

		setPackagesBase: function (value) {
			if (typeof value === 'string') {
				_packagesBase = value;
			}
		},

		loadAllPackages: function () {
			var i;
			for (i = 0; i < _packages.length; i++) {
				this.loadPackage(_packages[i], true);
			}
			for (i = 0; i < arguments.length; i++) {
				this.loadPackage(arguments[i].path, arguments[i].fromBase);
			}
		},

		generateUniqueId: function () {
			return _uniqueIdsGenerator.get();
		},

		generateUniqueIdsRange: function (count) {
			return _uniqueIdsGenerator.getRange(count);
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
			if (DEBUG_MODE && confirm(text + '\nDebug it?')) {
				debugger;
			}
		}
	};

	Object.defineProperties(_self, {
		stamp: {
			get: function () {
				return STAMP;
			}
		},
		ModesEnum: {
			get: function () {
				return MODES;
			}
		},
		LineTypesEnum: {
			get: function () {
				return LINE_TYPES;
			}
		}
	});
})();