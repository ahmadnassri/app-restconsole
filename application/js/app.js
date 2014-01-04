// Google Analytics
var GA = analytics.getService('restconsole').getTracker('UA-598217-26');

GA.sendAppView('MainView');

// TODO move to localStorage;
var DATA = {};

var Utilities = {
    processAllForms: function () {
        console.log('Utilities.processAllForms');

        // cycle through all the individual forms
        $('#editor form').each(function() {
            var form = $(this);

            // initiate grouping
            var name = form.prop('name');

            if (DATA[name] === undefined) {
                DATA[name] = {};
            }

            // create key-value array
            $.each(form.serializeArray(), function(_, input) {
                DATA[name][input.name] = input.value;
            });
        });

        Utilities.constructHTTPRequestText(DATA);
    },

    updateInputData: function(el) {
        console.log('Utilities.updateInputData');

        DATA[el.parents('form').prop('name')][el.prop('name')] = el.val();

        Utilities.constructHTTPRequestText(DATA);
    },

    constructHTTPRequestText: function (data) {
        console.log('Utilities.constructHTTPRequestText');

        var headers_string = '';

        // construct HAR object
        var HAR = {
            startedDateTime: 0,
            time: 0,
            request: {
                method: data.target.Method,
                url: jQuery.substitute('http://{target.Host}:{target.Port}{target.Path}', data),
                httpVersion: data.target.Protocol,
                headers: [],
                queryString: [],
                cookies: [],
                headersSize: 0,
                bodySize: 0
            }
        };

        // construct headers
        $.each(data.headers, function(name, value) {
            headers_string += name + ': ' + value + '\n';
            HAR.request.headers.push({name: name, value: value});
        });

        // add Authorization header
        if (data.authorization['Authorization']) {
            headers_string += 'Authorization: ' + data.authorization['Authorization'] + '\n';
            HAR.request.headers.push({name: 'Authorization', value: data.authorization['Authorization']});
        }

        // add Proxy-Authorization header
        if (data.authorization['Proxy-Authorization']) {
            headers_string += 'Proxy-Authorization: ' + data.authorization['Proxy-Authorization'] + '\n';
            HAR.request.headers.push({name: 'Proxy-Authorization', value: data.authorization['Proxy-Authorization']});
        }

        console.log(data);

        // write outputs
        //$('#request-curl code').html(harToCurl(HAR));
        $('#request-har code').html(JSON.stringify(HAR.request));
        $('#request-raw code').html(jQuery.substitute('{target.Method} {target.Path} {target.Protocol}\nHost: {target.Host}\n', data) + headers_string);
    },

    translate: function() {
        var el = $(this);
        var message = chrome.i18n.getMessage(el.attr('i18n'));

        switch (el.data('i18nTarget')) {
            case 'value':
                el.val(message);
                break;

            case 'title':
                el.attr('title', message);
                break;

            case 'placeholder':
                el.attr('placeholder', message);
                break;

            default:
                el.html(message);
        }
    }
};

var Handlers = {
    parseHost: function () {
        console.log('Handlers.parseHost');
        // construct URI object
        var uri = new URI($(this).val().trim());

        if (uri.hostname() !== '') {
            // default to port 80 unless its HTTPS
            if (uri.protocol() === 'https') {
                uri.port(443);
            } else if(uri.port() === '') {
                uri.port(80);
            }

            // populate fields
            $('input[name=Port]').val(uri.port());
            $('input[name=Path]').val(uri.resource());
            $('input[name=Host]').val(uri.hostname());

            // handle basic authentication
            if (uri.username() !== '') {
                $('a[data-target="#headers-authorization"]').trigger('click').find('a[data-target="#authorization-basic"]').trigger('click');
                $('#authorization-basic input[name="Username"]').val(uri.username());
                $('#authorization-basic input[name="Password"]').val(uri.password()).trigger('change');
            }

            // TEMP! TODO: convert into query string form
            $('textarea[name="payload"]').val(uri.query());
        }

    },

    /**
     * checkbox listener for enabling/disabling optional input fields
     */
    checkBoxToggle: function () {
        console.log('Handlers.checkBoxToggle');
        // go up, then go down
        var input = $(this).parents('.input-group').find('.form-control');

        // change it
        input.prop('disabled', !$(this).prop('checked')).trigger('change');
    },

    /**
     * listener on input changes to clean up and set default values
     */
    inputChange: function () {
        console.log('Handlers.inputChange');

        var el = $(this);

        // trim (anything other than username / password fields)
        // TODO: ensure query/post values are not trimmed
        if ($.inArray(el.prop('name'), ['Username', 'Password']) === -1) {
            el.val(el.val().trim());
        }

        // if empty set default value
        if (el.val() === '' && el.data('default') !== '') {
            el.val(el.data('default'));
        }

        Utilities.updateInputData(el);
    },

    inputPairs: {
        focus: function() {
            var container = $(this).parents('.form-group');

            container.clone().insertAfter(container).find('input').val('');

            container.find('button').toggleClass('disabled');
        },

        remove: function() {
            $(this).parents('.form-group').remove();

            // re-construct
            Handlers.inputPairs.change();
        },

        change: function() {
            var path = $('input[name=Path]');
            var uri = new URI(path.val());

            // clear the existing string
            uri.query('');

            // create key-value array
            $('form[name="query"] .form-group:not(:last-of-type)').each(function() {
                var group = $(this);
                uri.addQuery(group.find('input[name="key"]').val(), group.find('input[name="value"]').val());
            });

            path.val(uri.resource()).trigger('change');
        },

        toggle: function() {
            $('#query').toggle();

            var path = $('input[name=Path]');
            var uri = new URI(path.val());

            // clear inputs
            $('.input-pairs .form-group:not(:last-of-type)').remove();

            $.each(URI.parseQuery(uri.query()), function(key, value) {
                var container = $('.input-pairs .form-group:last-of-type');
                container.find('input[name="key"]').val(key);
                container.find('input[name="value"]').val(value).trigger('focus');
            });
        }
    }
};

var AuthorizationProcessors = {
    basic: function () {
        console.log('AuthorizationProcessors.basic');

        var input = $('input[name="Authorization"]').first();
        var container = $(this).parents('.form-group');
        var base64 = btoa(container.find('input[name="Username"]').val() + ':' + container.find('input[name="Password"]').val());

        // set the header value
        input.val('Basic ' + base64);

        // enable the field
        if (input.is(':disabled')) {
            input.prev('.input-group-addon').find('input[type="checkbox"]').trigger('click');
        }

        // update
        input.trigger('change');
    }
};

// TODO: best way to execute?
$(window).on('load', function () {
    // translate page
    $('[i18n]').each(Utilities.translate);

    // enable tabs
    $('a[data-toggle="tab"]').tab();

    // enable toggling buttons
    $().button('toggle');

    // attach global listeners
    $('#editor')
        .on('click', '.input-group-addon input[type="checkbox"]', Handlers.checkBoxToggle)
        .on('change', 'input:not([type="checkbox"], [name="Username"], [name="Password"], [name="key"], [name="value"]), select', Handlers.inputChange);

    $('.input-pairs')
        .on('focus', '.form-group:last-of-type input', Handlers.inputPairs.focus)
        .on('change', '.form-group:not(:last-of-type) input', Handlers.inputPairs.change)
        .on('click', '.form-group:not(:last-of-type) button', Handlers.inputPairs.remove);

    // all the buttons
    $('button[data-action="query-builder"]').on('click', Handlers.inputPairs.toggle);

    // attach special listeners
    $('input[name="Host"').on('change', Handlers.parseHost);
    $('#authorization-basic').on('change', 'input', AuthorizationProcessors.basic);

    // generate the first output on load
    Utilities.processAllForms();
});

jQuery.substitute = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split('.'), v = data[keys.shift()];

        for (var i = 0, l = keys.length; i < l; i++) {
            v = v[keys[i]];
        }

        return (typeof v !== 'undefined' && v !== null) ? v : '';
    });
};


/*
        // loads panels
        // TODO: its ugly, replace with modals + iframes
        'click:relay(a[data-type="panel"])': function(event) {
            event.preventDefault();

            var width = 800;
            var height = 600;
            var top = ((window.getSize().y - height) / 2).round();
            var left = ((window.getSize().x - width) / 2).round();

            chrome.windows.create({
                'url': this.get('href'),
                'left': left,
                'top': top,
                'width': width,
                'height': height,
                'focused': true,
                'type': 'panel'
            });

        'rfc-link': new Template(function(data) {
            if (data) {
                section = data.split('.')[0];

                a({
                    'tabindex': -1,
                    'data-type': 'panel',
                    'href': 'http://www.w3.org/Protocols/rfc2616/rfc2616-sec{0}.html#sec{1}'.substitute([section, data])
                })
            }
        }),

                    div({'class': 'well'},
                        ul({'class': 'nav list'},
                            li({'class': 'nav-header'}, 'Donate'),
                            li(a({'tabindex': -1, 'href': 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'Paypal')),
                            li(a({'tabindex': -1, 'href': 'https://flattr.com/thing/156628/REST-Console', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'Flattr')),
                            li(a({'tabindex': -1, 'href': 'http://utip.it/codeinchaos', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'TipIt'))
                        )
                a({
                    'events': {
                        'click': function(event) {
                            event.preventDefault();
                            chrome.webstore.install('https://chrome.google.com/webstore/detail/faceofpmfclkengnkgkgjkcibdbhemoc');
                        }
                    }
                }, 'Install Extension'),
                *

        'social': new Template(function(data) {
            li(a({'tabindex': -1, 'href': 'https://twitter.com/share', 'class': 'twitter-share-button', 'data-url': 'https://chrome.google.com/webstore/detail/cokgbflfommojglbmbpenpphppikmonn', 'data-text': 'Checkout @RESTConsole App for Google #Chrome for #REST #API development', 'data-via': 'CodeInChaos', 'data-related': 'CodeInChaos,AhmadNassri', 'data-hashtags': 'HTTP,RESTful'}, 'Tweet')),
            li(iframe({'allowtransparency': true, 'frameborder': 0, 'scrolling': 'no', 'src': 'http://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fcokgbflfommojglbmbpenpphppikmonn&send=false&layout=button_count&width=450&show_faces=false&action=like&amp&height=21&appId=199139246805784'})),
            li(iframe({'allowtransparency': true, 'frameborder': 0, 'scrolling': 'no', 'src': 'https://plusone.google.com/_/+1/fastbutton?url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fcokgbflfommojglbmbpenpphppikmonn&size=medium&count=true&annotation=&hl=en-US&jsh=m%3B%2F_%2Fapps-static%2F_%2Fjs%2Fwidget%2F__features__%2Frt%3Dj%2Fver%3DXsa0GTewdqg.en.%2Fsv%3D1%2Fam%3D!KW4lzGmbF_KIhSW8Og%2Fd%3D1%2F#id=I1_1327261815981&parent=chrome-extension%3A%2F%2Fbjdlekdiiieofkpjfhpcmlhalmbnpjnh&rpctoken=858197945&_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe'})),
            li(script({'type': 'IN/Share', 'data-url': 'https://chrome.google.com/webstore/detail/cokgbflfommojglbmbpenpphppikmonn', 'data-counter': 'right'})),
            li(iframe({'allowtransparency': true, 'frameborder': 0, 'scrolling': 'no', 'src': 'http://markdotto.github.com/github-buttons/github-btn.html?user=codeinchaos&repo=restconsole&type=watch&count=true'}))
            li(a({'tabindex': -1, 'href': 'https://twitter.com/CodeInChaos', 'class': 'twitter-follow-button', 'data-width': '155px', 'data-link-color': '#0069D6', 'data-show-count': false}, 'Follow @CodeInChaos')),

            li(iframe({'src': 'http://markdotto.github.com/github-buttons/github-btn.html?user=codeinchaos&repo=restconsole&type=fork&count=true', 'allowtransparency': true, 'frameborder': 0, 'scrolling': 0, 'width': '60px', 'height': '20px'})),
            li(iframe({'src': 'http://markdotto.github.com/github-buttons/github-btn.html?user=codeinchaos&type=follow&count=true', 'allowtransparency': true, 'frameborder': 0, 'scrolling': 0, 'width': '150px', 'height': '20px'}))
        }),

    'signOAuth': function() {
        var oauth = document.getElement('.tab-pane.oauth').toObject();
        var data = new Storage('defaults').data;

        // start oauth
        var accessor = {
            'consumerKey': oauth.consumer_key,
            'consumerSecret': oauth.consumer_secret
        };

        var message = {
            'action': data.url,
            'method': data.method,
            'parameters': [
                ['oauth_version', oauth.version],
                ['oauth_signature_method', oauth.signature]
            ]
        };

        // optional params
        if (oauth.token_key) {
            accessor.token = oauth.token_key;
        }

        if (oauth.token_secret) {
            accessor.tokenSecret = oauth.token_secret;
        }

        if (oauth.scope) {
            message.parameters.push(['scope', oauth.scope]);
        }

        if (oauth.oauth_verifier) {
            message.parameters.push(['oauth_verifier', oauth.oauth_verifier]);
        }

        // queryString
        data.queryString.each(function(param) {
            message.parameters.push([param.name, param.value]);
        });

        // payload body
        var contentType = document.getElement('input[name="Content-Type"]')
        if (!contentType.get('disabled') && contentType.get('value') == 'application/x-www-form-urlencoded' && data.postData.text.length) {
            Object.each(data.postData.text.parseQueryString(), function(value, key) {
                message.parameters.push([key, value]);
            });
        };

        // sign
        OAuth.completeRequest(message, accessor);

        // debug
        new Console().log('OAuth Base String: ', OAuth.SignatureMethod.getBaseString(message));

        return {
            'header': OAuth.getAuthorizationHeader(data.realm, message.parameters),
            'query': OAuth.formEncode(OAuth.getParameterList(message.parameters))
        }

    },

        debug.groupStart('REST Console: Initializing');

    'checkOnlineStatus': function(app) {
        var debug = new Console();

        debug.groupStart('REST Console: Checking online Status');

        if (window.navigator.onLine) {
            debug.group('online :)');
            document.body.adopt(app.renderTemplate('scripts'));
            document.getElement('.social').adopt(app.renderTemplate('social'));

            // don't want to tab to iframes
            app.clearTabIndex.delay(3000);
        } else {
            debug.group('offline :(');
            app.checkOnlineStatus.delay(5000, app, app);
        }

        debug.groupEnd();
    },
    'processResponse': function() {
        $RESTConsole.setProgress(75);

        var xhr = Object.clone(this.xhr);

        var mimeType = this.xhr.getResponseHeader('Content-Type');

        if (mimeType) {
            mimeType = mimeType.split(';')[0];
        }

        if (['image/gif', 'image/png', 'image/jpeg'].contains(mimeType)) {
            var binary = true;

            var byteArray = new Uint8Array(xhr.responseText.length);

            for (var i = 0; i < xhr.responseText.length; i++) {
                byteArray[i] = xhr.responseText.charCodeAt(i) & 0xff;
            }
        }

        // get history
        var history = new History();
        var request = history.getLast();

        // construct HAR objects
        var response = new HAR.Response();
        response.fromXHR(this.xhr);

        if (binary) {
            response.setContentText(uint8ToString(byteArray));
            response.encode('base64');
        }

        var har = new HAR.Log();
        var harResponse = response.toObject();

        har.addEntry(new HAR.Entry({
            'request': request,
            'response': harResponse
        }).toObject());

        request.url = request.url.parseUrl();

        request.queryString = request.queryString.toQueryString();

        // beautify
        var prettify = {
            'request': false,
            'response': false
        };

        // process request
        switch (request.postData.mimeType) {
            case 'text/css':
                prettify.request = 'css';

                request.postData.text = css_beautify(request.postData.text, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'application/json':
            case 'application/ecmascript':
            case 'application/javascript':
                prettify.request = 'js';

                request.postData.text = js_beautify(request.postData.text, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'text/xml':
            case 'image/svg+xml':
            case 'application/xml':
            case 'application/rdf+xml':
            case 'application/rss+xml':
            case 'application/beep+xml':
            case 'application/atom+xml':
            case 'application/xspf+xml':
            case 'application/atomcat+xml':
            case 'application/atomserv+xml':
            case 'application/davmount+xml':
            case 'application/docbook+xml':
            case 'application/vnd.google-earth.kml+xml':
            case 'application/vnd.mozilla.xul+xml':
                prettify.request = 'xml';

                request.postData.text = style_html(request.postData.text, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'text/html':
            case 'application/xhtml+xml':
                request.request = 'html';

                request.postData.text = style_html(request.postData.text, {
                    'indent_size': 1,
                    'indent_char': '\t',
                    'max_char': 1000,
                    //'unformatted': ['!--[if lt IE 7]', '!--[if IE 7]', '!--[if IE 8]', '!--[if gt IE 8]', '![endif]--', '!--']
                });
                break;
        }

        // process response
        switch (mimeType) {
            case 'text/css':
                prettify.response = 'css';

                xhr.responseText = css_beautify(xhr.responseText, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'application/json':
            case 'application/ecmascript':
            case 'application/javascript':
                prettify.response = 'js';

                xhr.responseText = js_beautify(xhr.responseText, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'text/xml':
            case 'image/svg+xml':
            case 'application/xml':
            case 'application/rdf+xml':
            case 'application/rss+xml':
            case 'application/beep+xml':
            case 'application/atom+xml':
            case 'application/xspf+xml':
            case 'application/atomcat+xml':
            case 'application/atomserv+xml':
            case 'application/davmount+xml':
            case 'application/docbook+xml':
            case 'application/vnd.google-earth.kml+xml':
            case 'application/vnd.mozilla.xul+xml':
                prettify.response = 'xml';

                xhr.responseText = style_html(xhr.responseText, {
                    'indent_size': 1,
                    'indent_char': '\t'
                });
                break;

            case 'text/html':
            case 'application/xhtml+xml':
                prettify.response = 'html';

                xhr.responseText = style_html(xhr.responseText, {
                    'indent_size': 1,
                    'indent_char': '\t',
                    'max_char': 1000,
                    //'unformatted': ['!--[if lt IE 7]', '!--[if IE 7]', '!--[if IE 8]', '!--[if gt IE 8]', '![endif]--', '!--']
                });

                // create and inject the iframe object
                var iframe = new IFrame();
                document.id('preview').adopt(iframe);

                // start writing
                var doc = iframe.contentWindow.document;
                doc.open();
                doc.write(this.xhr.responseText);
                doc.close();
                break;

            case 'image/gif':
            case 'image/png':
            case 'image/jpeg':
                var bb = new BlobBuilder();
                bb.append(byteArray.buffer);
                blob = bb.getBlob(mimeType);
                var img = document.createElement('img').set('src', window.URL.createObjectURL(blob));
                document.id('preview').adopt(img);
                break;
        }

        // beautify HAR response
        var harText = js_beautify(JSON.stringify(har.toObject()), {
            'indent_size': 1,
            'indent_char': '\t'
        });

        document.getElement('pre.har code').set('text', harText);
        document.getElement('pre.request code').adopt($RESTConsole.renderTemplate('httpRequest', request)).appendText(request.postData.text);
        document.getElement('pre.response code').adopt($RESTConsole.renderTemplate('httpResponse', response.toObject())).appendText(xhr.responseText);

        // generate download links
        ['request', 'requestBody', 'response', 'responseBody', 'preview', 'har'].each(function(download) {
            var link = document.getElement('a[download="' + download + '"]').removeClass('disabled');
            window.URL.revokeObjectURL(link);

            var blob = null;
            var bb = new BlobBuilder();

            switch (download) {
                case 'request':
                    bb.append(document.getElement('pre.request code').get('text'));
                    blob = bb.getBlob('message/http');
                    break;

                case 'requestBody':
                    bb.append(request.postData.text);
                    blob = bb.getBlob(request.postData.mimeType);
                    break;

                case 'response':
                    if (binary) {
                        var body = document.getElements('pre.response code .nocode').get('text').join('\r\n') + '\n\n' + harResponse.content.text;
                    } else {
                        var body = document.getElement('pre.response code').get('text');
                    }

                    bb.append(body);
                    blob = bb.getBlob('message/http');
                    break;

                case 'preview':
                case 'responseBody':
                    if (binary) {
                        var body = byteArray.buffer;
                    } else {
                        var body = harResponse.content.text;
                    }

                    bb.append(body);
                    blob = bb.getBlob(mimeType);
                    break;

                case 'har':
                    bb.append(harText);
                    blob = bb.getBlob('application/json');
                    break;
            }

            link.set('href', window.URL.createObjectURL(blob));
        }.bind(this));

        $RESTConsole.setProgress(100);

        // google prettify
        if (prettify.request) {
            document.getElement('pre.request code').set('class', 'language-' + prettify.request);
        }

        if (prettify.response) {
            document.getElement('pre.response code').set('class', 'language-' + prettify.response);
        }

        document.getElements('pre.request code, pre.response code, pre.har code').each(function(code) {
            var lang = code.get('class');

            if (lang) {
                prettyPrintOne(code, lang, true);
            } else {
                prettyPrintOne(code, false, true);
            }
        });

        document.getElement('footer').removeClass('active');

        if (xhr.status == 0) {
            new Alert('warning', 'Connection Failed!', 'Check your connectivity and try again');
        }
    }
});
*/
