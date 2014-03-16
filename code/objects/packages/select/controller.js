GL.SelectController = function GL_SelectController(selectModel, selectView) {
	var self = this,
		beginDrawSelect = function (event) {
			if (event.which === 1) {
				document.removeEventListener('keydown', self._deselect);
				document.removeEventListener('keydown', self._shift);
				document.removeEventListener('keydown', self._resize);
				document.removeEventListener('keydown', self._rotate);
				document.removeEventListener('keydown', self._remove);
				document.addEventListener('keydown', self._deselect);
				selectView.fixTempLeftTop(event);
				selectView.bindParentEventToFunc('mousemove', continueDrawSelect);
				selectView.unleashParentEvent('mousedown', beginDrawSelect);
				selectView.bindParentEventToFunc('mousedown', endDrawSelect);
			}
		},
		continueDrawSelect = function (event) {
			selectView.draw(event);
		},
		endDrawSelect = function (event) {
			selectView.unleashParentEvent('mousemove', continueDrawSelect);
			selectView.unleashParentEvent('mousedown', endDrawSelect);
			if (event.which === 1) {
				document.addEventListener('keydown', self._shift);
				document.addEventListener('keydown', self._resize);
				document.addEventListener('keydown', self._rotate);
				document.addEventListener('keydown', self._remove);
			}
			selectView.fix(event);
			GL.eventsManager.fire(selectModel, 'fix');
			selectView.bindParentEventToFunc('mousedown', beginDrawSelect);
		};
	this._attached = false;
	this._deselect = function (event) {
		GL.eventsManager.fire(selectModel, 'unfix', [event]);
		selectView.unleashParentEvent('mousedown', continueDrawSelect);
		selectView.unleashParentEvent('mousedown', endDrawSelect);
		selectView.unleashParentEvent('mousemove', continueDrawSelect);
		selectView.bindParentEventToFunc('mousedown', beginDrawSelect);
	};
	this._shift = function (event) {
		GL.eventsManager.fire(selectModel, 'shift', [event]);
	};
	this._resize = function (event) {
		GL.eventsManager.fire(selectModel, 'resize', [event]);
	};
	this._rotate = function (event) {
		GL.eventsManager.fire(selectModel, 'rotate', [event]);
	};
	this._remove = function (event) {
		GL.eventsManager.fire(selectModel, 'remove', [event]);
	};

	this.attachActions = function () {
		if(selectModel && selectView) {
			selectView.unleashParentEvent('mousedown', beginDrawSelect);
			selectView.unleashParentEvent('mousemove', continueDrawSelect);
			
			selectView.bindParentEventToFunc('mousedown', beginDrawSelect);
			this._attached = true;
		}
	};
	this.detachActions = function () {
		GL.eventsManager.fire(selectModel, 'unfix', [{ keyCode: GL.keys.ESCAPE }]);
		selectView.unleashParentEvent('mousedown', beginDrawSelect);
		selectView.unleashParentEvent('mousedown', continueDrawSelect);
		selectView.unleashParentEvent('mousedown', endDrawSelect);
		selectView.unleashParentEvent('mousemove', continueDrawSelect);
		document.removeEventListener('keydown', this._deselect);
		document.removeEventListener('keydown', this._shift);
		document.removeEventListener('keydown', this._resize);
		document.removeEventListener('keydown', this._rotate);
		document.removeEventListener('keydown', this._remove);
		this._attached = false;
	};
	this.actionsAttached = function () {
		return this._attached;
	};
};