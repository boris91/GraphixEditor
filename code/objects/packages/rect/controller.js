GL.RectController = function RectController(rectModels, rectView, settings) {
	var beginDrawRect,
		continueDrawRect,
		endDrawRect;
	this._attached = false;

	this.attachActions = function () {
		if (rectModels && rectView) {

			rectView.bindParentEventToFunc("mousedown",
					beginDrawRect = function (event) {
						if (event.which === 1) {
							rectView.setModel(GL.create('rect',
														{
															color: {
																r: settings.color.r,
																g: settings.color.g,
																b: settings.color.b,
																a: settings.color.a
															},
															thickness: settings.penWidth,
															fillColor: {
																r: settings.fillColor.r,
																g: settings.fillColor.g,
																b: settings.fillColor.b,
																a: settings.fillColor.a
															},
															lineType: [
																settings.lineType[0],
																[
																	settings.lineType[1][0],
																	settings.lineType[1][1]
																]
															]
														}));
							rectView.fixTempLeftTop(event);
							rectView.bindParentEventToFunc("mousemove", continueDrawRect = function (event) {
								rectView.draw("fore", event);
							});
							rectView.unleashParentEvent("mousedown", beginDrawRect);
							rectView.bindParentEventToFunc("mousedown", endDrawRect = function (event) {
								if (event.which === 1) {
									rectView.fixRect(event);
									rectModels.add(rectView.getModel().getData(true));
								}
								else {
									rectView.clear("fore");
								}
								rectView.unleashParentEvent("mousemove", continueDrawRect);
								rectView.unleashParentEvent("mousedown", endDrawRect);
								rectView.bindParentEventToFunc("mousedown", beginDrawRect);
							});
						}
					});
			this._attached = true;
		}
	},
	this.detachActions = function () {
		rectView.clear("fore");
		rectView.unleashParentEvent("mousedown", beginDrawRect);
		rectView.unleashParentEvent("mousedown", endDrawRect);
		rectView.unleashParentEvent("mousemove", continueDrawRect);
		this._attached = false;
	},
	this.actionsAttached = function () {
		return this._attached;
	};
};