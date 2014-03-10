function ChromeSocketXMLHttpRequest() {
    Object.defineProperties(this, {
        options: {
            enumerable: false,
            writable: true,
            value: {
                url: null,
                uri: null,
                data: null,
                method: null,
                createInfo: null,
                inprogress: false,
                timer: {
                    id: null,
                    expired: false
                },
                headers: {
                    'Connection': 'close',
                    'Accept-Encoding': 'identity',
                    'Content-Length': 0
                },
                response: {
                    headers: null,
                    responseText: null
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
    this.disconnect();
};

ChromeSocketXMLHttpRequest.prototype.getResponseHeader = function (header) {
    // TODO: use regex
};

ChromeSocketXMLHttpRequest.prototype.getAllResponseHeaders = function () {
    return this.options.response.headers;
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

    this.options.inprogress = true;
    this.options.data = data || null;

    chrome.sockets.tcp.create(socketProperties, this.onCreate.bind(this));

    if (this.timeout > 0) {
        this.options.timer.id = setTimeout(this.expireTimer.bind(this), this.timeout);
    }
};

ChromeSocketXMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    this.options.headers[header] = value;
};

ChromeSocketXMLHttpRequest.prototype.sendAsBinary = function (body) {
};


ChromeSocketXMLHttpRequest.prototype.onCreate = function (createInfo) {
    if (!this.options.inprogress) {
        return;
    }

    var port = this.options.uri.port() ? this.options.uri.port() : 80;

    this.options.createInfo = createInfo;

    chrome.sockets.tcp.connect(createInfo.socketId, this.options.uri.hostname(), port, this.onConnect.bind(this));
};

ChromeSocketXMLHttpRequest.prototype.onConnect = function (result) {
    if (!this.options.inprogress) {
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
        // assign recieve listner
        chrome.sockets.tcp.onReceive.addListener(this.onReceive.bind(this));

        //
        this.getMessage().toArrayBuffer(function sendMessage (buffer) {
            chrome.sockets.tcp.send(this.options.createInfo.socketId, buffer, this.onSend.bind(this));
        }.bind(this));
    }
};

ChromeSocketXMLHttpRequest.prototype.getMessage = function () {
    var headers = [];

    // add missing parts to header
    headers.push(this.options.method + ' ' + this.options.uri.resource() + ' HTTP/1.1');

    for (var name in this.options.headers) {
        headers.push(name + ': ' + this.options.headers[name]);
    }

    return headers.join('\r\n') + '\r\n\r\n' + this.options.data;
};

ChromeSocketXMLHttpRequest.prototype.error = function (error) {
    if (this.options.inprogress) {
        this.disconnect();
    }

    if (this.onerror) {
        this.onerror(error);
    }
};

ChromeSocketXMLHttpRequest.prototype.disconnect = function () {
    this.options.inprogress = false;

    if (this.options.createInfo !== null) {
        chrome.sockets.tcp.disconnect(this.options.createInfo.socketId);
        chrome.sockets.tcp.close(this.options.createInfo.socketId);
        this.options.createInfo = null;
    }
};

ChromeSocketXMLHttpRequest.prototype.expireTimer = function () {
    if (this.responseText === null) {
        this.disconnect();
        this.options.timer.expired = true;
        this.error({error: 'timeout'});
    }
};

ChromeSocketXMLHttpRequest.prototype.onSend = function (sendInfo) {
    if (sendInfo.resultCode < 0) {
        this.error({error: 'sending error'});
        this.disconnect();
    }
};

ChromeSocketXMLHttpRequest.prototype.onReceive = function (info) {
    if (!this.options.inprogress) {
        return;
    }

    if (info.socketId !== this.options.createInfo.socketId) {
        return;
    }

    this.disconnect();

    info.data.toString(function (response) {
        response = response.split('\r\n\r\n');
        this.options.response.headers = response.shift();
        this.options.response.responseText = response.join('\r\n\r\n');

        this.responseText = this.options.responseText;

        console.log('headers: ', this.options.response.headers);
        console.log('body: ', this.options.response.responseText);
    }.bind(this));
};

ArrayBuffer.prototype.toString = function (callback) {
    var blob = new Blob([this]);
    var reader = new FileReader();

    reader.onload = function (e) {
        callback(e.target.result);
    };

    reader.readAsText(blob);
};

String.prototype.toArrayBuffer = function (callback) {
    var blob = new Blob([this]);
    var reader = new FileReader();

    reader.onload = function (e) {
        callback(e.target.result);
    };

    reader.readAsArrayBuffer(blob);
};
