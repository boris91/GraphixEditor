GL.LineController = function LineController(lineModels, lineView, settings) {
	var beginDrawLine,
		continueDrawLine,
		endDrawLine;
	this._attached = false;

	this.attachActions = function () {
		if (lineModels && lineView) {
			lineView.bindParentEventToFunc("mousedown",
					beginDrawLine = function (event) {
						if (event.which === 1) {
							lineView.setModel(GL.create('line',
														{
															color: {
																r: settings.color.r,
																g: settings.color.g,
																b: settings.color.b,
																a: settings.color.a
															},
															width: settings.penWidth,
															lineType: [
																settings.lineType[0],
																[
																	settings.lineType[1][0],
																	settings.lineType[1][1]
																]
															]
														}));
							lineView.fixTemp1(event);
							lineView.bindParentEventToFunc("mousemove", continueDrawLine = function (event) {
								lineView.draw("fore", event);
							});
							lineView.unleashParentEvent("mousedown", beginDrawLine);
							lineView.bindParentEventToFunc("mousedown", endDrawLine = function (event) {
								if (event.which === 1) {
									lineView.fixLine(event);
									lineModels.add(lineView.getModel().getData(true));
								}
								else {
									lineView.clear("fore");
								}
								lineView.unleashParentEvent("mousemove", continueDrawLine);
								lineView.unleashParentEvent("mousedown", endDrawLine);
								lineView.bindParentEventToFunc("mousedown", beginDrawLine);
							});
						}
					});
			this._attached = true;
		}
	};
	this.detachActions = function () {
		lineView.clear("fore");
		lineView.unleashParentEvent("mousedown", beginDrawLine);
		lineView.unleashParentEvent("mousedown", endDrawLine);
		lineView.unleashParentEvent("mousemove", continueDrawLine);
		this._attached = false;
	};
	this.actionsAttached = function () {
		return this._attached;
	};
};