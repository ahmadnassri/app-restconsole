(function(){

var empty = function(){},
    progressSupport = ('onprogress' in new Browser.Request);

var RESTRequest = this.RESTRequest = new Class({

    Implements: [Chain, Events, Options],

    options: {
        url: '',
        raw: '',
        data: '',
        files: [],
        headers: {},
        async: true,
        format: false,
        method: 'get',
        link: 'ignore',
        isSuccess: null,
        emulation: false,
        urlEncoded: false,
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
        if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return Browser.exec(text);
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

    'send': function(options){
        if (!this.check(options)) return this;

        this.options.isSuccess = this.options.isSuccess || this.isSuccess;
        this.running = true;

        var type = typeOf(options);
        if (type == 'string' || type == 'element') options = {data: options};

        var old = this.options;
        options = Object.append({data: old.data, url: old.url, method: old.method}, options);
        var data = options.data, url = String(options.url), method = options.method.toLowerCase();

        switch (typeOf(data)){
            case 'element': data = document.id(data).toQueryString(); break;
            case 'object': case 'hash': data = Object.toQueryString(data);
        }

        if (this.options.format){
            var format = 'format=' + this.options.format;
            data = (data) ? format + '&' + data : format;
        }

        if (this.options.emulation && !['get', 'post'].contains(method)){
            var _method = '_method=' + method;
            data = (data) ? _method + '&' + data : _method;
            method = 'post';
        }

        if (this.options.urlEncoded && ['post', 'put'].contains(method)){
            var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
            this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
        }

        if (!url) url = document.location.pathname;

        var trimPosition = url.lastIndexOf('/');
        if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

        if (this.options.noCache)
            url += (url.contains('?') ? '&' : '?') + String.uniqueID();

        // REST Console: if RAW data is present, treat `data` as query string
        if (data && (method == 'get' || this.options.raw != '')) {
            url += (url.contains('?') ? '&' : '?') + data;
            data = null;
        }

        var xhr = this.xhr;
        if (progressSupport){
            xhr.onloadstart = this.loadstart.bind(this);
            xhr.onprogress = this.progress.bind(this);
        }

        xhr.open(method.toUpperCase(), url, this.options.async, this.options.user, this.options.password);
        if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;

        xhr.onreadystatechange = this.onStateChange.bind(this);

        Object.each(this.headers, function(value, key){
            try {
                xhr.setRequestHeader(key, value);
            } catch (e){
                this.fireEvent('exception', [key, value]);
            }
        }, this);

        this.fireEvent('request');

        // REST Console: special handling of files
        if (this.options.files.length > 0) {

            // TODO: change this to match above
            files = document.getElement(this.options.files.element);

            upload = new FormData();
            upload.append(this.options.files.name, files.files[0]);

            Object.each(this.options.data, function(value, key) {
                upload.append(key, value);
            });

            xhr.send(upload);
        } else if (this.options.raw != '') {
            xhr.send(this.options.raw);
        } else {
            xhr.send(data);
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

})();
