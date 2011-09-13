var RESTRequest = new Class({
    'Extends': Request,

    'options': {
        url: '',
        data: {},
        headers: {},
        async: true,
        format: false,
        link: 'ignore',
        isSuccess: null,
        emulation: false,
        urlEncoded: false,
        evalScripts: false,
        evalResponse: false,
        noCache: false
    },

    'send': function(options) {
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

        if (data && (method == 'get' || this.options.rawdata != '')){
            url += (url.contains('?') ? '&' : '?') + data;
            data = null;
        }

        var xhr = this.xhr;
        if ('onprogress' in new Browser.Request){
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

        if (this.options.files != undefined)
        {
            files = document.getElement(this.options.files.element);

            upload = new FormData();
            upload.append(this.options.files.name, files.files[0]);

            Object.each(this.options.data, function(value, key) {
                upload.append(key, value);
            });

            xhr.send(upload);
        }
        else if (this.options.rawdata != '')
        {
            xhr.send(this.options.rawdata);
        }
        else
        {
            xhr.send(data);
        }

        if (!this.options.async) this.onStateChange();
        if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
        return this;
    },
});

var error = function(message, element) {
    document.id('message').toggleClass('visible').getElement('span').set('text', message);

    var func = function() { document.id('message').toggleClass('visible') }.delay(2000);

    if (element) {
        new Fx.Scroll(document.body).toElement(element);
    }
};

window.addEvent('domready', function() {

    // RLM Custom:
    document.addEvent('click:relay(pre.prettyprint span.str)', function(){
      document.getElement('input[name=target[url]]').setProperty('value',this.get('text').replace(/"/g,''));
      document.getElement('nav ul li a[href="#target"]').fireEvent('click')
    });
    $('toggle-response-headers').addEvent('click',function(){
      var sec = $('response-headers');
      if(sec.hasClass('hidden')) sec.removeClass('hidden');
      else sec.addClass('hidden');
      return false;
    });

    new Keyboard({
        'defaultEventType': 'keyup',
        'events': {
            'alt+o': function() { document.getElement('nav ul li a[href="#options"]').fireEvent('click') },
            'alt+t': function() { document.getElement('nav ul li a[href="#target"]').fireEvent('click') },
            'alt+c': function() { document.getElement('nav ul li a[href="#accept"]').fireEvent('click') },
            'alt+z': function() { document.getElement('nav ul li a[href="#auth"]').fireEvent('click') },
            'alt+m': function() { document.getElement('nav ul li a[href="#misc"]').fireEvent('click') },
            'alt+h': function() { document.getElement('nav ul li a[href="#headers"]').fireEvent('click') },
            'alt+b': function() { document.getElement('nav ul li a[href="#body"]').fireEvent('click') },
            'alt+r': function() { document.getElement('nav ul li a[href="#response"]').fireEvent('click') },
        }
    }).activate();

    // show/hide elements
    if (localStorage['display']) {
        var display = JSON.decode(localStorage['display']);
    } else {
        var display = {};
    }

    Object.each(display, function(value, key) {
        document.getElement('section#options input[value="{0}"]'.substitute([key])).set('checked', value ? true : false);
    });

    // set theme
    if (localStorage['theme']) {
        document.getElement('section#options input[value="' + localStorage['theme'] + '"]').set('checked', true);
    } else {
        document.getElement('section#options input[name="theme"]').set('checked', true);
    }

    document.getElements('section#options input[name="display"]').addEvent('change', function() {
        display[this.get('value')] = this.checked;

        localStorage['display'] = JSON.encode(display);

        section = document.getElement('section[rel="' + this.get('value') + '"]');

        if (this.checked) {
            section.show();
        } else {
            section.hide();
        }
    }).fireEvent('change');

    document.getElements('section#options input[name="theme"]').addEvent('change', function() {
        if (this.checked) {
            localStorage['theme'] = this.get('value');

            section = document.id('theme').set('href', this.get('value'));
        }
    }).fireEvent('change');

    // menu navigation
    document.getElements('nav ul li a').addEvent('click', function(e) {
        if (e) e.stop();

        var name = this.get('href').split('#')[1];
        var target = document.id(name);

        document.getElements('section.main').setStyle('height', '0px');
        this.getParent('ul').getElements('.active').removeClass('active');

        this.addClass('active');

        var height = 30;

        target.getElements('section').each(function(section) {
            if (section.getStyle('display') != 'none') {
                height += section.getSize().y + 10;
            }
        });

        target.setStyle('height', height + 'px');
    });

    // focus magic
    // run on all elements except the auth selector
    document.getElements('section.main').addEvent('focus:relay(input:not([name="auth[method]"]), select)', function(e) {
        document.getElement('nav ul li a[href="#' + this.getParent('section.main').id + '"]').fireEvent('click');
    });

    document.getElements('section.main h2').addEvent('click', function(e) {
        document.getElement('nav ul li a[href="#' + this.getParent().id + '"]').fireEvent('click');
    });

    // focus on the url field
    if (window.location.hash) {
        document.getElement('nav ul li a[href="' + window.location.hash + '"]').fireEvent('click');
    } else {
        document.getElement('input[type=url]').focus();
    }

    // create autocomplete lists
    document.getElements('input[list]').each(function(input) {
        var list = document.id(input.get('list')).getElements('option').get('value');
        new Meio.Autocomplete(input, list);
    });

    // Auth
    document.getElements('label input[name="auth[method]"]').addEvent('change', function()
    {
        var method = this.get('value');

        document.getElements('section#auth tr[rel]').hide();
        document.getElements('section#auth tr[rel] select, section#auth tr[rel] input').set('disabled', true);

        document.getElements('section#auth tr[rel="' + method + '"]').setStyle('display', 'table-row');
        document.getElements('section#auth tr[rel="' + method + '"] select, section#auth tr[rel="' + method + '"] input').set('disabled', false);
    });

    document.getElements('label input[name="auth[method]"]').addEvent('focus', function(e) {
        this.fireEvent('change');
        document.getElement('nav ul li a[href="#auth"]').fireEvent('click');
    });

    document.getElements('label input[name="auth[method]"]').addEvent('click', function(e) {
        this.fireEvent('focus');
    });

    // oauth version
    document.getElement('input[name="auth[oauth][version]"]').addEvent('change', function() {
        this.set('value', parseInt(this.get('value')).toFixed(1));
    });

    // Misc
    document.getElements('label input[name^="misc[checkbox]"]').addEvent('change', function()
    {
        if (this.checked) {
            this.getParent().getParent().getParent().getParent().getElements('div input').set('disabled', false);
        } else {
            this.getParent().getParent().getParent().getParent().getElements('div input').set('disabled', true);
        }
    });

    // headers & body params
    document.getElements('li:last-of-type input[name="headers[key][]"], li:last-of-type input[name="headers[value][]"], li:last-of-type input[name="body[params][key][]"], li:last-of-type input[name="body[params][value][]"]').addEvent('focus', function() {
        row = this.getParent().clone();
        row.grab(new Element('input', {'type': 'button', 'value': '-', 'events': {'click': function(e) {e.stop(); this.getParent().dispose(); }}}));
        this.getParent().grab(row, 'before');
        row.getElement('input').focus();
    });

    // reset
    document.getElement('input[type=reset]').addEvent('click', function(e) {
        document.id('requestText').empty();
        document.id('requestHeaders').empty();
        document.id('responseHeaders').empty();
        document.id('responseText').empty().set('class', '');
    });

    // save
    document.getElement('input[name=save]').addEvent('click', function(e) {
        e.stop();

        // text
        textDefaults = {};

        textElements = document.getElements('input[type="url"], input[type="number"], input[type="text"]:not([name="headers[key][]"], [name="headers[value][]"], [name="body[params][key][]"], [name="body[params][value][]"])');

        textElements.get('name').each(function(value, key) {
            textDefaults[value] = textElements.get('value')[key];
        });

        localStorage['text-defaults'] = JSON.encode(textDefaults);

        // radio
        radioDefaults = {};

        radioElements = document.getElements('input[type="radio"]:not([name="theme"])');

        radioElements.get('name').each(function(value, key) {
            if (radioElements[key].checked) {
                radioDefaults[value] = radioElements.get('value')[key];
            }
        });

        localStorage['radio-defaults'] = JSON.encode(radioDefaults);

        // checkboxes
        checkDefaults = {};

        checkElements = document.getElements('input[type="checkbox"]:not([name="display"])');

        checkElements.get('name').each(function(value, key) {
            checkDefaults[value] = checkElements[key].checked;
        });

        localStorage['check-defaults'] = JSON.encode(checkDefaults);

        // select
        selectDefaults = {};

        selectElements = document.getElements('select');

        selectElements.get('name').each(function(value, key) {
            selectDefaults[value] = selectElements.get('value')[key];
        });

        localStorage['select-defaults'] = JSON.encode(selectDefaults);
    });

    // submit
    document.getElements('section#controls input[type="button"]:not([name="save"])').addEvent('click', function() {
        var form = document.getElement('form[name=request]');
        form.elements['target[method]'].set('value', this.get('value'));
        form.fireEvent('submit');
    });

    // load defaults last so that all previous events are triggerd when needed
    // load default values for text elements
    if (localStorage['text-defaults']) {
        var textDefaults = JSON.decode(localStorage['text-defaults']);
    } else {
        var textDefaults = {};
    }

    Object.each(textDefaults, function(value, key) {
        element = document.getElement('[name="{0}"]'.substitute([key]));
        if (element) element.set('value', value);
    });

    // load default values for select elements
    if (localStorage['select-defaults']) {
        var selectDefaults = JSON.decode(localStorage['select-defaults']);
    } else {
        var selectDefaults = {};
    }

    Object.each(selectDefaults, function(value, key) {
        document.getElement('[name="{0}"]'.substitute([key])).getElement('option[value={0}]'.substitute([value])).set('selected', true);
    });

    // load default values for radio elements
    if (localStorage['radio-defaults']) {
        var radioDefaults = JSON.decode(localStorage['radio-defaults']);
    } else {
        var radioDefaults = {};
    }

    Object.each(radioDefaults, function(value, key) {
        document.getElement('[name="{0}"][value="{1}"]'.substitute([key, value])).set('checked', true).fireEvent('change');
    });

    // load default values for checkbox elements
    if (localStorage['check-defaults']) {
        var checkDefaults = JSON.decode(localStorage['check-defaults']);
    } else {
        var checkDefaults = {};
    }

    Object.each(checkDefaults, function(value, key) {
        if (value) {
            document.getElement('[name="{0}"]'.substitute([key])).set('checked', true).fireEvent('change');
        }
    });

    document.getElement('form[name=request]').addEvent('submit', function(e)
    {
        if (e) e.stop();

        document.id('requestText').empty();
        document.id('requestHeaders').empty();
        document.id('responseHeaders').empty();
        document.id('responseText').empty().set('class', '');

        var form = document.getElement('form');

        if (form.elements['target[url]'].get('value') == '' || !/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(form.elements['target[url]'].get('value')))
        {
            error('Please enter a valid URL', form.elements['target[url]']);
        }
        else if (form.elements['accept[type]'].get('value') == '')
        {
            error('Please enter a valid Accept header or choose one from the list', form.elements['accept[type]']);

        }
        else if (form.elements['body[type]'].get('value') == '')
        {
            error('Please enter a valid Content-Type header or choose one from the list', form.elements['body[type]']);
        }
        else
        {
            var options = {
                'url': form.elements['target[url]'].get('value'),
                'method': form.elements['target[method]'].get('value'),
                'encoding': form.elements['body[charset]'].get('value'),
                'timeout': form.elements['target[timeout]'].get('value') * 1000,
                'rawdata': form.elements['body[raw]'].get('value'),
                'headers': {
                    'Accept': form.elements['accept[type]'].get('value'),
                    'Content-Type': form.elements['body[type]'].get('value') + '; charset=' + form.elements['body[charset]'].get('value'),
                    'Accept-Language':  form.elements['accept[language]'].get('value')
                },

                /*
                 * these headers are forbidden to change in chrome
                 * 'Accept-Charset':  form.elements['accept[charset]'].get('value'),
                 * 'Accept-Encoding':  form.elements['accept[encoding]'].get('value'),
                 * 'Cache-Control': form.elements['misc[cache]'].get('value'),
                 * 'Date': form.elements['misc[date]'].get('value'),
                 * 'Connection': form.elements['misc[connection]'].get('value'),
                 * 'Expect': form.elements['misc[expect]'].get('value'),
                 * 'Referer': form.elements['misc[referer]'].get('value'),
                 * 'User-Agent': form.elements['misc[agent]'].get('value'),
                 * 'Via': form.elements['misc[via]'].get('value'),
                 */

                'onProgress': function(event, xhr) {
                    if (event.lengthComputable)
                    {
                        document.getElement('progress').show().set('value', (event.loaded / event.total) * 100);
                    }
                },

                'onTimeout': function() {
                    error('Connection Timed-out');
                },

                'onComplete': function(responseText, responseXML) {
                    if (this.xhr.status == 0) {
                        error('Connection Failed!');
                    } else {
                        var contentType = this.xhr.getResponseHeader('Content-Type');

                        if (contentType != null) {
                            var index = contentType.indexOf(';');

                            if (index > 1)
                            {
                                contentType = contentType.slice(0, index);
                            }
                        }

                        var requestText = 'Request URL: {0}\nRequest Method: {1}\n'.substitute([options.url, options.method]);

                        // uploaded files?
                        if (document.getElement('[name="file[data]"]').get('value') != '' && document.getElement('[name="file[name]"]').get('value') != '') {
                            requestText += 'Files: {0}\n'.substitute([JSON.encode(document.getElement('[name="file[data]"]').files[0])]);
                        }

                        // data
                        switch (typeOf(this.options.data)) {
                            case 'string':
                                requestText += 'Params: ' + this.options.data;
                                break;

                            case 'object':
                                requestText += 'Params: ' + JSON.encode(this.options.data)  ;
                                break;
                        }

                        var requestHeaders = '';
                        Object.each(options.headers, function(value, key) {
                            requestHeaders += key + ': ' + value + "\n";
                        });

                        document.id('requestText').set('text', requestText);
                        document.id('requestHeaders').set('text', requestHeaders);
                        document.id('responseHeaders').set('text', 'Status Code: ' + this.xhr.status + "\n" + this.xhr.getAllResponseHeaders());

                        switch (contentType)
                        {
                            case 'application/json':
                                responseText = beautify.js(this.xhr.responseText);
                                document.id('responseText').set('class', 'prettyprint lang-js').set('text', responseText);
                                break;

                            case 'text/xml':
                            case 'application/xml':
                            case 'application/rss+xml':
                            case 'application/atom+xml':
                                responseXML = beautify.xml(this.xhr.responseXML);

                                var declaration = this.xhr.responseText.match(/^(\s*)(<\?xml.+?\?>)/i);

                                document.id('responseText').set('class', 'prettyprint lang-xml').appendChild(responseXML)
                                document.id('responseText').appendText(declaration[2] + "\n", 'top');
                                break;

                            case 'text/html':
                                document.id('responseText').set('class', 'prettyprint lang-html').set('text', this.xhr.responseText);
                                break;

                            default:
                                document.id('responseText').set('class', 'prettyprint').set('text', this.xhr.responseText);
                                break;
                        }

                        prettyPrint();

                        document.getElements('nav ul li a[href="#response"]').fireEvent('click');
                    }
                }
            };

            if (form.elements['misc[if][match]'].get('value') != '') {
                options.headers['If-Match'] = form.elements['misc[if][match]'].get('value');
            }

            if (form.elements['misc[if][nonematch]'].get('value') != '') {
                options.headers['If-None-Match'] = form.elements['misc[if][nonematch]'].get('value');
            }

            if (form.elements['misc[if][modifiedsince]'].get('value') != '') {
                options.headers['If-Modified-Since'] = form.elements['misc[if][modifiedsince]'].get('value');
            }

            if (form.elements['misc[if][unmodifiedsince]'].get('value') != '') {
                options.headers['If-Unmodified-Since'] = form.elements['misc[if][unmodifiedsince]'].get('value');
            }

            if (form.elements['misc[if][range]'].get('value') != '') {
                options.headers['If-Range'] = form.elements['misc[if][range]'].get('value');
            }

            if (form.elements['misc[forwards]'].get('value') != '') {
                options.headers['Max-Forwards'] = form.elements['misc[forwards]'].get('value');
            }

            if (form.elements['misc[pragma]'].get('value') != '') {
                options.headers['Pragma'] = form.elements['misc[pragma]'].get('value');
            }

            if (form.elements['misc[range]'].get('value') != '') {
                options.headers['Range'] = form.elements['misc[range]'].get('value');
            }

            options.data = {};

            form.getElements('input[name="body[params][key][]"]').each(function(key, index) {
                if (key.get('value') != '') {
                    options.data[key.get('value')] = form.getElements('input[name="body[params][value][]"]')[index].get('value');
                }
            });

            switch (form.getElement('input[name="auth[method]"]:checked').get('value'))
            {
                case 'manual':
                    options.headers.Authorization = form.elements['auth[manual]'].get('value');
                    break;

                case 'plain':
                    options.user = form.elements['auth[plain][username]'].get('value');
                    options.password = form.elements['auth[plain][password]'].get('value');
                    break;

                case 'basic':
                    options.headers.Authorization = 'Basic ' + btoa(form.elements['auth[basic][username]'].get('value') + ':' + form.elements['auth[basic][password]'].get('value'));
                    break;

                case 'oauth':
                    var request = {
                        'path': form.elements['target[url]'].get('value'),
                        'action': form.elements['target[method]'].get('value'),
                        'method': form.elements['auth[oauth][method]'].get('value'),
                        'signatures': {
                            'consumer_key': form.elements['auth[oauth][consumer][key]'].get('value'),
                            'shared_secret': form.elements['auth[oauth][consumer][secret]'].get('value'),
                            'access_token': form.elements['auth[oauth][token][key]'].get('value'),
                            'access_secret': form.elements['auth[oauth][token][secret]'].get('value')
                        }
                    };

                    var data_query = Object.toQueryString(options.data);

                    if (data_query != '' && form.elements['body[type]'].get('value') == 'application/x-www-form-urlencoded') {
                        request.parameters = data_query + '&oauth_version=' + form.elements['auth[oauth][version]'].get('value');
                    } else {
                        request.parameters = 'oauth_version=' + form.elements['auth[oauth][version]'].get('value');
                    }

                    var oauth = OAuthSimple().sign(request);

                    if (form.elements['auth[oauth][method]'].get('value') == 'header') {
                        options.headers.Authorization = oauth.header;
                    } else {
                        options.url = oauth.signed_url;

                        // MooTools appends the same body twice
                        // TODO: Params!
                        //if (form.elements['body[type]'].get('value') == 'application/x-www-form-urlencoded') {
                            //options.url = options.url.replace('&' + form.elements['body[type]'].get('value'), null);
                        //}
                    }
                    break;

                case 'none':
                default:
                    break;
            }

            if (form.elements['file[data]'].get('value') != '' && form.elements['file[name]'].get('value') != '') {
                options.files = {
                    'name': form.elements['file[name]'].get('value'),
                    'element': 'input[name="file[data]"]'
                }

                delete options.headers['Content-Type'];
            }

            form.getElements('input[name="headers[key][]"]').each(function(key, index) {
                if (key.get('value') != '') {
                    options.headers[key.get('value')] = form.getElements('input[name="headers[value][]"]')[index].get('value');
                }
            });

            new RESTRequest(options).send();
        }
    });
});
