/*(function (window) {
    'use strict';

    var RESTRequest = window.RESTRequest = function (options) {
        Object.defineProperties(this, {
            xhr: new XMLHttpRequest,
            files: [],
            headers: {},
            format: false,
            method: 'get',
            link: 'ignore',
            urlEncoded: false,
            encoding: 'utf-8',
            evalResponse: false,
            timeout: 0,
            noCache: false,

            request: {
                enumerable: true,

                get: function () {
                    return this._request;
                },

                set: function (value) {
                    if (!(value instanceof HTTPArchiveRequest)) {
                        throw new Error('invalid request object.');
                    }

                    this._request = value;
                }
            },

            response: {
                enumerable: true,

                get: function () {
                    return this._response;
                },

                set: function (value) {
                    if (!(value instanceof HTTPArchiveResponse)) {
                        throw new Error('invalid request object.');
                    }

                    this._response = value;
                }
            }
        });

        this.setOptions(options);
    };

    RESTRequest.prototype.setHeader: function (name, value) {
        this.headers[name] = value;
        return this;
    });

    RESTRequest.prototype.setOptions = function (options) {
        if (arguments.length == 0) {
            throw new Error('constructor called with no arguments, expected options.');
        }

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('invalid options object.');
        }

        for (var key in options) {
            if (options.hasOwnProperty(key)){
                this[key] = options[key];
            }
        }

        return this;
    };


        success: function () {
            this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
        },

        failure: function () {
            this.onFailure();
        },

        onFailure: function () {
            this.fireEvent('complete').fireEvent('failure', this.xhr);
        },

        loadstart: function (event){
            this.fireEvent('loadstart', [event, this.xhr]);
        },

        progress: function (event) {
            this.fireEvent('progress', [event, this.xhr]);
        },

        timeout: function () {
            this.fireEvent('timeout', this.xhr);
        },



        getHeader: function (name) {
            return function .attempt(function (){
                return this.xhr.getResponseHeader(name);
            }.bind(this));
        },

        check: function () {
            if (!this.running) return true;
            switch (this.options.link){
                case 'cancel': this.cancel(); return true;
                case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
            }
            return false;
        },

        send: function () {
            this.running = true;

            if (this.options.urlEncoded && ['post', 'put'].contains(method)){
                var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
                this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
            }

            if (!url) url = document.location.pathname;

            var trimPosition = url.lastIndexOf('/');
            if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

            if (this.options.noCache)
                url += (url.contains('?') ? '&' : '?') + String.uniqueID();


            var xhr = this.xhr;
                xhr.onloadstart = this.loadstart.bind(this);
                xhr.onprogress = this.progress.bind(this);

            xhr.open(method.toUpperCase(), url, true);
            if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;

            xhr.onreadystatechange = function () {
                var xhr = this.xhr;
                if (xhr.readyState != 4 || !this.running) return;
                this.running = false;
                this.status = 0;
                function .attempt(function (){
                    var status = xhr.status;
                    this.status = (status == 1223) ? 204 : status;
                }.bind(this));
                xhr.onreadystatechange = null;
                xhr.onprogress = xhr.onloadstart = null;
                clearTimeout(this.timer);

                this.response = {text: this.xhr.responseText || '', xml: this.xhr.responseXML};

                if (this.status >= 200 && this.status < 300) {
                    this.success(this.response.text, this.response.xml);
                } else {
                    this.failure();
                }
            }

            Object.each(this.headers, function (value, key){
                try {
                    xhr.setRequestHeader(key, value);
                } catch (e){
                    this.fireEvent('exception', [key, value]);
                }
            }, this);

            this.fireEvent('request');

            // REST Console: special handling of files
            if (this.options.files.length > 0) {
                var upload = new FormData();

                // restructure the upload object with the request params
                Object.each(this.data, function (value, key) {
                    upload.append(key, value);
                });

                // add files
                for (var i = 0, file; file = this.options.files[i]; ++i) {
                    if (this.options.file_key) {
                        upload.append(this.options.file_key, file);
                    } else {
                        upload.append(file.name, file);
                    }
                };

                xhr.send(upload);
            } else {
                xhr.send(data);
            }

            if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
            return this;
        },

        cancel: function () {
            if (!this.running) {
                return this;
            }

            this.running = false;

            this.xhr.abort();
            clearTimeout(this.timer);
            this.xhr.onreadystatechange = null;
            this.xhr.onprogress = this.xhr.onloadstart = null;

            // TODO ?
            this.xhr = new XMLHttpRequest();
            this.fireEvent('cancel');
            return this;
        }
    });
})(window || this);
*/
