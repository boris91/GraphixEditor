//{ x, y, radius, color, order, visible }
GL.PointModel = function GL_PointModel(attributes) {
	attributes = attributes ? ('string' === typeof attributes ? JSON.parse(attributes) : attributes) : {};
	GL.ObjectBase.call(this, GL.extend(attributes, { type: 'point' }));
	
	this._x = attributes.x || -attributes.radius*2 || -2;
	this._y = attributes.y || -attributes.radius*2 || -2;
	this._radius = attributes.radius+1/2 || 1;
	
	GL.extend(	this._getters,
				{
					x: 'getX',
					y: 'getY',
					radius: 'getRadius',
					region: 'getRegion',
					attributes: 'getAttributes',
					data: 'getData'
				});
	
	GL.extend(	this._setters,
				{
					x: 'setX',
					y: 'setY',
					position: 'moveTo',
					radius: 'setRadius',
					shift: 'shift',
					resize: 'resize',
					rotation: 'rotate'
				});
};

GL.PointModel.prototype = {
	getAttributes: function () {
		return GL.extend(this._base.getAttributes.call(this),
						{
							x: this._x,
							y: this._y,
							radius: this._radius,
							region: this.getRegion()
						});
	},
	getX: function () {
		return this._x;
	},
	getY: function () {
		return this._y;
	},
	getRadius: function () {
		return this._radius;
	},
	getRegion: function () {
		return {
			l: this._x - this._radius,
			t: this._y - this._radius,
			w: this._radius * 2,
			h: this._radius * 2
		};
	},
	setX: function (X) {
		if(typeof X === 'number' && !isNaN(X)) {
			this._x = X;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.setX()-method.');
		}
	},
	setY: function (Y) {
		if(typeof Y === 'number' && !isNaN(Y)) {
			this._y = Y;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.setY()-method.');
		}
	},
	moveTo: function (X, Y) {
		if(typeof X === 'number' && typeof Y === 'number' &&  !isNaN(X) &&  !isNaN(Y)) {
			this._x = X;
			this._y = Y;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.moveTo()-method.');
		}
	},
	setRadius: function (r) {
		if(typeof r === 'number' && r >= 0) {
			this._radius = r;
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.PointModel.setRadius()-method.');
		}
	},
	shift: function (X, Y) {
		if(typeof X === 'number' && typeof Y === 'number' &&  !isNaN(X) &&  !isNaN(Y)) {
			this._x += X;
			this._y += Y;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.shift()-method.');
		}
	},
	resize: function (X, Y) {
		if(typeof X === 'number' && typeof Y === 'number' &&  !isNaN(X) &&  !isNaN(Y)) {
			if(this._radius + X/2 > 0 && this._radius + Y/2 > 0) {
				this._radius += (X || Y)/2;
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.resize()-method.');
		}
	},
	rotate: function (angle, centerX, centerY) {
		var X,
			Y;
		if(typeof angle === 'number' && typeof centerX === 'number' && typeof centerY === 'number' &&
		   !isNaN(angle) && !isNaN(centerX) && !isNaN(centerY)) {
			if (centerX !== this._x || centerY !== this._y) {
				angle *= Math.PI/180;
				X = this._x*Math.cos(angle) - this._y*Math.sin(angle) - centerX*(Math.cos(angle)-1) + centerY*Math.sin(angle);
				Y = this._x*Math.sin(angle) + this._y*Math.cos(angle) - centerX*Math.sin(angle) - centerY*(Math.cos(angle)-1);
				this._x = X;
				this._y = Y;
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.PointModel.rotate()-method.');
		}
	},

	getData: function (asObject) {
		var jsonObject = GL.extend({
				x: this._x,
				y: this._y,
				radius: this._radius
			},
			this._base.getData.call(this, true));
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}

};

//GL.inherit(GL.ObjectBase, GL.PointModel);
(function () {
	(function inheritObjectBase () {
		if (!GL.ObjectBase) {
			GL.defer(inheritObjectBase, 0);
			return;
		}
		GL.inherit(GL.ObjectBase, GL.PointModel);
	}());
}());