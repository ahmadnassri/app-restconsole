/*
---

name: Request

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires: [Object, Element, Chain, Events, Options, Browser]

provides: Request

...
*/

(function(){

var empty = function(){},
    progressSupport = ('onprogress' in new Browser.Request);

var Request = this.Request = new Class({

    Implements: [Chain, Events, Options],

    options: {/*
        onRequest: function(){},
        onLoadstart: function(event, xhr){},
        onProgress: function(event, xhr){},
        onComplete: function(){},
        onCancel: function(){},
        onSuccess: function(responseText, responseXML){},
        onFailure: function(xhr){},
        onException: function(headerName, value){},
        onTimeout: function(){},
        user: '',
        password: '',*/
        url: '',
        query: {},
        payload: {},
        files: [],
        headers: {
            'Accept': 'application/json'
        },
        async: true,
        method: 'get',
        link: 'ignore',
        isSuccess: null,
        emulation: false,
        encoding: 'utf-8',
        evalScripts: false,
        evalResponse: false,
        timeout: 0,
        noCache: false
    },

    initialize: function(options){
        this.xhr = new Browser.Request();
        this.setOptions(options);
        this.headers = this.options.headers;
    },

    onStateChange: function(){
        var xhr = this.xhr;
        if (xhr.readyState != 4 || !this.running) return;
        this.running = false;
        this.status = 0;
        Function.attempt(function(){
            var status = xhr.status;
            this.status = (status == 1223) ? 204 : status;
        }.bind(this));
        xhr.onreadystatechange = empty;
        if (progressSupport) xhr.onprogress = xhr.onloadstart = empty;
        clearTimeout(this.timer);

        this.response = {text: this.xhr.responseText || '', xml: this.xhr.responseXML};
        if (this.options.isSuccess.call(this, this.status))
            this.success(this.response.text, this.response.xml);
        else
            this.failure();
    },

    isSuccess: function(){
        var status = this.status;
        return (status >= 200 && status < 300);
    },

    isRunning: function(){
        return !!this.running;
    },

    processScripts: function(text){
        if (this.options.evalResponse && (/(ecma|java)script/).test(this.getHeader('Content-type'))) return Browser.exec(text);
        return text.stripScripts(this.options.evalScripts);
    },

    success: function(text, xml){
        this.onSuccess(this.processScripts(text), xml);
    },

    onSuccess: function(){
        this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
    },

    failure: function(){
        this.onFailure();
    },

    onFailure: function(){
        this.fireEvent('complete').fireEvent('failure', this.xhr);
    },

    loadstart: function(event){
        this.fireEvent('loadstart', [event, this.xhr]);
    },

    progress: function(event){
        this.fireEvent('progress', [event, this.xhr]);
    },

    timeout: function(){
        this.fireEvent('timeout', this.xhr);
    },

    setHeader: function(name, value){
        this.headers[name] = value;
        return this;
    },

    getHeader: function(name){
        return Function.attempt(function(){
            return this.xhr.getResponseHeader(name);
        }.bind(this));
    },

    check: function(){
        if (!this.running) return true;
        switch (this.options.link){
            case 'cancel': this.cancel(); return true;
            case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
        }
        return false;
    },

    send: function(options){
        if (!this.check(options)) return this;

        this.options.isSuccess = this.options.isSuccess || this.isSuccess;
        this.running = true;

        var query = this.options.query, payload = this.options.payload, url = String(this.options.url), method = this.options.method.toLowerCase();

        if (!url) {
            url = document.location.pathname;
        }

        var trimPosition = url.lastIndexOf('/');
        if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

        if (this.options.noCache) {
            //url += (url.contains('?') ? '&' : '?') + String.uniqueID();
            // TODO set cache headers
        }

        if (['object', 'hash'].contains(typeOf(query))) {
            query = Object.toQueryString(query);
        }

        if (query.length) {
            url += (url.contains('?') ? '&' : '?') + query;
        }

        var xhr = this.xhr;

        if (progressSupport) {
            xhr.onloadstart = this.loadstart.bind(this);
            xhr.onprogress = this.progress.bind(this);
        }

        xhr.open(method.toUpperCase(), url, this.options.async, this.options.user, this.options.password);

        xhr.overrideMimeType('text/plain; charset=x-user-defined')

        if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;

        xhr.onreadystatechange = this.onStateChange.bind(this);

        if (this.options.files.length > 0) {
            // make sure the content-type header is reset
            delete this.options.headers['Content-Type'];
        }

        Object.each(this.headers, function(value, key){
            try {
                xhr.setRequestHeader(key, value);
            } catch (e){
                this.fireEvent('exception', [key, value]);
            }
        }, this);

        this.fireEvent('request');

        // special handling of files
        if (this.options.files.length > 0) {
            var data = new FormData();

            // restructure the upload object with the request params
            if (['object', 'hash'].contains(typeOf(payload))) {
                Object.each(payload, function(value, key) {
                   data.append(key, value);
                });
            } else {
                data.append(null, payload);
            }

            // add files
            if (this.options.files.constructor.name == 'FileList') {
                for (var i = 0, file; file = this.options.files[i]; ++i) {
                    data.append(file.key ? file.key : file.name, file);
                }
            } else {
                Object.each(this.options.files, function(files) {
                    for (var i = 0, file; file = files[i]; ++i) {
                        data.append(file.key ? file.key : file.name, file);
                    }
                });
            }

            xhr.send(data);
        } else {
            switch (typeOf(payload)){
                case 'element':
                    payload = document.id(payload).toQueryString(); break;
                    break;

                case 'object':
                case 'hash':
                    payload = Object.toQueryString(payload);
                    break;
            }

            xhr.send(payload);
        }

        if (!this.options.async) this.onStateChange();
        if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
        return this;
    },

    cancel: function(){
        if (!this.running) return this;
        this.running = false;
        var xhr = this.xhr;
        xhr.abort();
        clearTimeout(this.timer);
        xhr.onreadystatechange = empty;
        if (progressSupport) xhr.onprogress = xhr.onloadstart = empty;
        this.xhr = new Browser.Request();
        this.fireEvent('cancel');
        return this;
    }

});

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
    methods[method] = function(data){
        var object = {
            method: method
        };
        if (data != null) object.data = data;
        return this.send(object);
    };
});

Request.implement(methods);

Element.Properties.send = {

    set: function(options){
        var send = this.get('send').cancel();
        send.setOptions(options);
        return this;
    },

    get: function(){
        var send = this.retrieve('send');
        if (!send){
            send = new Request({
                data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
            });
            this.store('send', send);
        }
        return send;
    }

};

Element.implement({

    send: function(url){
        var sender = this.get('send');
        sender.send({data: this, url: url || sender.options.url});
        return this;
    }

});

})();
