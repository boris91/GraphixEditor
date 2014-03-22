GL.Stretcher = function GL_Stretcher(attributes) {
	attributes = attributes || {};
	var self = this;
	this._id = attributes.id || (attributes.forDom && attributes.forDom.id ? attributes.forDom.id : 'stretcher_' + GL.generateUniqueId());
	this._x = attributes.x || 950;
	this._y = attributes.y || 350;
	this._newX = null;
	this._newY = null;
	this._div = GL.DOM.add('div',
							{
								attributes: attributes.forDom || {
									id: this._id,
									style: {
										position: 'absolute',
										left: this._x + 'px',
										top: this._y + 'px',
										width: '15px',
										height: '15px',
										border: '1px solid rgb(0,0,0)',
										backgroundColor: 'rgb(200,200,200)',
										zIndex: '100',
										cursor: 'se-resize'
									}
								}
							});
	this._foreDiv = GL.DOM.add('div',
								{
									attributes: {
										id: 'stretchArea_' + GL.generateUniqueId(),
										style: {
											position: 'absolute',
											left: this._x - 20 + 'px',
											top: this._y - 20 + 'px',
											width: '55px',
											height: '55px',
											zIndex: '101'
										}
									}
								});
	this._onMove = attributes.onMove || function () { return { dx: 0, dy: 0 }; };
	this._onRedraw = attributes.onReDraw || function () { };

	function drag(event) {
		if (event.clientX > self._x && event.clientX < (self._x + 15) && event.clientY > self._y && event.clientY < (self._y + 15)) {
			self.moveX = event.clientX;
			self.moveY = event.clientY;
		}
	}
	function move(event) {
		if (event.clientX > self._x && event.clientX < (self._x + 15) && event.clientY > self._y && event.clientY < (self._y + 15)) {
			self._foreDiv.style.cursor = 'se-resize';
		} else {
			self._foreDiv.style.cursor = 'auto';
		}
		if ('moveX' in self && 'moveY' in self) {
			var moveX = event.clientX - self.moveX,
				moveY = event.clientY - self.moveY,
				diff;
			self.moveX = event.clientX;
			self.moveY = event.clientY;
			diff = self._onMove(moveX, moveY);
			self._x = self._div.offsetLeft + diff.dx;
			self._y = self._div.offsetTop + diff.dy;
			self._div.style.left = self._x + 'px';
			self._div.style.top = self._y + 'px';
			self._foreDiv.style.left = self._foreDiv.offsetLeft + diff.dx + 'px';
			self._foreDiv.style.top = self._foreDiv.offsetTop + diff.dy + 'px';
			self._onRedraw();
		}
	}
	function drop(event) {
		delete self.moveX;
		delete self.moveY;
	}
	this._foreDiv.addEventListener('mousedown', drag, false);
	this._foreDiv.addEventListener('mousemove', move, false);
	this._foreDiv.addEventListener('mouseup', drop, false);
};