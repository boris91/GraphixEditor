GL.XhrManager = function GL_XhrManager () {
    var self = null,
        _xhrs = {},//requests in progress (not responsed yet)
	    //private API
	    _create = function (method, url, async, headers) {
		    var xhr = new XMLHttpRequest(),
			    headerName;
		    xhr.open(method, url, async);
		    for (headerName in (headers || {})) {
			    xhr.setRequestHeader(headerName, headers[headerName]);
		    }
		    return xhr;
	    },
	    _send = function (xhr, data) {
		    var xhrId = "xhr_" + GL.generateUniqueId();
		    xhr.id = xhrId;
		    _add(xhrId, xhr);
		    xhr.send(data || null);
	    },
	    _add = function (xhrId, xhr) {
		    _xhrs[xhrId] = xhr;
	    },
	    _remove = function (xhrId) {
		    delete _xhrs[xhrId].id;
		    delete _xhrs[xhrId];
	    },
	    _clear = function () {
		    _xhrs = {};
	    },
	    _syncReadyStateChangeHandler = function (xhr, callbacks) {
		    var defaultSyncCallback = function () { return arguments[0]; };
		    callbacks = callbacks || {
			    ok: defaultSyncCallback,
			    fail: defaultSyncCallback
		    };
		    try {
			    if (200 === xhr.status) {
				    callbacks.ok = callbacks.ok || defaultSyncCallback;
				    return callbacks.ok(xhr.response);
			    } else {
				    callbacks.fail = callbacks.fail || defaultSyncCallback;
				    //TODO: pass not xhr, but some error info (statusText maybe?)
				    return callbacks.fail(xhr);
			    }
		    } finally {
			    _remove(xhr.id);
		    }
	    },
        _getAsyncReadyStateChangeHandler = function (xhr, callbacks) {
            return function () {
                if (4 === xhr.readyState) {
                    return self._syncReadyStateChangeHandler(xhr, callbacks);
                }
            };
        };
    return self = {
        //public API
        send: function (async, method, url, headers, data, callbacks) {
            var sendMethodName = async ? "sendAsync" : "sendSync";
            return this[sendMethodName](method, url, headers, data, callbacks);
        },
        sendSync: function (method, url, headers, data, callbacks) {
            var xhr = _create(method, url, false, headers);
            _send(xhr, data);
            return _syncReadyStateChangeHandler(xhr, callbacks);
        },
        sendAsync: function (method, url, headers, data, callbacks) {
            var xhr = _create(method, url, true, headers);
            xhr.onreadystatechange = _getAsyncReadyStateChangeHandler(xhr, callbacks);
            _send(xhr, data);
            return xhr.id;
        },
        sendSyncGet: function (url, headers, data, callbacks) {
            return this.sendSync("GET", url, headers, data, callbacks);
        },
        sendAsyncGet: function (url, headers, data, callbacks) {
            return this.sendAsync("GET", url, headers, data, callbacks);
        },
        sendSyncPost: function (url, headers, data, callbacks) {
            return this.sendSync("POST", url, headers, data, callbacks);
        },
        sendAsyncPost: function (url, headers, data, callbacks) {
            return this.sendAsync("POST", url, headers, data, callbacks);
        },
        abort: function (xhrId) {
            //abort incoming request if it's in progress & return true OR return false if it's already sent
            var xhr = _xhrs[xhrId];
            if (xhr) {
                xhr.abort();
                return true;
            }
            return false;
        }
    };
};