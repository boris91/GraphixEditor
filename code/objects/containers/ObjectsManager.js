//{ treeModel }
GL.ObjectsManager = function GL_ObjectsManager(treeModel) {
	treeModel = (treeModel ? ('string' === typeof treeModel ? JSON.parse(treeModel) : treeModel) : {});
	this._objects = {};
	this._parents = {};
	this._selected = {};
	this._selectedCount = 0;
	this._clipboard = {};
	this._clipboardCount = 0;
	this._removeToTrash = true;
	this._trash = {
		removed: {},
		objects: {},
		parents: {}
	};
	this._forEachInProgress = false;
	this._forEachSelectedInProgress = false;
	this._rangeInProgress = false;
	this._activeLayerId = this.basicLayerId;

	this._init(treeModel);
};

GL.ObjectsManager.prototype = {
	//private API
	_clear: function () {
		var props = [
				'_objects',
				'_parents',
				'_selected',
				'_clipboard',
				['_trash', 'removed'],
				['_trash', 'objects'],
				['_trash', 'parents']
			],
			prop,
			i,
			j;
		for (i = 0; i < props.length; i++) {
			prop = ('string' === typeof props[i]) ? this[props[i]] : this[props[i][0]][props[i][1]];
			for (j in prop) {
				delete prop[j];
			}
		}
		this._selectedCount = 0;
		this._clipboardCount = 0;
	},
	_init: function (treeModel) {
		var id;
		this._objects[this.rootId] = GL.create('layer', { id: this.rootId, visible: true, allowSubLayers: true });
		if (!treeModel[this.basicLayerId]) {
			treeModel[this.basicLayerId] = { type: 'layer', id: this.basicLayerId, visible: true, active: true };
		}
		for (id in treeModel) {
			this.add(treeModel[id], this.rootId);
		}
		this.activate(this.basicLayerId);
	},
	_resetFamilyIds: function (jsonObject) {
		var childre, childId, newChildId;
		jsonObject.id = (jsonObject.type + '_' + GL.generateUniqueId());
		if ('layer' === jsonObject.type) {
			children = jsonObject.children;
			for (childId in children) {
				this._resetFamilyIds(children[childId]);
				newChildId = children[childId].id;
				children[newChildId] = children[childId];
				delete children[childId];
			}
		}
	},
	_getObjectForTreeModel: function (id) {
		var jsonObject = this._objects[id].getData(true),
			children, childId;
		if ('layer' === jsonObject.type) {
			children = jsonObject.children;
			for (childId in children) {
				children[childId] = this._getObjectForTreeModel(childId);
			}
		}
		return jsonObject;
	},

	//public API
	rootId: '$root$',
	basicLayerId: '$basic$',
	enableRemoveToTrash: function (value) {
		this._removeToTrash = !!value;
	},
	range: function (action, arg1) {
		var i,
			j,
			args,
			results = [];
		this._rangeInProgress = true;
		for (i = 0; i < arg1.length; i++) {
			args = [];
			for (j = 1; j < arguments.length; j++) {
				args.push(arguments[j][i]);
			}
			results.push(this[action].apply(this, args));
		}
		this._rangeInProgress = false;
		return results;
	},
	add: function (jsonObject, parentId) {//rewrite this method
		parentId = parentId || this._activeLayerId || this.rootId;
		var stampedObject = GL.create(jsonObject.type, jsonObject),
			id = stampedObject.getId(),
			children, childId, child;
		this._objects[id] = stampedObject;
		this._parents[id] = parentId;
		this._objects[parentId].add(id);
		if (jsonObject.children) {
			children = jsonObject.children;
			for (childId in children) {
				child = children[childId];
				if ('layer' !== child.type || jsonObject.allowSubLayers) {
					this.add(children[childId], id);
				}
			}
		}
	},
	edit: function (id, attributes) {
		var object = this._objects[id],
			prop;
		for (prop in attributes) {
			object.set(prop, attributes[prop]);
		}
	},
	reorder: function (id, newOrder) {
		this._objects[this._parents[id]].setOrder(id, newOrder);
	},
	forEach: function (handler/*args: [object, id]*/, layerId, selectedOnly, applyToInnerLayersObjects, applyToLayers, _isRecursiveCall) {
		if (this._forEachInProgress && !_isRecursiveCall) {
			return;
		} else if (!_isRecursiveCall) {
			this._forEachInProgress = true;
		}
		var objects = this._objects,
			children = selectedOnly ? this._selected : objects[layerId || this._activeLayerId || this.rootId].getChildren(),
			childId, child;
		for (childId in children) {
			child = objects[childId];
			if (child.hasType('layer')) {
				if (applyToLayers) {
					handler(child, childId);
				}
				if (applyToInnerLayersObjects) {
					this.forEach(handler, childId, false, true, applyToLayers, true);
				}
			} else {
				handler(child, childId);
			}
		}
		if (!_isRecursiveCall) {
			this._forEachInProgress = false;
		}
	},
	forEachSelected: function (handler/*args: [object, id]*/, applyToInnerLayersObjects, applyToLayers, _isRecursiveCall) {
		if (this._forEachSelectedInProgress && !_isRecursiveCall) {
			return;
		} else if (!_isRecursiveCall) {
			this._forEachSelectedInProgress = true;
		}
		var selected = this._selected,
			objects = this._objects,
			objectId, object;
		for (objectId in selected) {
			object = objects[objectId];
			if (object.hasType('layer')) {
				if (applyToLayers) {
					handler(object, objectId);
				}
				if (applyToInnerLayersObjects) {
					this.forEachSelected(handler, true, applyToLayers, true);
				}
			} else {
				handler(object, objectId);
			}
		}
		if (!_isRecursiveCall) {
			this._forEachSelectedInProgress = false;
		}
	},
	remove: function (id, _skipRemovingFromParentIfToTrash) {
		var object = this._objects[id],
			children, childId;
		if (object.hasType('layer')) {
			children = object.getChildren();
			for (childId in children) {
				this.remove(childId, true);
			}
		}
		if (!this._removeToTrash || (this._removeToTrash && !_skipRemovingFromParentIfToTrash)) {
			this._objects[this._parents[id]].remove(id);
		}
		if (this._removeToTrash) {
			if (!_skipRemovingFromParentIfToTrash) {
				this._trash.removed[id] = true;
			}
			this._trash.objects[id] = this._objects[id].getData(true);
			this._trash.parents[id] = this._parents[id];
		}
		this.unselect(id);
		delete this._objects[id];
		delete this._parents[id];
	},
	recoverFromTrash: function (id) {
		var object = this._trash.objects[id],
			parentId = this._trash.parents[id],
			children = {},
			childId;
		if (object.children) {
			for (childId in object.children) {
				children[childId] = this._trash.objects[childId];
				this.removeFromTrash(childId);
			}
		}
		delete this._trash.removed[id];
		delete this._trash.objects[id];
		delete this._trash.parents[id];
		object.children = children;
		this.add(object, this._objects[parentId] ? parentId : this._activeLayerId);
	},
	removeFromTrash: function (id) {
		var object = this._trash.objects[id],
			childId;
		if (object.children) {
			for (childId in object.children) {
				this.removeFromTrash(childId);
			}
		}
		delete this._trash.removed[id];
		delete this._trash.objects[id];
		delete this._trash.parents[id];
	},
	clearTrash: function () {
		var id;
		for (id in this._trash.removed) {
			this.removeFromTrash(id);
		}
	},
	clear: function (layerId) {
		var layer = this._objects[layerId],
			children = layer.getChildren(),
			childId;
		for (childId in children) {
			this.remove(childId);
		}
		layer.clear();
	},
	move: function (id, newParentId) {
		newParentId = newParentId || this._activeLayerId;
		this._objects[this._parents[id]].remove(id);
		this._parents[id] = newParentId;
		this._objects[newParentId].add(id);
	},
	isSelectionEmpty: function () {
		return !!this._selectedCount;
	},
	getSelectedCount: function () {
		return this._selectedCount;
	},
	isSelected: function (id) {
		return !!this._selected[id];
	},
	select: function (id) {
		if (!this.isSelected(id)) {
			this._objects[id].toggleSelection(true);
			this._selected[id] = true;
			this._selectedCount++;
		}
	},
	unselect: function (id) {
		if (this.isSelected(id)) {
			this._objects[id].toggleSelection(false);
			delete this._selected[id];
			this._selectedCount--;
		}
	},
	clearSelection: function () {
		var id;
		for (id in this._selected) {
			this._objects[id].toggleSelection(false);
			delete this._selected[id];
		}
		this._selectedCount = 0;
	},
	copy: function (id, _isRecursiveCall) {
		if (!this._rangeInProgress) {
			this.clearClipboard();
		}
		var objectCopy = JSON.parse(this._objects[id].getData()),
			children, childId, childCopy;
		if ('layer' === objectCopy.type) {
			children = {};
			for (childId in objectCopy.children) {
				childCopy = this.copy(childId, true);
				children[childCopy.id] = childCopy;
			}
			objectCopy.children = children;
		}
		if (!_isRecursiveCall) {
			this._clipboard[objectCopy.id] = objectCopy;
			this._clipboardCount++;
		}
		return objectCopy;
	},
	cut: function (id) {
		this.copy(id);
		this.remove(id);
	},
	paste: function (layerId) {
		var id, object;
		layerId = layerId || this._activeLayerId;
		for (id in this._clipboard) {
			object = JSON.parse(JSON.stringify(this._clipboard[id]));
			this._resetFamilyIds(object);
			this.add(object, layerId);
		}
	},
	clearClipboard: function () {
		var id;
		for (id in this._clipboard) {
			delete this._clipboard[id];
		}
		this._clipboardCount = 0;
	},
	activate: function (layerId) {
		this.deactivate();
		this._objects[layerId].toggleActivity(true);
		this._activeLayerId = layerId;
	},
	deactivate: function (activateRoot) {
		this._objects[this._activeLayerId].toggleActivity(false);
		if (activateRoot) {
			this._objects[this.rootId].toggleActivity(true);
			this._activeLayerId = this.rootId;
		}
	},
	hideLayer: function (layerId) {
		this._objects[layerId || this._activeLayerId].toggleVisibility(false);
	},
	showLayer: function (layerId) {
		this._objects[layerId || this._activeLayerId].toggleVisibility(true);
	},
	exists: function (id) {
		return !!this._objects[id];
	},
	reInit: function (treeModel) {
		this._clear();
		this._init(treeModel || {});
	},
	getTreeModel: function (asObject) {
		var rootChildrenIds = this._objects[this.rootId].getChildren(),
			treeModel = {},
			childId;
		for (childId in rootChildrenIds) {
			treeModel[childId] = this._getObjectForTreeModel(childId);
		}
		return (asObject ? treeModel : JSON.stringify(treeModel));
	}
};