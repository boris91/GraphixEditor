GL.RegpolyController = function RegpolyController(regpolyModels, regpolyView, settings) {
	var beginDrawRegpoly,
		continueDrawRegpoly,
		endDrawRegpoly;
	this._attached = false;
	
	this.attachActions = function () {
		if(regpolyModels && regpolyView) {
			regpolyView.bindParentEventToFunc("mousedown",
					beginDrawRegpoly = function (event){
						if(event.which === 1) {
							regpolyView.setModel(GL.create('regpoly',
															{
																anglesCount: settings.anglesCount,
																firstAngle: settings.firstAngle,
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
							regpolyView.fixTempCenter(event);
							regpolyView.bindParentEventToFunc("mousemove", continueDrawRegpoly = function (event) {
									regpolyView.getModel().calculatePointsCoords();
									regpolyView.draw("fore", event);
								});
							regpolyView.unleashParentEvent("mousedown", beginDrawRegpoly);
							regpolyView.bindParentEventToFunc("mousedown", endDrawRegpoly = function (event) {
									if(event.which === 1) {
										regpolyView.fixRegpoly(event);
										regpolyModels.add(regpolyView.getModel().getData(true));
									}
									else {
										regpolyView.clear("fore");
									}
									regpolyView.unleashParentEvent("mousemove", continueDrawRegpoly);
									regpolyView.unleashParentEvent("mousedown", endDrawRegpoly);
									regpolyView.bindParentEventToFunc("mousedown", beginDrawRegpoly);
								});
						}
					});
			this._attached = true;
		}
	};
	this.detachActions = function () {
		regpolyView.clear("fore");
		regpolyView.unleashParentEvent("mousedown", beginDrawRegpoly);
		regpolyView.unleashParentEvent("mousedown", endDrawRegpoly);
		regpolyView.unleashParentEvent("mousemove", continueDrawRegpoly);
		this._attached = false;
	};
	this.actionsAttached = function () {
		return this._attached;
	};
};