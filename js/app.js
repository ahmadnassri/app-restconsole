// error messages
Error = function(title, text, element) {
    var messages = document.getElement('.messages').removeClass('hide');
    var message = messages.getElement('.alert-message.error').removeClass('hide');
    message.getElement('p').set('html', '<strong>{0}</strong> {1}'.substitute([title, text]));
    message.getElement('a').fireEvent('click', event, 3000);

    if (element) {
        element.getParent('.clearfix').addClass('error');
        element.focus();
    }
};

window.addEvent('domready', function() {
    // enable smooth scrolling
    new Fx.SmoothScroll({
        offset: {
            y: -50
        },
        links: 'a[href^="#"]',
        wheelStops: false
    });

    // remove errors
    document.addEvent('blur:relay(.error)', function(event) {
        this.removeClass('error');
    });

    // save options
    document.getElement('form[name="options"]').addEvent('submit', function(event) {
        event.preventDefault();

        // get form data
        var data = this.toQueryString().parseQueryString();

        // store checkboxes
        this.getElements('input[type="checkbox"]').each(function(element) {
            localStorage.setItem(element.get('name'), element.get('checked'));
        });

        // store theme
        localStorage.setItem('theme', data.theme);
    });

    // show/hide help blocks
    document.getElement('form[name="options"] input[name="help"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.getElements('.help-block').removeClass('hide');
        } else {
            document.getElements('.help-block').addClass('hide');
        }
    });

    // show/hide line numbers
    document.getElement('form[name="options"] input[name="lines"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.getElements('.prettyprint').addClass('linenums');
        } else {
            document.getElements('.prettyprint').removeClass('linenums');
        }
    });

    // theme changer
    document.getElements('form[name="options"] input[name="theme"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.head.getElementById('theme').set('href', 'css/prettify/' + this.get('value') + '.css');
        }
    });

    // load stored options
    Object.each(localStorage, function(value, key) {
        // start with checkboxes
        var checkbox = document.getElement('form[name="options"] input[type="checkbox"][name="{0}"]'.substitute([key]));
        var radio = document.getElement('form[name="options"] input[type="radio"][name="{0}"][value="{1}"]'.substitute([key, value]));

        if (checkbox) {
            checkbox.set('checked', value == 'true' ? true : false)
            checkbox.fireEvent('change');
        } else if (radio) {
            radio.set('checked', true)
            radio.fireEvent('change');
        }
    });

    // messages close action
    document.getElements('.messages .alert-message a.close').addEvent('click', function(event) {
        event.preventDefault();

        this.getParent('.messages').addClass('hide').getElements('.alert-message').addClass('hide');
    });

    // field checkboxes
    document.getElements('div.input-prepend > label.add-on > input[type="checkbox"]').addEvent('change', function(event) {
        this.getParent('div.input-prepend > input, div.input-prepend > textarea').set('disabled', !this.get('checked'));
    }).fireEvent('change');

    // modals backdrop action
    document.getElements('.modals .modal-backdrop').addEvent('click', function(event) {
        this.getParent('.modals').addClass('hide').getElements('.modal').addClass('hide');
    });

    // modals close action
    document.getElements('.modals .modal-header a.close').addEvent('click', function(event) {
        event.preventDefault();

        this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
    });

    // headers & params insert
    document.getElements('ul.params li:last-of-type .btn.success, ul.headers li:last-of-type .btn.success').addEvent('click', function(event) {
        event.preventDefault();

        row = this.getParent().clone();
        this.getParent().grab(row, 'before');
        row.getElements('input').set('disabled', false)[0].focus();
    });

    // headers & params remove
    document.getElements('ul.params, ul.headers').addEvent('click:relay(.btn.danger)', function(event) {
        event.preventDefault();

        this.getParent().dispose();
    });

    // authorization modals
    document.getElements('input[type="button"].authorization').addEvent('click', function(event) {
        event.preventDefault();

        if (this.dataset.type == 'oauth' && document.getElement('input[name="uri"]').get('value') == '') {
            Error('Missing Data', 'Please provide a target URI before setting oAuth Authorization', document.getElement('input[name="uri"]'));
            return;
        }

        document.getElement('.modals').removeClass('hide').getElement('.modal.authorization.' + this.dataset.type).removeClass('hide');
    });

    // basic auth submit event
    document.getElement('form.authorization.basic').addEvents({
        'submit': function(event) {
            event.preventDefault();

            var auth = this.toQueryString().parseQueryString();

            document.getElement('input[name="Authorization"]').set('value', 'Basic ' + btoa(auth.username + ':' + auth.password));

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        },

        'reset': function(event) {
            document.getElement('input[name="Authorization"]').set('value', null);

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        }
    });

    // ensure oauth version is of the right format
    document.getElement('form.authorization.oauth input[name="version"]').addEvent('change', function() {
        this.set('value', parseInt(this.get('value')).toFixed(1));
    });

    // oauth submit event
    document.getElement('form.authorization.oauth').addEvents({
        'submit': function(event) {
            event.preventDefault();

            var request = document.getElement('form[name="request"]').toQueryString().parseQueryString();
            var auth = this.toQueryString().parseQueryString();

            var request = {
                'path': request.uri,
                'action': request.method,
                'method': auth.method,
                'signatures': {
                    'consumer_key': auth.consumer_key,
                    'shared_secret': auth.consumer_secret,
                    'access_token': auth.token_key,
                    'access_secret': auth.token_secret
                }
            };

            var data_query = '';
            //var data_query = Object.toQueryString(options.data);

            if (data_query != '' && request['Content-Type'] == 'application/x-www-form-urlencoded') {
                request.parameters = data_query + '&oauth_version=' + auth.version;
            } else {
                request.parameters = 'oauth_version=' + auth.version;
            }

            var oauth = OAuthSimple().sign(request);

            if (auth.method == 'header') {
                document.getElement('input[name="Authorization"]').set('value', oauth.header);
            } else {
                //options.url = oauth.signed_url;

                // MooTools appends the same body twice
                // TODO: Params!
                //if (form.elements['body[type]'].get('value') == 'application/x-www-form-urlencoded') {
                    //options.url = options.url.replace('&' + form.elements['body[type]'].get('value'), null);
                //}
            }

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        },

        'reset': function(event) {
            document.getElement('input[name="Authorization"]').set('value', null);

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        }
    });

    // save defaults
    document.getElement('form[name="request"] input[type="button"].defaults').addEvent('click', function(event) {
        // get all form data
        var defaults = {};

        defaults = this.getParent('form').toQueryString().parseQueryString();

        localStorage.setItem('defaults', JSON.encode(defaults));
    });

    // request form actions
    document.getElement('form[name="request"]').addEvents({
        'reset': function(event) {
            event.preventDefault();

            defaults = JSON.decode(localStorage.getItem('defaults'));

            Object.each(defaults, function(value, key) {
                var input = document.getElement('input[name="{0}"]'.substitute([key]));

                // set the value
                input.set('value', value);

                // enabled if a disabled field
                if (input.get('disabled')) {
                    input.set('disabled', false);
                    input.getPrevious('.add-on').getElement('input[type="checkbox"]').set('checked', true);
                }
            });
        },

        'submit': function(event) {
            event.preventDefault();

            // get all form data
            var data = this.toQueryString().parseQueryString();

            var headers = Object.clone(data);

            // delete none headers
            delete headers.uri;
            delete headers.method;
            delete headers.timeout;
            delete headers.raw;
            delete headers.encoding;
            delete headers.key;
            delete headers.value;

            var missing = false;

            this.getElements('*[required]').each(function(element) {
                if (element.get('value') == '') {
                    element.getParent('.clearfix').addClass('error');
                    missing = true;
                }
            });

            if (missing) {
                Error('Missing Data', 'Please Fill out all the required fields');
            } else if (data.uri == '' || !/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(data.uri)) {
                Error('Invalid Input', 'Please enter a valid URI', this.getElement('input[name="uri"]'));
            } else {

                if (data.encoding) {
                // special condition for encoding
                    data['Content-Type'] = data['Content-Type'] + '; charset=' + data.encoding;
                }

                var options = {
                    'url': data.uri,
                    'method': data.method,
                    'encoding': data.encoding,
                    'timeout': data.timeout * 1000,
                    'raw': data.raw,
                    'headers': headers,

                    'onTimeout': function() {
                        // TODO replace with notice
                        Error('Error', 'Connection Timed-out');
                    },

                    'onComplete': function(responseText, responseXML) {
                        if (this.xhr.status == 0) {
                            Error('Connection Failed!', 'Check your connectivity and try again');
                        } else {
                            // construct request text
                            var requestText = 'Request URL: {0}\nRequest Method: {1}\n'.substitute([this.options.url, this.options.method]);

                            // uploaded files?
                            //if (document.getElement('[name="file[data]"]').get('value') != '' && document.getElement('[name="file[name]"]').get('value') != '') {
                              //  requestText += 'Files: {0}\n'.substitute([JSON.encode(document.getElement('[name="file[data]"]').files[0])]);
                            //}

                            // data
                            if (this.options.data != '') {
                                switch (typeOf(this.options.data)) {
                                    case 'string':
                                        requestText += 'Params: ' + this.options.data;
                                        break;

                                    case 'object':
                                        requestText += 'Params: ' + JSON.encode(this.options.data)  ;
                                        break;
                                }
                            }

                            var requestHeaders = '';

                            Object.each(this.options.headers, function(value, key) {
                                requestHeaders += key + ': ' + value + "\n";
                            });

                            document.id('requestText').set('text', requestText);
                            document.id('requestHeaders').set('text', requestHeaders);
                            document.id('responseHeaders').set('text', 'Status Code: ' + this.xhr.status + "\n" + this.xhr.getAllResponseHeaders());

                            // extract content type
                            var contentType = this.xhr.getResponseHeader('Content-Type');

                            if (contentType != null) {
                                var index = contentType.indexOf(';');

                                if (index > 1) {
                                    contentType = contentType.slice(0, index);
                                }
                            }

                            switch (contentType) {
                                case 'application/ecmascript':
                                case 'application/javascript':
                                case 'application/json':
                                    responseText = beautify.js(this.xhr.responseText);
                                    document.id('responseText').addClass('lang-js').set('text', responseText);
                                    break;

                                case 'application/atom+xml':
                                case 'application/atomcat+xml':
                                case 'application/atomserv+xml':
                                case 'application/beep+xml':
                                case 'application/davmount+xml':
                                case 'application/docbook+xml':
                                case 'application/rdf+xml':
                                case 'application/rss+xml':
                                case 'application/xhtml+xml':
                                case 'application/xml':
                                case 'application/xspf+xml':
                                case 'application/vnd.google-earth.kml+xml':
                                case 'application/vnd.mozilla.xul+xml':
                                case 'image/svg+xml':
                                case 'text/xml':
                                    //responseXML = beautify.xml(this.xhr.responseXML);

                                    //var declaration = this.xhr.responseText.match(/^(\s*)(<\?xml.+?\?>)/i);

                                    //document.id('responseText').addClass('lang-xml');
                                    //document.id('responseText').appendText(declaration[2] + "\n", 'top');
                                    break;

                                case 'text/html':
                                    document.id('responseText').addClass('lang-html').set('text', this.xhr.responseText);
                                    break;
                            }

                            prettyPrint();

                            document.getElement('a[href="#response"]').fireEvent('click', new DOMEvent());
                        }
                    }
                };

                new RESTRequest(options).send();
            }
        }
    }).fireEvent('reset', new DOMEvent);
});
