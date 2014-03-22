GL.PointController = function PointController(pointModels, pointView, settings) {
	var down0 = null;
	this._attached = false;

	this.attachActions = function () {
		if (pointModels && pointView) {
			pointView.bindParentEventToFunc("mousedown", down0 = function (event) {
				if (event.which === 1) {
					pointView.clear("fore");
					pointView.setModel(GL.create('point',
													{
														radius: settings.penWidth / 2,
														color: {
															r: settings.color.r,
															g: settings.color.g,
															b: settings.color.b,
															a: settings.color.a
														}
													}));
					pointView.draw("back", true, event);
					pointModels.add(pointView.getModel().getData(true));
				}
			});
			this._attached = true;
		}
	};
	this.detachActions = function () {
		pointView.clear("fore");
		pointView.unleashParentEvent("mousedown", down0);
		this._attached = false;
	};
	this.actionsAttached = function () {
		return this._attached;
	};
};