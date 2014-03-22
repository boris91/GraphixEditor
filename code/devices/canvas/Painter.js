GL.Painter = {

	//POINT: {x, y, color, radius, isSquare}
	renderPoint: function (context, data) {
		var x = data.x,
			y = data.y,
			color = data.color,
			radius = data.radius,
			isSquare = data.isSquare;
		context.beginPath();

		context.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
		isSquare ? context.fillRect(x - radius, y - radius, radius * 2, radius * 2) : context.arc(x, y, radius, 2 * Math.PI, 0);
		context.fill();

		context.closePath();
	},

	//LINE: {x1, y1, x2, y2, color, width, lineType}
	renderLine: function (context, data) {
		var x1 = data.x1,
			y1 = data.y1,
			x2 = data.x2,
			y2 = data.y2,
			color = data.color,
			width = data.width,
			lineType = data.lineType,
			dashArray = lineType[1],
			dashCount = dashArray.length,
			dx = x2 - x1 + .000001,
			dy = y2 - y1,
			slope = dy / dx,
			distRemaining = Math.sqrt(dx * dx + dy * dy),
			dashIndex = 0,
			draw = true,
			dashLength,
			xStep;

		context.beginPath();

		context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
		context.lineWidth = width;

		context.moveTo(x1, y1);

		switch (lineType[0]) {
			case GL.LineTypesEnum.SOLID:
				context.lineTo(x2, y2);
				break;
			case GL.LineTypesEnum.DASHED:
				while (distRemaining >= 0.1) {
					dashLength = dashArray[dashIndex++ % dashCount];
					if (dashLength > distRemaining)
						dashLength = distRemaining;
					xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
					if (dx < 0)
						xStep = -xStep;
					x1 += xStep;
					y1 += slope * xStep;
					context[draw ? 'lineTo' : 'moveTo'](x1, y1);
					distRemaining -= dashLength;
					draw = !draw;
				}
				break;
		}

		context.stroke();
		context.closePath();
	},

	//RECT: {points, color, thickness, fillColor, lineType}
	renderRect: function (context, data) {
		var points = data.points,
			color = data.color || { r: 0, g: 0, b: 0, a: 1 },
			thickness = data.thickness,
			fillColor = data.fillColor || { r: 0, g: 0, b: 0, a: 0.5 },
			lineType = data.lineType;

		context.lineWidth = thickness;
		context.fillStyle = 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ',' + fillColor.a + ')';
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (i = 1; i < points.length; i++) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.lineTo(points[0].x, points[0].y);
		context.fill();
		context.closePath();

		switch (lineType[0]) {
			case GL.LineTypesEnum.SOLID:
				context.moveTo(points[0].x, points[0].y);
				context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
				for (i = 1; i < points.length; i++) {
					context.lineTo(points[i].x, points[i].y);
				}
				context.lineTo(points[0].x, points[0].y);
				context.lineTo(points[1].x, points[1].y);
				break;
			case GL.LineTypesEnum.DASHED:
				context.beginPath();
				context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
				context.moveTo(points[0].x, points[0].y);
				for (i = 1; i < points.length; i++) {
					this.renderLine(context,
									{
										x1: points[i - 1].x,
										y1: points[i - 1].y,
										x2: points[i].x,
										y2: points[i].y,
										color: color,
										width: thickness,
										lineType: lineType
									});
				}
				this.renderLine(context,
								{
									x1: points[3].x,
									y1: points[3].y,
									x2: points[0].x,
									y2: points[0].y,
									color: color,
									width: thickness,
									lineType: lineType
								});
				break;
		}

		context.lineJoin = 'miter';
		context.stroke();

		context.closePath();
	},

	//REGPOLY: {points, anglesCount, color, thickness, fillColor, lineType}
	renderRegpoly: function (context, data) {
		this.renderPoly(context, data);
	},

	//POLY: {points, anglesCount, color, thickness, fillColor, lineType}
	renderPoly: function (context, data) {
		var points = data.points,
			anglesCount = data.anglesCount,
			color = data.color,
			thickness = data.thickness,
			fillColor = data.fillColor,
			lineType = data.lineType,
			i;

		context.fillStyle = 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ',' + fillColor.a + ')';
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (i = 1; i < points.length; i++) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.lineTo(points[0].x, points[0].y);
		context.fill();
		context.closePath();

		switch (lineType[0]) {
			case GL.LineTypesEnum.SOLID:
				context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
				context.lineWidth = thickness;

				context.beginPath();

				context.moveTo(points[0].x, points[0].y);

				for (i = 1; i < anglesCount; i++) {
					context.lineTo(points[i].x, points[i].y);
				}

				context.lineTo(points[0].x, points[0].y);
				context.lineTo(points[1].x, points[1].y);

				context.lineJoin = 'miter';
				context.stroke();

				context.closePath();
				break;
			case GL.LineTypesEnum.DASHED:
				for (i = 0; i < anglesCount; i++) {
					this.renderLine(context,
									{
										x1: points[i].x,
										y1: points[i].y,
										x2: points[(i < anglesCount - 1) ? i + 1 : 0].x,
										y2: points[(i < anglesCount - 1) ? i + 1 : 0].y,
										color: color,
										width: thickness,
										lineType: lineType
									});
				}
				break;
		}
	},

	//CIRCLE: {centerX, centerY, radius, color, thickness, fillColor, lineType}
	renderCircle: function (context, data) {
		var centerX = data.centerX,
			centerY = data.centerY,
			radius = data.radius,
			color = data.color,
			thickness = data.thickness,
			fillColor = data.fillColor,
			lineType = data.lineType,
			i;

		context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
		context.fillStyle = 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ',' + fillColor.a + ')';

		context.beginPath();
		context.arc(centerX, centerY, radius, 2 * Math.PI, 0);
		context.fill();

		switch (lineType[0]) {
			case GL.LineTypesEnum.SOLID:
				context.stroke();
				context.closePath();
				break;
			case GL.LineTypesEnum.DASHED:
				context.closePath();
				break;
		}
	},

	//ELLIPSE: {centerX, centerY, width, height, color, thickness, fillColor, lineType}
	renderEllipse: function (context, data) {
		var width = data.width,
			height = data.height,
			color = data.color,
			thickness = data.thickness,
			fillColor = data.fillColor,
			lineType = data.lineType,
			x = data.centerX - width / 2,
			y = data.centerY - height / 2,
			kappa = .5522848,
			ox = (width / 2) * kappa,
			oy = (height / 2) * kappa,
			xe = x + width,
			ye = y + height,
			xm = x + width / 2,
			ym = y + height / 2;

		context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
		context.fillStyle = 'rgba(' + fillColor.r + ',' + fillColor.g + ',' + fillColor.b + ',' + fillColor.a + ')';
		context.lineWidth = thickness;

		context.beginPath();
		context.moveTo(x, ym);
		context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		context.fill();
		context.stroke();
		context.closePath();
	},

	//IMAGE: {image, left, top, width, height}
	renderImage: function (context, data) {
		context.beginPath();
		context.drawImage(data.image, data.left, data.top, data.width, data.height);
		context.closePath();
	},

	//SELECT: {left, top, width, height}
	renderSelect: function (context, data) {
		var blackLength = 4,
			whiteLength = 4,
			left = data.left,
			top = data.top,
			right = left + data.width,
			bottom = top + data.height,
			lineColor = { r: 0, g: 0, b: 0, a: 1 },
			lineWidth = 1,
			temp;
		if (left > right) {
			temp = left;
			left = right;
			right = temp;
		}
		if (top > bottom) {
			temp = top;
			top = bottom;
			bottom = temp;
		}

		this.renderLine(context,
						{
							x1: left - 2,
							y1: top - 2,
							x2: right + 2,
							y2: top - 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [blackLength, right - left < blackLength ? 0 : whiteLength]]
						});
		this.renderLine(context,
						{
							x1: right + 2,
							y1: top - 2,
							x2: right + 2,
							y2: bottom + 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [blackLength, bottom - top < blackLength ? 0 : whiteLength]]
						});
		this.renderLine(context,
						{
							x1: right + 2,
							y1: bottom + 2,
							x2: left - 2,
							y2: bottom + 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [blackLength, right - left < blackLength ? 0 : whiteLength]]
						});
		this.renderLine(context,
						{
							x1: left - 2,
							y1: bottom + 2,
							x2: left - 2,
							y2: top - 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [blackLength, bottom - top < blackLength ? 0 : whiteLength]]
						});

		lineColor = { r: 255, g: 255, b: 255, a: 1 };

		this.renderLine(context,
						{
							x1: left - 2 + blackLength,
							y1: top - 2,
							x2: right + 2,
							y2: top - 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [right - left < blackLength ? 0 : whiteLength, blackLength]]
						});
		this.renderLine(context,
						{
							x1: right + 2,
							y1: top - 2 + blackLength,
							x2: right + 2,
							y2: bottom + 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [bottom - top < blackLength ? 0 : whiteLength, blackLength]]
						});
		this.renderLine(context,
						{
							x1: right + 2 - blackLength,
							y1: bottom + 2,
							x2: left - 2,
							y2: bottom + 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [right - left < blackLength ? 0 : whiteLength, blackLength]]
						});
		this.renderLine(context,
						{
							x1: left - 2,
							y1: bottom + 2 - blackLength,
							x2: left - 2,
							y2: top - 2,
							color: lineColor,
							width: lineWidth,
							lineType: [GL.LineTypesEnum.DASHED, [bottom - top < blackLength ? 0 : whiteLength, blackLength]]
						});

		context.fillStyle = 'rgba(255,255,255,1)';
		context.fillRect(left - 5, top - 5, 5, 5);
		context.fillRect(right, top - 5, 5, 5);
		context.fillRect(right, bottom, 5, 5);
		context.fillRect(left - 5, bottom, 5, 5);
		context.fillRect(left + (right - left) / 2 - 5 + 2.5, top + (bottom - top) / 2 - 5 + 2.5, 5, 5);

		context.fillStyle = 'rgba(0,0,0,1)';
		context.fillRect(left - 4, top - 4, 3, 3);
		context.fillRect(right + 1, top - 4, 3, 3);
		context.fillRect(right + 1, bottom + 1, 3, 3);
		context.fillRect(left - 4, bottom + 1, 3, 3);
		context.fillRect(left + (right - left) / 2 - 4 + 2.5, top + (bottom - top) / 2 - 4 + 2.5, 3, 3);
	}

};