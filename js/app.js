// error messages
Error = function(title, text, element) {
    var messages = document.getElement('.messages').removeClass('hide');
    var message = messages.getElement('.alert-message.error').removeClass('hide');
    message.getElement('p').set('html', '<strong>{0}</strong> {1}'.substitute([title, text]));
    message.getElement('a').fireEvent('click', event, 3000);

    if (element) {
        element.getParent('.clearfix').addClass('error');
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

    // setup autocomplete
    if ('options' in document.createElement('datalist') == false) {
        new AutoComplete();
    }

    // pills actions
    document.getElements('ul.pills li a').addEvent('click', function(event) {
        event.preventDefault();

        var ul = this.getParent('ul');

        ul.getElements('.active').removeClass('active');
        this.getParent().addClass('active');

        // hide all then show the selected one
        ul.getNext('ul').getElements(' > li').addClass('hide');
        ul.getNext('ul').getElement(this.get('href')).getParent().removeClass('hide');

        _gaq.push(['_trackEvent', this.get('text'), 'clicked']);
    });

    // remove errors
    document.addEvent('blur:relay(.error)', function(event) {
        this.removeClass('error');
    });

    // show/hide help blocks
    document.getElement('form[name="options"] input[name="help"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.getElements('.help-block').addClass('hide');
        } else {
            document.getElements('.help-block').removeClass('hide');
        }
    });

    // show/hide line numbers
    document.getElement('form[name="options"] input[name="lines"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.getElements('.prettyprint').removeClass('linenums');
        } else {
            document.getElements('.prettyprint').addClass('linenums');
        }
    });

    // theme changer
    document.getElements('form[name="options"] input[name="theme"]').addEvent('change', function(event) {
        if (this.get('checked')) {
            document.head.getElementById('theme').set('href', 'css/prettify/' + this.get('value') + '.css');

            _gaq.push(['_trackEvent', 'Theme', this.get('value')]);
        }
    }).fireEvent('change');

    // options form
    document.getElement('form[name="options"]').addEvents({
        'click:relay(input[type="button"], input[type="submit"], input[type="reset"])': function(event) {
            event.preventDefault();

            this.getParent('form').fireEvent(this.dataset.action, event);
        },

        'submit': function(event) {
            var data = this.toQueryString().parseQueryString();
            localStorage.setItem('options', JSON.encode(data));
        },

        'reset': function(event) {
            var defaults = JSON.decode(localStorage.getItem('options'));

            Object.each(defaults, function(value, key) {
                var input = document.getElement('input[name="{0}"]:not([type="radio"]), input[type="radio"][name="{0}"][value="{1}"]'.substitute([key, value]));

                switch (input.get('type')) {
                    case 'checkbox':
                        input.set('checked', value == 'on' ? true : false).fireEvent('change');
                        break;

                    case 'radio':
                        input.set('checked', true).fireEvent('change');
                        break;
                }
            });
        }
    }).fireEvent('reset', new DOMEvent);

    // messages close action
    document.getElements('.messages .alert-message a.close').addEvent('click', function(event) {
        event.preventDefault();

        this.getParent('.messages').addClass('hide').getElements('.alert-message').addClass('hide');
    });

    // modals backdrop action
    document.getElements('.modals .modal-backdrop').addEvent('click', function(event) {
        this.getParent('.modals').addClass('hide').getElements('.modal').addClass('hide');
    });

    // modals close action
    document.getElements('.modals .modal-header a.close').addEvent('click', function(event) {
        event.preventDefault();

        this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
    });

    // field checkboxes
    document.getElements('div.input-prepend > label.add-on > input[type="checkbox"]').addEvent('change', function(event) {
        this.getParent('div.input-prepend > input, div.input-prepend > textarea').set('disabled', !this.get('checked'));
    }).fireEvent('change');

    // headers & params
    document.getElements('ul.params, ul.headers').addEvents({
        'click:relay(.btn.success)': function(event) {
            event.preventDefault();

            row = this.getParent().clone();
            this.getParent().grab(row, 'before');
            row.getElements('input').set('disabled', false)[0].focus();
        },

        'click:relay(.btn.danger)': function(event) {
            event.preventDefault();

            this.getParent().dispose();
        }
    });

    // basic auth submit event
    document.getElement('form.authorization.basic').addEvents({
        'submit': function(event) {
            event.preventDefault();

            var auth = this.toQueryString().parseQueryString();

            var input = document.getElement('input[name="Authorization"]');
            input.set('value', 'Basic ' + btoa(auth.username + ':' + auth.password));
            input.getPrevious('.add-on').getElement('input[type="checkbox"]').set('checked', true).fireEvent('change');

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

    // oauth form
    document.getElement('form.authorization.oauth').addEvents({
        'click:relay(input[type="button"], input[type="submit"], input[type="reset"])': function(event) {
            event.preventDefault();

            this.getParent('form').fireEvent(this.dataset.action, event);

            _gaq.push(['_trackEvent', 'oAuth Form', this.dataset.action]);
        },

        'submit': function(event) {
            event.preventDefault();

            var form = document.getElement('form[name="request"]');
            var request = form.toQueryString().parseQueryString();

            var data = this.toQueryString().parseQueryString();

            // oauth object
            var oauth = {
                'path': request.uri,
                'action': request.method,
                'method': data.signature,
                'parameters': {
                    'oauth_version': data.version
                },
                'signatures': {
                    'consumer_key': data.consumer_key,
                    'shared_secret': data.consumer_secret,
                    'access_token': data.token_key,
                    'access_secret': data.token_secret
                }
            };

            // GET/POST params
            var elements = {
                'keys': form.getElements('ul.params input[name="key"]'),
                'values': form.getElements('ul.params input[name="value"]')
            };

            elements.keys.each(function(key, index) {
                if (key.get('value') != '') {
                    oauth.parameters[key.get('value')] = elements.values[index].get('value');
                }
            });

            oauth.parameters = Object.toQueryString(oauth.parameters);

            // sign oauth object
            var oauth = OAuthSimple().sign(oauth, data.separator);

            // params container
            var container = document.getElement('ul.params');

            // remove old rows if any
            container.getElements('li').each(function(row) {
                if (row.dataset.oauth) {
                    row.destroy();
                }
            });

            if (data.method == 'header') {
                var input = document.getElement('input[name="Authorization"]').set('value', oauth.header);
                input.getPrevious('.add-on').getElement('input[type="checkbox"]').set('checked', true).fireEvent('change');
            } else {
                var input = document.getElement('input[name="Authorization"]').set('value', '');
                input.getPrevious('.add-on').getElement('input[type="checkbox"]').set('checked', false).fireEvent('change');

                var oauth_params = oauth.signed_url.replace(request.uri + '?', '').parseQueryString();

                Object.each(oauth_params, function(value, key) {
                    row = container.getElement('li:last-of-type').clone();
                    row.dataset.oauth = true;
                    row.getElement('input[name="key"]').set('value', key);
                    row.getElement('input[name="value"]').set('value', value);
                    row.getElements('input').set('disabled', false)[0].focus();
                    row.inject(container, 'top');
                });
            }

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        },

        'reset': function(event) {
            // clear oAuth tokens
            chrome.extension.getBackgroundPage().oAuth.clear();

            // load stored defaults
            defaults = JSON.decode(localStorage.getItem('oauth-defaults'));

            Object.each(defaults, function(value, key) {
                var input = document.getElement('input[name="{0}"]'.substitute([key]));

                // set the value
                if (input) {
                    input.set('value', value).fireEvent('change', new DOMEvent);
                }
            });
        },

        'save': function(event) {
            // get all form data
            var defaults = {};

            defaults = this.toQueryString().parseQueryString();

            localStorage.setItem('oauth-defaults', JSON.encode(defaults));
        },

        'authorize': function(event) {
            var oAuth = chrome.extension.getBackgroundPage().oAuth;

            var data = this.toQueryString().parseQueryString();

            var missing = false;

            this.getElements('*[required], *[required-authorize]').each(function(element) {
                if (element.get('value') == '') {
                    Error('Missing Data', 'Please Fill out all the required fields', element);
                    missing = true;
                }
            }.bind(this));

            if (missing) {
                return;
            } else {
                oAuth.initialize({
                    'request_url': data.request_url,
                    'authorize_url': data.authorize_url,
                    'access_url': data.access_url,
                    'consumer_key': data.consumer_key,
                    'consumer_secret': data.consumer_secret,
                    'scope' : data.scope,
                    'app_name' : 'REST Console'
                });
                oAuth.authorize();
            }
        }
    }).fireEvent('reset', new DOMEvent);

    // disable the authorize button when an access token is present
    document.getElements('form.authorization.oauth input[name="token_key"], form.authorization.oauth input[name="token_secret"]').addEvent('change', function(event) {
        var form = this.getParent('form');
        var token_key = form.getElement('input[name="token_key"]').get('value');
        var token_secret = form.getElement('input[name="token_secret"]').get('value');

        if (token_key.length > 0 && token_secret.length > 0) {
            form.getElement('input[data-action="authorize"]').set('disabled', true);
        } else {
            form.getElement('input[data-action="authorize"]').set('disabled', false);
        }
    })

    // request form actions
    document.getElement('form[name="request"]').addEvents({
        'click:relay(input[type="button"], input[type="submit"], input[type="reset"])': function(event) {
            event.preventDefault();

            this.getParent('form').fireEvent(this.dataset.action, event);

            _gaq.push(['_trackEvent', 'Request Form', this.dataset.action]);
        },

        'auth': function(event) {
            var element = document.getElement('input[name="uri"]');

            // special
            if (event.target.dataset.type == 'oauth') {
                document.getElement('.modal.authorization.' + event.target.dataset.type).getElement('input[name="token_secret"]').fireEvent('change');
            }

            if (event.target.dataset.type == 'oauth' && element.get('value') == '') {
                element.focus();
                Error('Missing Data', 'Please provide a target URI before setting oAuth Authorization', element);
                return;
            }

            document.getElement('.modals').removeClass('hide').getElement('.modal.authorization.' + event.target.dataset.type).removeClass('hide');
        },

        'save': function(event) {
            // get all form data
            var defaults = {};

            defaults = this.toQueryString().parseQueryString();

            delete defaults.key;
            delete defaults.value;

            var params = {};
            var headers = {};

            // save custom headers
            var elements = {
                'keys': this.getElements('ul.headers input[name="key"]:not(:last-of-type)'),
                'values': this.getElements('ul.headers input[name="value"]:not(:last-of-type)')
            };

            elements.keys.each(function(key, index) {
                if (key.get('value') != '') {
                    headers[key.get('value')] = elements.values[index].get('value');
                }
            });

            // set custom params
            var elements = {
                'keys': this.getElements('ul.params input[name="key"]:not(:last-of-type)'),
                'values': this.getElements('ul.params input[name="value"]:not(:last-of-type)')
            };

            elements.keys.each(function(key, index) {
                if (key.get('value') != '') {
                    params[key.get('value')] = elements.values[index].get('value');
                }
            });

            localStorage.setItem('request-headers-defaults', JSON.encode(headers));
            localStorage.setItem('request-params-defaults', JSON.encode(params));
            localStorage.setItem('request-defaults', JSON.encode(defaults));
        },

        'reset': function(event) {
            event.preventDefault();

            var defaults = {
                'request': JSON.decode(localStorage.getItem('request-defaults')),
                'params': JSON.decode(localStorage.getItem('request-params-defaults')),
                'headers': JSON.decode(localStorage.getItem('request-headers-defaults'))
            }

            Object.each(defaults.request, function(value, key) {
                var input = document.getElement('input[name="{0}"]'.substitute([key]));

                // set the value
                input.set('value', value);

                // enabled if a disabled field
                if (input.get('disabled')) {
                    var label = input.getPrevious('.add-on');

                    input.set('disabled', false);

                    if (label) {
                        label.getElement('input[type="checkbox"]').set('checked', true);
                    }
                }
            });

            var container = document.getElement('ul.params');

            // cleanup
            container.getElements('li:not(:last-of-type)').destroy();

            Object.each(defaults.params, function(value, key) {
                row = container.getElement('li:last-of-type').clone();
                row.getElement('input[name="key"]').set('value', key);
                row.getElement('input[name="value"]').set('value', value);
                row.getElements('input').set('disabled', false);
                row.inject(container, 'top');
            });

            var container = document.getElement('ul.headers');

            // cleanup
            container.getElements('li:not(:last-of-type)').destroy();

            Object.each(defaults.headers, function(value, key) {
                row = container.getElement('li:last-of-type').clone();
                row.getElement('input[name="key"]').set('value', key);
                row.getElement('input[name="value"]').set('value', value);
                row.getElements('input').set('disabled', false);
                row.inject(container, 'top');
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
            delete headers.file_key;

            var missing = false;

            this.getElements('*[required]').each(function(element) {
                if (element.get('value') == '') {
                    Error('Missing Data', 'Please Fill out all the required fields', element);
                    missing = true;
                }
            });

            if (missing) {
                return false;
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
                    'data': {},
                    'files': this.getElement('input[name="files"]').files,
                    'file_key': data.file_key,
                    'headers': headers,

                    'onRequest': function() {
                        // replace buttons with animation
                        document.getElement('form[name="request"] .actions').addClass('progress');
                    },

                    'onProgress': function(event, xhr){
                        //var loaded = event.loaded, total = event.total;
                    },

                    'onTimeout': function() {
                        // TODO replace with notice
                        Error('Error', 'Connection Timed-out');

                        // remove loading animation
                        document.getElement('form[name="request"] .actions').removeClass('progress');
                    },

                    'onCancel': function() {
                        this.fireEvent('stop');
                    }.bind(this),

                    'onComplete': function() {
                        // for non-success
                        var responseText = this.xhr.responseText;
                        var responseXML = this.xhr.responseXML;

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

                            document.getElement('form[name="request"]').fireEvent('stop');
                        } else {
                            // construct request text
                            var requestText = 'Request URL: {0}\nRequest Method: {1}\n'.substitute([this.options.url, this.options.method]);

                            // uploaded files?
                            if (this.options.files.length > 0) {
                                requestText += 'Files: {0}\n'.substitute([beautify.js(JSON.encode(this.options.files))]);
                            }

                            // data
                            if (this.options.data != '') {
                                switch (typeOf(this.options.data)) {
                                    case 'string':
                                        requestText += 'Params: ' + this.options.data;
                                        break;

                                    case 'object':
                                        requestText += 'Params: ' + beautify.js(JSON.encode(this.options.data));
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

                // don't force the content-type header
                if (options.files.length > 0) {
                    delete options.headers['Content-Type'];
                }

                window.XHR = new RESTRequest(options).send();
            }
        },

        'get': function(event) {
            this.getElement('input[name="method"]').set('value', 'GET');
            this.fireEvent('submit', event);
        },

        'post': function(event) {
            this.getElement('input[name="method"]').set('value', 'POST');
            this.fireEvent('submit', event);
        },

        'put': function(event) {
            this.getElement('input[name="method"]').set('value', 'PUT');
            this.fireEvent('submit', event);
        },

        'delete': function(event) {
            this.getElement('input[name="method"]').set('value', 'DELETE');
            this.fireEvent('submit', event);
        },

        'stop': function(event) {
            if (window.XHR) {
                window.XHR.cancel();
            }

            // remove loading animation
            document.getElement('form[name="request"] .actions').removeClass('progress');
        }
    }).fireEvent('reset', new DOMEvent);
});
