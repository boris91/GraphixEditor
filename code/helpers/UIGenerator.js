GL.UIGenerator = function GL_UIGenerator(autoGenerate) {
	var _domHelper = GL.DOM,
		_totalLayer = null,
		_self = {
		    //private API
		    _getTotalLayer: function () {
			    _totalLayer = _domHelper.byId('totalLayer');
		    },
		    _createCanvas: function () {
			    _domHelper.add('div', { attributes: { id: 'undercanvasLayer', 'class': 'forUndercanvasLayer' } }, _totalLayer);
		    },
		    _createTools: function () {
			    var modes = GL.ModesEnum,
				    toolButtonPrefix = 'btn_tool_',
				    _prevToolName = '',//will be used in closure
				    toolsDiv = _domHelper.add('div', {
					    attributes: {
						    id: 'div_tools',
						    style: 'position:absolute; top:400px;'
					    }
				    }, _totalLayer),
				    toolParams = {
					    attributes: {
						    type: 'button',
						    style: 'left:auto;'
					    },
					    listeners: {
						    'click': [function (event) {
							    var newToolName = event.target.value,
								    userObj = GL.getUser();
							    if (_prevToolName) {
								    _domHelper.byId(toolButtonPrefix + _prevToolName).disabled = '';
							    }
							    _prevToolName = newToolName;
							    userObj.toggleMode(modes[newToolName]);
							    _domHelper.byId(toolButtonPrefix + newToolName).disabled = 'disabled';
						    }]
					    }
				    },
				    toolParamsAttrs = toolParams.attributes,
				    i;
			    for (i in modes) {
				    toolParamsAttrs.id = toolButtonPrefix + i;
				    toolParamsAttrs.value = i;
				    _domHelper.add('input', toolParams, toolsDiv);
			    }
			    _prevToolName = GL.getDefaultMode(true);
			    _domHelper.byId(toolButtonPrefix + _prevToolName).disabled = 'disabled';
		    },
		    _createSettings: function () {
			    var settingsDiv = _domHelper.add('div', {
					    attributes: {
						    id: 'div_settings',
						    style: 'position:absolute; top:422px;'
					    }
				    }, _totalLayer),
				    getParam = function (type, min, max, step, value, title, style, methodName) {
					    var targetProp = ('checkbox' === type) ? 'checked' : 'value',
						    param = {
							    attributes: { type: type, min: min, max: max, step: step, value: value, title: title, style: 'left:auto; ' + style },
							    listeners: {
								    'change': [function (event) {
									    var value = event.target[targetProp],
										    settings = GL.getUser().getSettings();
									    value = ('color' === type || 'checkbox' === type) ? value : window['range' === type ? "parseFloat" : "parseInt"](value);
									    settings[methodName](value);
								    }]
							    }
						    },
						    paramAttrs = param.attributes,
						    i;
					    for (i in paramAttrs) {
						    if (undefined === paramAttrs[i]) {
							    delete paramAttrs[i];
						    }
					    }
					    return param;
				    },
				    settingsParams = [
					    getParam('number', 1, 100, 1, 1, 'Shift factor', 'width:45px;', 'setShiftFactor'),
					    getParam('number', 1, 100, 1, 1, 'Resize factor', 'width:45px;', 'setResizeFactor'),
					    getParam('number', 1, 180, 1, 1, 'Rotate factor', 'width:45px;', 'setRotateFactor'),
					    getParam('number', 3, 100, 1, 5, 'Angles count', 'width:45px;', 'setAnglesCount'),
					    getParam('number', -180, 180, 1, -90, 'First angle', 'width:45px;', 'setFirstAngle'),
					    getParam('number', 1, 100, 1, 5, 'Dashed line fill area length', 'width:45px;', 'setLineTypeFillLength'),
					    getParam('number', 1, 100, 1, 2, 'Dashed line empty area length', 'width:45px;', 'setLineTypeEmptyLength'),
					    getParam('checkbox', 1, 100, 1, 2, 'Switch dashed line type on', '', 'setLineTypeSolidOrDashed'),
					    getParam('range', 0.5, 50, 0.5, 10, 'Pen width', 'top:-20px; width:50px;', 'setPenWidth'),
					    getParam('color', null, null, null, null, 'Pen color', 'top:-20px;', 'setColorRgb'),
					    getParam('color', null, null, null, null, 'Fill color', 'top:-20px;', 'setFillColorRgb'),
					    getParam('range', 0, 1, 0.02, 1, 'Pen color alpha-channel', 'width:40px;', 'setColorAlpha'),
					    getParam('range', 0, 1, 0.02, 0, 'Fill color alpha-channel', 'width:40px;', 'setFillColorAlpha')
				    ],
				    settingsCount = settingsParams.length,
				    i;
			    for (i = 0; i < settingsCount; i++) {
				    _domHelper.add('input', settingsParams[i], settingsDiv);
			    }
		    },
		    _createFiles: function () {
			    var filesDiv = _domHelper.add('div', { attributes: { value: 'Open', style: 'position:absolute; left:400px; top:400px;' } }, _totalLayer);
			    _domHelper.add('input', { attributes: { type: 'button', value: 'Open', style: 'left:auto;' }, listeners: { 'click': [function (event) { }] } }, filesDiv);
			    _domHelper.add('input', { attributes: { type: 'button', value: 'Save', style: 'left:auto;' }, listeners: { 'click': [function (event) { }] } }, filesDiv);
		    },
		    _createPosLabel: function () {
			    _domHelper.add('div', { attributes: { id: 'lblPosition', name: 'lblPosition', style: 'position:absolute; left:0px; top:0px;' } }, _totalLayer);
		    },
		    //public API
		    createAll: function () {
			    this._getTotalLayer();
			    this._createCanvas();
			    this._createTools();
			    this._createSettings();
			    this._createFiles();
			    this._createPosLabel();
		    }
	    };

	if (autoGenerate) {
		_self.createAll();
	}

	return _self;
};