//{ points, thickness, fillColor, lineType, color, visible }
GL.RectModel = function GL_RectModel(attributes) {
	attributes = attributes ? ('string' === typeof attributes ? JSON.parse(attributes) : attributes) : {};
	GL.ObjectBase.call(this, GL.extend(attributes, { type: 'rect' }));
	
	this._points = attributes.points || [
		{x: -2, y: -2},
		{x: -2, y: -2},
		{x: -2, y: -2},
		{x: -2, y: -2}
	];
	this._thickness = attributes.thickness || 1/2,
	this._fillColor = attributes.fillColor || {
		r:0,
		g:0,
		b:0,
		a:0
	};
	this._lineType = attributes.lineType || [
		GL.LineTypesEnum.SOLID,
		[10,3]
	];
	this._tempLeftTop = {
		x:undefined,
		y:undefined
	};
	
	GL.extend(	this._getters,
				{
					points: 'getPoints',
					thickness: 'getThickness',
					fillColor: 'getFillColor',
					point: 'getPoint',
					tempLeftTop: 'getTempLeftTop',
					tempLeft: 'getTempLeft',
					tempTop: 'getTempTop',
					region: 'getRegion',
					attributes: 'getAttributes',
					data: 'getData'
				});
	
	GL.extend(	this._setters,
				{
					thickness: 'setThickness',
					fillColor: 'setFillColor',
					lineType: 'setLineType',
					width: 'setWidth',
					height: 'setHeight',
					leftTop: 'moveLeftTopTo',
					rightBottom: 'moveRightBottomTo',
					tempLeftTop: 'moveTempLeftTopTo',
					tempRightBottom: 'moveTempRightBottomTo',
					shift: 'shift',
					resize: 'resize',
					rotation: 'rotate'
				});
};

GL.RectModel.prototype = {
	getAttributes: function () {
		return GL.extend(this._base.getAttributes.call(this),
						{
							points: this._points,
							thickness: this._thickness,
							fillColor: {
								r: this._fillColor.r,
								g: this._fillColor.g,
								b: this._fillColor.b,
								a: this._fillColor.a
							},
							lineType: this._lineType,
							tempLeftTop: this._tempLeftTop,
							region: this.getRegion()
						});
	},

	getLineType: function() {
		return this._lineType;
	},

	setLineType: function(t) {
		if(typeof t === 'object') {
			if(typeof t[0] === 'string' && typeof t[1] === 'object') {
				if(typeof t[1][0] === 'number' && typeof[1][1] === 'number' && t[0] in GL.LineTypesEnum) {
					this._lineType = t;
					return;
				}
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.setLineType()-method.');
		}
	},

	resize: function(x, y){
		var temp,
			defineMinsAndMaxsIndexes = function (pts) {
				var xs = {ids:[], values:[]},
					ys = {ids:[], values:[]},
					j,
					k,
					tmp;
				for(j = 0; j < pts.length; j++) {
					xs.ids.push(j);
					xs.values.push(pts[j].x);
					ys.ids.push(j);
					ys.values.push(pts[j].y);
				}
				for(j = 0; j < pts.length; j++) {
					for(k = 0; k < pts.length; k++) {
						if(xs.values[j] < xs.values[k]) {
							tmp = xs.values[j];
							xs.values[j] = xs.values[k];
							xs.values[k] = tmp;
							tmp = xs.ids[j];
							xs.ids[j] = xs.ids[k];
							xs.ids[k] = tmp;
						}
						if(ys.values[j] < ys.values[k]) {
							tmp = ys.values[j];
							ys.values[j] = ys.values[k];
							ys.values[k] = tmp;
							tmp = ys.ids[j];
							ys.ids[j] = ys.ids[k];
							ys.ids[k] = tmp;
						}
					}
				}
				tmp = {
					x:{
						min:{ids:[], values:[]},
						max:{ids:[], values:[]}
					},
					y:{
						min:{ids:[], values:[]},
						max:{ids:[], values:[]}
					}
				};
				for(j = 0; j < pts.length; j++) {
					if(j < pts.length/2) {
						tmp.x.min.values.push(xs.values[j]);
						tmp.y.min.values.push(ys.values[j]);
						tmp.x.min.ids.push(xs.ids[j]);
						tmp.y.min.ids.push(ys.ids[j]);
					}
					else {
						tmp.x.max.values.push(xs.values[j]);
						tmp.y.max.values.push(ys.values[j]);
						tmp.x.max.ids.push(xs.ids[j]);
						tmp.y.max.ids.push(ys.ids[j]);
					}
				}
				return tmp;
			};
		if(typeof x === 'number' && typeof y === 'number' &&  !isNaN(x) &&  !isNaN(y)) {
				temp = defineMinsAndMaxsIndexes(this._points);
				this._points[temp.x.min.ids[0]].x -= x/2;
				this._points[temp.x.min.ids[1]].x -= x/2;
				this._points[temp.x.max.ids[0]].x += x/2;
				this._points[temp.x.max.ids[1]].x += x/2;

				this._points[temp.y.min.ids[0]].y -= y/2;
				this._points[temp.y.min.ids[1]].y -= y/2;
				this._points[temp.y.max.ids[0]].y += y/2;
				this._points[temp.y.max.ids[1]].y += y/2;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.resize()-method.');
		}
	},

	rotate: function(angle, centerX, centerY) {
		var X,
			Y,
			region,
			i;
		if(typeof angle === 'number' && !isNaN(angle)) {
			if(!(typeof centerX === 'number' && typeof centerY === 'number' && !isNaN(centerX) && !isNaN(centerY))) {
				region = this.getRegion();
				centerX = region.l+region.w/2;
				centerY = region.t+region.h/2;
			}
			angle *= Math.PI/180;
			for(i = 0; i < this._points.length; i++) {
				X = this._points[i].x*Math.cos(angle) - this._points[i].y*Math.sin(angle) - centerX*(Math.cos(angle)-1) + centerY*Math.sin(angle);
				Y = this._points[i].x*Math.sin(angle) + this._points[i].y*Math.cos(angle) - centerX*Math.sin(angle) - centerY*(Math.cos(angle)-1);
				this._points[i].x = X;
				this._points[i].y = Y;
			}
		}
	},

	getRegion: function(){
		var i,
			left = this._points[0].x,
			top = this._points[0].y,
			right = this._points[0].x,
			bottom = this._points[0].y;
		for(i = 1; i < this._points.length; i++) {
			if(this._points[i].x < left) {
				left = this._points[i].x;
			}
			else {
				if(this._points[i].x > right) {
					right = this._points[i].x;
				}
			}
			if(this._points[i].y < top) {
				top = this._points[i].y;
			}
			else {
				if(this._points[i].y > bottom) {
					bottom = this._points[i].y;
				}
			}
		}
		return {
			l: left - this._thickness/2,
			t: top - this._thickness/2,
			w: right - left + this._thickness,
			h: bottom - top + this._thickness
		};
	},

	getPoints: function() {
		return this._points;
	},

	getPoint: function(i) {
		if(i >= 0 && i <= this._points.length) {
			if(this._points[i]) {
				return this._points[i];
			}
		}
		GL.raiseException('ERROR', 'Wrong value provided to GL.RectModel.getPoint()-method.');
	},

	getTempLeft: function() {
		return this._tempLeftTop.x;
	},

	getTempTop: function() {
		return this._tempLeftTop.y;
	},

	getTempLeftTop: function () {
		return this._tempLeftTop;
	},

	getThickness: function() {
		return this._thickness;
	},

	getFillColor: function() {
		return this._fillColor;
	},

	moveLeftTopTo: function(l, t) {
		if(typeof l === 'number' && typeof t === 'number' && !isNaN(l) && !isNaN(t)) {
			this._points[0].x = this._points[3].x = l;
			this._points[0].y = this._points[1].y = t;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.moveLeftTopTo()-method.');
		}
	},

	moveRightBottomTo: function(r, b) {
		if(typeof r === 'number' && typeof b === 'number' && !isNaN(r) && !isNaN(b)/* && r >= this._points[0].x && b >= this._points[0].y*/) {//r >= left && b >= top) {
			this._points[1].x = this._points[2].x = r;
			this._points[3].y = this._points[2].y = b;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.moveRightBottomTo()-method.');
		}
	},

	moveTempLeftTopTo: function(X1, Y1) {
		if(typeof X1 === 'number' && typeof Y1 === 'number' && !isNaN(X1) && !isNaN(Y1)) {
			this._tempLeftTop.x = X1;
			this._tempLeftTop.y = Y1;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.moveTempLeftTopTo()-method.');
		}
	},

	moveTempRightBottomTo: function(r, b) {
		if(typeof r === 'number' && typeof b === 'number' && !isNaN(r) && !isNaN(b)) {
			if(this._tempLeftTop.x > r) {
				this._points[0].x = this._points[3].x = r;
				r = this._tempLeftTop.x;
				this._tempLeftTop.x = this._points[0].x;
			}
			if(this._tempLeftTop > b) {
				this._points[0].y = this._points[1].y = b;
				b = this._tempLeftTop.y;
				this._tempLeftTop.y = this._points[0].y;
			}
			this.moveLeftTopTo(this._tempLeftTop.x, this._tempLeftTop.y);
			this.moveRightBottomTo(r, b);
			this._tempLeftTop = {x:undefined, y:undefined};
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.moveTempRightBottomTo()-method.');
		}
	},

	shift: function(x, y) {
		var i;
		if(typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
			for(i = 0; i < this._points.length; i++) {
				this._points[i].x += x;
				this._points[i].y += y;
			}
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.shift()-method.');
		}
	},

	setFillColor: function(red, green, blue, alpha) {
		if(red >= 0 && green >= 0 && blue >= 0 && alpha >= 0.0 && red <=255 && green <= 255 && blue <= 255 && alpha <= 1.0 &&
		   typeof red === 'number' && typeof green === 'number' && typeof blue === 'number' && typeof alpha === 'number') {
			this._fillColor.r = red;
			this._fillColor.g = green;
			this._fillColor.b = blue;
			this._fillColor.a = alpha;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.setFillColor()-method.');
		}
	},

	setWidth: function(w) {
		if(typeof w === 'number' && w >= 0) {
			this._points[1].x = this._points[0].x + w;
			this._points[2].x = this._points[3].x + w;
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.RectModel.setWidth()-method.');
		}
	},

	setHeight: function(h) {
		if(typeof h === 'number' && h >= 0) {
			this._points[3].y = this._points[0].y + h;
			this._points[2].y = this._points[1].y + h;
		}
		else {
			GL.raiseException('ERROR', 'Wrong value provided to GL.RectModel.setHeight()-method.');
		}
	},

	setThickness: function(t) {
		if(typeof t === 'number' && t >= 0) {
			this._thickness = t;
		}
		else {
			GL.raiseException('ERROR', 'Wrong values provided to GL.RectModel.setThickness()-method.');
		}
	},
	getData: function (asObject) {
		var jsonObject = GL.extend({
				points: this._points,
				thickness: this._thickness,
				fillColor: this._fillColor,
				lineType: this._lineType
			},
			this._base.getData.call(this, true));
		return asObject ? jsonObject : JSON.stringify(jsonObject);
	}
};

//GL.inherit(GL.ObjectBase, GL.RectModel);
(function () {
	(function inheritObjectBase () {
		if (!GL.ObjectBase) {
			GL.defer(inheritObjectBase, 0);
			return;
		}
		GL.inherit(GL.ObjectBase, GL.RectModel);
	}());
}());