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

// add events
window.addEvent('domready', function() {
    // enable smooth scrolling
    new Fx.SmoothScroll({
        'offset': { 'y': -50 },
        'links': 'a[scroll][href^="#"]',
        'wheelStops': true
    });

    document.addEvent('click:relay(.prettyprint span.str)', function(event) {
        document.getElement('input[name="uri"]').set('value',this.get('text').replace(/"/g,''));
        //document.getElement('nav ul li a[href="#target"]').fireEvent('click')
    });

    // special scroll listener for the request form actions bar
    window.addEvent('scroll', function(event) {
        var scroll = window.getSize().y + window.getScroll().y;
        var coordinates = document.id('request').getCoordinates();

        var element = document.getElement('form[name="request"] .actions');

        if (scroll - 200 <= coordinates.top || scroll >= coordinates.bottom) {
            element.removeClass('fixed');
        } else {
            element.addClass('fixed');
        }
    });

    // pills actions
    document.getElements('ul.pills li a').addEvent('click', function(event) {
        event.preventDefault();

        var ul = this.getParent('ul');

        ul.getElements('.active').removeClass('active');
        this.getParent().addClass('active');

        // hide all then show the selected one
        ul.getNext('ul').getElements(' > li').addClass('hide');
        ul.getNext('ul').getElement(this.get('href')).getParent().removeClass('hide');
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

    // stop current xhr button
    document.getElement('.stop').addEvent('click', function(event) {
        if (window.XHR) {
            window.XHR.cancel();
        }
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
                    'data': {},
                    'raw': data.raw,
                    'headers': headers,

                    'onRequest': function() {
                        // replace buttons with animation
                        document.getElement('form[name="request"] .actions').addClass('progress');
                    },

                    'onProgress': function(event, xhr){
                        var loaded = event.loaded, total = event.total;

                        //console.log(parseInt(loaded / total * 100, 10));
                    },

                    'onTimeout': function() {
                        // TODO replace with notice
                        Error('Error', 'Connection Timed-out');

                        // remove loading animation
                        document.getElement('form[name="request"] .actions').removeClass('progress');
                    },

                    'onCancel': function() {
                        // remove loading animation
                        document.getElement('form[name="request"] .actions').removeClass('progress');
                    },

                    'onComplete': function(responseText, responseXML) {
                        // rest response fields
                        document.id('responseBody').empty().set('class', 'prettyprint');
                        document.id('responseHeaders').empty().set('class', 'prettyprint');
                        document.id('responsePreview').empty();
                        document.id('requestBody').empty().set('class', 'prettyprint');
                        document.id('requestHeaders').empty().set('class', 'prettyprint');

                        // trigger show/hide line numbers
                        document.getElement('form[name="options"] input[name="lines"]').fireEvent('change');

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

                            // setup response area
                            document.id('requestBody').set('text', requestText);
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
                                    responseText = beautify.js(responseText);
                                    document.id('responseBody').addClass('lang-js').set('text', responseText);
                                    break;

                                case 'application/atom+xml':
                                case 'application/atomcat+xml':
                                case 'application/atomserv+xml':
                                case 'application/beep+xml':
                                case 'application/davmount+xml':
                                case 'application/docbook+xml':
                                case 'application/rdf+xml':
                                case 'application/rss+xml':
                                case 'application/xml':
                                case 'application/xspf+xml':
                                case 'application/vnd.google-earth.kml+xml':
                                case 'application/vnd.mozilla.xul+xml':
                                case 'image/svg+xml':
                                case 'text/xml':
                                    responseXML = beautify.xml(responseXML);

                                    var declaration = responseText.match(/^(\s*)(<\?xml.+?\?>)/i);
                                    document.id('responseBody').addClass('lang-xml').set('text', declaration[2] + "\n" + responseXML.firstChild.nodeValue);
                                    break;

                                case 'text/html':
                                case 'application/xhtml+xml':
                                    document.id('responseBody').addClass('lang-html').set('text', responseText);

                                    // create and inject the iframe object
                                    var iframe = new IFrame();
                                    document.id('responsePreview').adopt(iframe);

                                    // start writing
                                    var doc = iframe.contentWindow.document;
                                    doc.open();
                                    doc.write(responseText);
                                    doc.close();
                                    break;
/*
 * requires xhr.responseType to be set BEFORE the request is sent
 * this.xhr.responseType = 'blob' or this.xhr.responseType = 'arraybuffer'

                                case 'image/jpeg':
                                    // create and inject the iframe object
                                    var iframe = new IFrame();
                                    document.id('responsePreview').adopt(iframe);

                                    // render the image blob
                                    var bb = new window.WebKitBlobBuilder();
                                    bb.append(this.xhr.response);

                                    // if using arraybuffer do this
                                    // other wise just use blob method
                                    // but its not currently implemented in chrome
                                    var blob = bb.getBlob('image/png');

                                    //~ var img = document.createElement('img');
                                    //~ img.onload = function(e) {
                                      //~ window.webkitURL.revokeObjectURL(img.src); // Clean up after yourself.
                                    //~ };
                                    var src = window.webkitURL.createObjectURL(blob);

                                    // start writing
                                    var doc = iframe.contentWindow.document;
                                    doc.open();
                                    doc.write('<img src="' + src + '"/>');
                                    doc.close();
                                    break;
 */
                            }

                            // syntax highlighting
                            prettyPrint();

                            // scroll to the response area
                            document.getElement('a[href="#response"]').fireEvent('click', new DOMEvent());

                            // open the response body tab
                            document.getElement('a[href="#responseBody"]').fireEvent('click', new DOMEvent());

                            // remove loading animation
                            document.getElement('form[name="request"] .actions').removeClass('progress');
                        }
                    }
                };

                // set custom headers
                var headers = {
                    'keys': this.getElements('ul.headers input[name="key"]'),
                    'values': this.getElements('ul.headers input[name="value"]')
                };

                headers.keys.each(function(key, index) {
                    if (key.get('value') != '') {
                        options.headers[key.get('value')] = headers.values[index].get('value');
                    }
                });

                // set custom params
                var params = {
                    'keys': this.getElements('ul.params input[name="key"]'),
                    'values': this.getElements('ul.params input[name="value"]')
                };

                params.keys.each(function(key, index) {
                    if (key.get('value') != '') {
                        options.data[key.get('value')] = params.values[index].get('value');
                    }
                });

                window.XHR = new RESTRequest(options).send();
            }
        }
    }).fireEvent('reset', new DOMEvent);
});
