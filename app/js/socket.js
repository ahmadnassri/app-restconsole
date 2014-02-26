function ChromeSocketXMLHttpRequest() {
    Object.defineProperties(this, {
        options: {
            enumerable: false,
            writable: true,
            value: {
                createInfo: null,
                method: null,
                closed: false,
                url: null,
                uri: null,
                timer: {
                    id: null,
                    expired: false
                },
                headers: {
                    'Connection': 'close',
                    'Accept-Encoding': 'identity',
                    'Content-Length': 0
                }
            }
        },

        onreadystatechange: {
            enumerable: true,
            writable: true,
            value: null
        },

        onload: {
            enumerable: true,
            writable: true,
            value: null
        },

        onerror: {
            enumerable: true,
            writable: true,
            value: null
        },

        onprogress: {
            enumerable: true,
            writable: true,
            value: null
        },

        readyState: {
            enumerable: true,
            writable: true,
            value: 0
        },

        response: {
            enumerable: true,
            writable: true,
            value: null
        },

        responseText: {
            enumerable: true,
            writable: true,
            value: null
        },

        responseType: {
            enumerable: true,
            writable: true,
            value: ''
        },

        responseXML: {
            enumerable: true,
            writable: true,
            value: null
        },

        status: {
            enumerable: true,
            writable: true,
            value: 0
        },

        statusText: {
            enumerable: true,
            writable: true,
            value: null
        },

        timeout: {
            enumerable: true,
            writable: true,
            value: 0
        },

        ontimeout: {
            enumerable: true,
            writable: true,
            value: null
        },

        upload: {
            enumerable: true,
            writable: true,
            value: null
        },

        withCredentials: {
            enumerable: true,
            writable: true,
            value: false
        },
    });
}

ChromeSocketXMLHttpRequest.prototype.abort = function () {
};

ChromeSocketXMLHttpRequest.prototype.getResponseHeader = function () {
};

ChromeSocketXMLHttpRequest.prototype.getAllResponseHeaders = function (header) {
};

ChromeSocketXMLHttpRequest.prototype.open = function (method, url) {
    this.options.method = method;
    this.options.url = url;
    this.options.uri = new URI(url);

    this.setRequestHeader('Host', this.options.uri.hostname());
};

ChromeSocketXMLHttpRequest.prototype.overrideMimeType = function (mimetype) {
};

ChromeSocketXMLHttpRequest.prototype.send = function (data) {
    var socketProperties = {
        persistent: false,
        name: 'RESTConsole-ChromeSocketXMLHttpRequest'
    };

    chrome.sockets.tcp.create(socketProperties, this._onCreate.bind(this));

    if (this.timeout > 0) {
        this.options.timer.id = setTimeout(this._expireTimer.bind(this), this.timeout);
    }
};

ChromeSocketXMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    this.options.headers[header] = value;
};

ChromeSocketXMLHttpRequest.prototype.sendAsBinary = function (body) {
};


ChromeSocketXMLHttpRequest.prototype._onCreate = function (createInfo) {
    if (this.options.closed) {
        return;
    }

    var port = this.options.uri.port() ? this.options.uri.port() : 80;

    this.options.createInfo = createInfo;

    chrome.sockets.tcp.connect(createInfo.socketId, this.options.uri.hostname(), port, this._onConnect.bind(this));
};

ChromeSocketXMLHttpRequest.prototype._onConnect = function (result) {
    if (this.options.closed) {
        return;
    }

    if (this.options.timer.expired) {
        return;
    } else if (result < 0) {
        this.error({
            error: 'connection error',
            code: result
        });
    } else {
        var headers = [];

        // add missing parts to header
        headers.push(this.options.method + ' ' + this.options.uri.resource() + ' HTTP/1.1');

        for (var name in this.options.headers) {
            headers.push(name + ': ' + this.options.headers[name]);
        }

        headers = headers.join('\r\n') + '\r\n\r\n';

        chrome.sockets.tcp.onReceive.addListener(this._onReceive.bind(this));

        chrome.socket.tcp.send(this.options.createInfo.socketId, headers.toArrayBuffer(), this._onSend.bind(this));
    }
};

ChromeSocketXMLHttpRequest.prototype._onError = function (error) {
    if (!this.options.closed) {
        this._close();
    }

    if (this.onerror) {
        this.onerror(error);
    }
};

ChromeSocketXMLHttpRequest.prototype._close = function () {
    this.options.closed = true;

    if (this.options.createInfo !== null) {
        chrome.socket.tcp.disconnect(this.options.createInfo.socketId);
        chrome.socket.tcp.destroy(this.options.createInfo.socketId);
        this.options.createInfo = null;
    }
};

ChromeSocketXMLHttpRequest.prototype._expireTimer = function () {
    if (this.responseText === null) {
        this._close();
        this.options.timer.expired = true;
        this.error({error: 'timeout'});
    }
};

ChromeSocketXMLHttpRequest.prototype._onSend = function (sendInfo) {
    if (sendInfo.resultCode < 0) {
        this.error({error: 'sending error'});
        this._close();
    }
};

ChromeSocketXMLHttpRequest.prototype._onReceive = function (info) {
    if (this.options.closed) {
        return;
    }

    if (info.socketId !== this.options.createInfo.socketId) {
        return;
    }

//    this._close();

    console.log(String.fromCharCode.apply(null, new Uint16Array(info.data)));
};





String.prototype.toArrayBuffer = function () {
    var buf = new ArrayBuffer(this.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);

    for (var i = 0, strLen = this.length; i < strLen; i++) {
        bufView[i] = this.charCodeAt(i);
    }

    return buf;
};
