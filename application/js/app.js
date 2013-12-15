// Google Analytics
var _gaq = _gaq || [];
//_gaq.push(['_setAccount', 'UA-598217-26']);
_gaq.push(['_trackPageview']);

// TODO move to localStorage;
var DATA = {};

var Utilities = {
    processAllForms: function () {
        console.log('Utilities.processAllForms');

        // cycle through all the individual forms
        $.each($('#request form'), function(_, form) {
            // initiate grouping
            var name = $(form).prop('name');

            if (DATA[name] === undefined) {
                DATA[name] = {};
            }

            // create key-value array
            $.each($(form).serializeArray(), function(_, input) {
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
        $('#request-curl code').html(harToCurl(HAR));
        $('#request-har code').html(JSON.stringify(HAR.request));
        $('#request-raw code').html(jQuery.substitute('{target.Method} {target.Path} {target.Protocol}\nHost: {target.Host}\n', data) + headers_string);
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
            $('input[name=Path]').val(uri.path());
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

// sTODO: best way to execute?
$(window).on('load', function () {
    // enable tabs
    $('a[data-toggle="tab"]').tab();

    // enable toggling buttons
    $().button('toggle');

    // attach global listeners
    $('#request')
        .on('click', '.input-group-addon input[type="checkbox"]', Handlers.checkBoxToggle)
        .on('change', 'input:not([type="checkbox"], [name="Username"], [name="Password"]), select', Handlers.inputChange);

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
window.URL = window.webkitURL || window.URL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

var App = new Class({
    'Implements': [Events, Templates],

    // presets
    'presets': [{
        'name': 'Twitter',
        'resources': [
            {
                'name': 'Public Timeline',
                'request': {
                    'method': 'GET',
                    'url': 'http://api.twitter.com/1/statuses/public_timeline.json',
                    'headers': [],
                    'queryString': [],
                    'postData': {
                        'mimeType': null,
                        'params': [{
                            'name': 'paramName',
                            'value': 'paramValue',
                        }],
                        'text' : null
                    }
                }
            }
        ]
    }],

    'events': {
        'change:relay(*[data-storage])': function(event) {
            $RESTConsole.saveValues();
        },

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
        }
    },

    'templates': {
        'datalist': new Template(function(data) {
            datalist({'id': data.id}, this.renderTemplate('option', data.values))
        }),

        'presets': new Template(function(data) {
            li(i({'class': 'icon' + data.name.toLowerCase()}),
                details(summary(data.name), this.renderTemplate('resource', data.resources))
            )
        }),

        'resource': new Template(function(data) {
            a(data.name);
        }),

        'option': new Template(function(data) {
            data = Array.from(data);
            option({'value': data[0]}, [data[1], data[0]].pick())
        }),

        'section-header': new Template(function(data) {
            header(
                a({
                    'events': {
                        'click': function(event) {
                            var section = this.getParent('section');

                            // change class
                            section.toggleClass('collapsed')

                            // store status
                            new Storage('sections').set(section.get('id'), !section.hasClass('collapsed'));

                            // fire resize event to trigger hidden elements resize
                            window.fireEvent('resize');
                        }
                    }
                }),
                h2(data)
            )
        }),

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

        'pairs': new Template(function(data) {
            fieldset({'class': 'control-group span6 pairs ' + data.name},
                label({'class': 'control-label', 'for': data.name}, data.label),

                div({
                    'class': 'controls',
                    'events': {
                        'focus:relay(.pair:last-child input[type="text"])': function(event) {
                            this.getParent('.controls').fireEvent('click', new FakeEvent(this.getNext('.add')));
                        },

                        'click:relay(.pair:last-child input[type="file"])': function(event) {
                            event.preventDefault();
                            this.getParent('.controls').fireEvent('click', new FakeEvent(this.getNext('.add')));
                        },

                        // clear error highlight on pairs
                        'keyup:relay(.error input[type="text"]:first-child)': function(event) {
                            this.getParent('.pair').removeClass('error');
                        },

                        // check for empty keys on pairs
                        'blur:relay(.pair:not(:last-child) input[type="text"]:first-child)': function(event) {
                            var value = this.get('value').trim();

                            if (value == '') {
                                this.getParent('.pair').addClass('error');
                            } else {
                                this.set('value', value);
                            }
                        },

                        'addRow': function(header) {
                            var pair = this.getElement('.pair:last-child');
                            var clone = pair.clone().cloneEvents(pair);

                            if (header) {
                                clone.getElement('input[name="key"]').set('value', header.name);
                                clone.getElement('input[name="value"]').set('value', header.value);
                            }

                            clone.inject(pair, 'before');
                            clone.getElement('input').focus();
                        },

                        'click:relay(.add)': function(event) {
                            var pair = this.getParent('.pair');
                            var previous = pair.getPrevious('.pair');

                            if (previous && previous.getElement('input').get('value') == '') {
                                previous.addClass('error').getElement('input').focus();
                            } else {
                                this.getParent('.controls').fireEvent('addRow');
                            }
                        },

                        'click:relay(.remove)': function(event) {
                            var pair = this.getParent('.pair');
                            var next = pair.getNext();

                            // don't focus on the next pair if its the last
                            // otherwise you get stuck in a loop
                            if (next != pair.getParent().getLast()) {
                                next.getElement('input').focus();
                            } else if (pair.getPrevious('.controls')) {
                                pair.getPrevious('.pair').getElement('input').focus();
                            }

                            pair.destroy();

                            document.fireEvent('change', new FakeEvent(next.getElement('input')));
                        }
                    }},

                    div({'class': 'input-append pair'},
                        input({'class': 'span3', 'type': 'text', 'name': 'key', 'data-storage': data['data-storage'], 'tabindex': data.tabindex, 'autocomplete': true, 'value': null, 'placeholder': 'ex: key', 'x-webkit-speech': true}),
                        data.name == 'files' ? input({'class': 'span3', 'type': 'file', 'name': 'file', 'multiple': false, 'tabindex': data.tabindex, 'autocomplete': false, 'value': null}) : input({'class': 'span3', 'type': 'text', 'name': 'value', 'data-storage': data['data-storage'], 'tabindex': data.tabindex, 'autocomplete': true, 'value': null, 'placeholder': 'ex: value', 'x-webkit-speech': true}),

                        span({'class': 'add-on btn add success'}),
                        span({'class': 'add-on btn remove danger'})
                    )
                )
            )
        }),

        'input': new Template(function(attributes) {
            // speech
            attributes['x-webkit-speech'] = true;

            // init events object
            if (!attributes.events) attributes.events = {};

            // default change event
            if (!attributes.events.change) {
                attributes.events.change = function(event) {
                    this.fireEvent('highlight');
                }
            }

            // highlight event
            attributes.events.highlight = function(event) {
                var value = this.get('value');
                var disabled = this.get('disabled');
                var group = this.getParent('.control-group');

                // reset classes
                group.removeClass('success').removeClass('error').removeClass('warning');

                // empty check
                if (!disabled) {
                    if (value == '') {
                        if (this.get('required')) {
                            group.addClass('error');
                        } else {
                            group.addClass('warning');
                        }
                    } else {
                        group.addClass('success');
                    }
                }
            }

            input(attributes)
        }),

        'standard-input': new Template(function(data) {
            fieldset({'class': 'control-group'},
                label({'class': 'control-label', 'for': data.attributes.name}, this.renderTemplate('rfc-link', data.rfc ? data.rfc : false), data.label),
                div({'class': 'controls'},
                    this.renderTemplate('input', data.attributes),
                    p({'class': 'help-text'}, data.help)
                )
            )
        }),

        'optional-input': new Template(function(data) {
            fieldset({'class': 'control-group'},
                label({'class': 'control-label', 'for': data.attributes.name}, this.renderTemplate('rfc-link', data.rfc ? data.rfc : false), data.label),
                div({'class': 'controls'},
                    div({'class': 'input-prepend'},
                        label({'class': 'add-on'},
                            input({
                                'tabindex': -1,
                                'type': 'checkbox',
                                'events': {
                                    'change': function(event) {
                                        var input = this.getParent('.input-prepend').getElement('input[type="text"], input[type="password"], input[type="number"]');
                                        var checked = this.get('checked');

                                        if (checked) {
                                            input.set('disabled', false).fireEvent('highlight').fireEvent('focus').focus();
                                        } else {
                                            input.set('disabled', true).fireEvent('highlight');
                                            this.getParent('.control-group').removeClass('success').removeClass('error').removeClass('warning');
                                        }
                                    },

                                    'click': function(event) {
                                        var input = this.getParent('.input-prepend').getElement('input[type="text"], input[type="password"], input[type="number"]');

                                        input.fireEvent('change');
                                        document.fireEvent('change', new FakeEvent(input));
                                    }
                                }
                            })
                        ),

                        this.renderTemplate('input', data.attributes),

                        p({'class': 'help-text'}, data.help)
                    )
                )
            )
        }),

        'header': new Template(function(data) {
            header({'class': 'navbar navbar-fixed'},
                div({'class': 'navbar-inner'},
                    div({'class': 'fluid-container'},
                        div({'class': 'brand'},
                            img({'src': '/images/logo/32.png', 'align': 'left'}), span('REST Console'), small('version 4.1.0 BETA')
                        ),

                        div({'class': 'fluid-content'},

                            ul({
                                'class': 'nav',
                                'events': {
                                    'click:relay(a)': function(event) {
                                        event.preventDefault();

                                        var container = document.getElement('[data-screen]');

                                        container.dataset.screen = this.dataset.target;

                                        new Fx.Scroll(container).toTop();

                                        container.fireEvent('scroll');

                                        this.getParent('ul').getElement('.active').removeClass('active');
                                        this.getParent('li').addClass('active');
                                    }
                                }},

                                li({'class': 'active'}, a({'accesskey': 'm', 'data-target': 'main'}, i({'class': 'icon white home'}), span('M'), 'ain'))
                                li(a({'accesskey': 's', 'data-target': 'settings'}, i({'class': 'icon settings'}), span('S'), 'ettings')),
                                li(a({'data-target': 'help'}, i({'class': 'icon question'}), 'Help')),
                                li(a({'data-target': 'about'}, i({'class': 'icon info'}), 'About'))
                            ),

                            ul({'class': 'social pull-right'})
                        )
                    )
                )
            )
        }),

        'container': new Template(function(data) {
            div({
                'class': 'main fluid-container sidebar-left',
                'data-screen': 'main',
                'events': {
                    'scroll': function(event) {
                        document.getElements('a[data-spy="scroll"]').each(function(link) {
                            var target = link.get('href');
                            var targetPosition = document.getElement(target).getCoordinates(this).top;

                            if (targetPosition - 20 <= 0) {
                                link.getParent('ul').getElement('.active').removeClass('active');
                                link.getParent('li').addClass('active');
                            }
                        }.bind(this));
                    }
                }},

                div({'class': 'fluid-sidebar'},
                    div({'class': 'well'},
                        ul({'class': 'nav list navigation', 'data-screen': 'main'},
                            li({'class': 'nav-header'}, 'Navigation'),
                            li({'class': 'active'}, a({'accesskey': 't', 'tabindex': -1, 'href': '#target', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}), span('T'), 'arget')),
                            li(a({'accesskey': 'p', 'tabindex': -1, 'href': '#payload', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}), span('P'), 'ayload')),
                            li(a({'accesskey': 'a', 'tabindex': -1, 'href': '#authorization', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}), span('A'), 'uthorization')),
                            li(a({'accesskey': 'h', 'tabindex': -1, 'href': '#headers', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}),  span('H'), 'eaders')),
                            li(a({'accesskey': 'r', 'tabindex': -1, 'href': '#response', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}),  span('R'), 'esponse'))
                        ),

                        ul({'class': 'nav list navigation', 'data-screen': 'settings'},
                            li({'class': 'active'}, a({'tabindex': -1, 'href': '#general', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}), 'General')),
                            li(a({'tabindex': -1, 'href': '#display', 'data-scroll': 'smooth', 'data-spy': 'scroll'}, i({'class': 'icon chevron-right'}), 'Display'))
                        )
                    ),

                    div({'class': 'tabbable', 'data-screen': 'main'},
                        ul({'class': 'nav tabs'},
                            li({'class': 'active'}, a({'data-toggle': 'tab'}, i({'class': 'icon history'}), 'History'))
                            // li(a({'data-toggle': 'tab'}, i({'class': 'icon star'}), 'Presets')),
                        ),

                        div({'class': 'tab-content'},
                            div({'class': 'tab-pane active'},
                                ul({
                                    'class': 'nav list history',
                                    'events': {
                                        'change': function(event) {
                                            if (this.getChildren().length > 0) {
                                                this.getNext('button').set('disabled', false);
                                            } else {
                                                this.getNext('button').set('disabled', true);
                                            }
                                        }
                                    }
                                }),

                                button({
                                    'class': 'btn danger',
                                    'disabled': 'true',
                                    'events': {
                                        'click': function(event) {
                                            document.getElement('.nav.list.history').empty().fireEvent('change');
                                            localStorage.removeItem('history');
                                        }
                                    }},

                                    i({'class': 'icon white trash'}), 'Clear History'
                                )
                            )

                            div({'class': 'tab-pane active'},
                                ul({'class': 'nav list presets'},
                                    li({'class': 'nav-header'}, 'User'),
                                    li(a({
                                        'events': {
                                            'click': function(event) {
                                                event.stop();

                                                alert('Coming Soon!');
                                            }
                                        }
                                    }, i({'class': 'icon plus'}), 'Import WADL')),

                                    li(a({
                                        'events': {
                                            'click': function(event) {
                                                event.stop();

                                                alert('Coming Soon!');
                                            }
                                        }
                                    }, i({'class': 'icon plus'}), 'Import HAR')),

                                    li({'class': 'nav-header'}, 'Defaults'),

                                    this.renderTemplate('presets', this.presets)
                                )
                            ),
                        )
                    ),

                    div({'class': 'well'},
                        ul({'class': 'nav list'},
                            li({'class': 'nav-header'}, 'Donate'),
                            li(a({'tabindex': -1, 'href': 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UJ2B2BTK9VLRS', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'Paypal')),
                            li(a({'tabindex': -1, 'href': 'https://flattr.com/thing/156628/REST-Console', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'Flattr')),
                            li(a({'tabindex': -1, 'href': 'http://utip.it/codeinchaos', 'target': '_blank'}, i({'class': 'icon star-empty'}), 'TipIt'))
                        )
                    )
                ),

                div({'class': 'fluid-content'},
                    div({'data-screen': 'main'},
                        form({
                            'name': 'main',
                            'novalidate': true,
                            'events': {
                                'keydown:relay(input)': function(event) {
                                    if (event.key == 'enter') {
                                        // save first
                                        document.fireEvent('change', new FakeEvent(this));

                                        event.stop();
                                        $RESTConsole.send();
                                    }
                                }
                            }},
                            this.renderSection('target'),
                            this.renderSection('payload'),
                            this.renderSection('authorization'),
                            this.renderSection('headers')
                        ),

                        this.renderSection('response')
                    ),

                    div({'data-screen': 'settings'},
                        this.renderTemplate('settings')
                    ),

                    div({'data-screen': 'help'},
                        this.renderTemplate('help')
                    ),

                    div({'data-screen': 'about'},
                        this.renderTemplate('about')
                    )
                )
            )
        }),

        'settings': new Template(function(data) {
            section({'id': 'display'}
            ),

            section({'id': 'general'},
                this.renderTemplate('section-header', 'General'),

                a({
                    'events': {
                        'click': function(event) {
                            event.preventDefault();
                            chrome.webstore.install('https://chrome.google.com/webstore/detail/faceofpmfclkengnkgkgjkcibdbhemoc');
                        }
                    }
                }, 'Install Extension'),

                form({
                    'name': 'options',
                    'class': 'form-stacked',
                    'novalidate': true,
                    'events': {
                        'init': function() {
                            var options = new Storage('options');

                            this.getElements('input[type="checkbox"]').each(function(checkbox) {
                                var data = options.get(checkbox.get('name'));

                                if (data != null) {
                                    if (data == true) {
                                        checkbox.set('checked', true);
                                    } else {
                                        checkbox.set('checked', false);
                                    }
                                }

                                checkbox.fireEvent('change');
                            });
                        }
                    }},

                    div({'class': 'row'},
                        div({'class': 'span6'},
                            fieldset({'class': 'control-group'},
                                label({'class': 'control-label'}, 'General'),
                                div({'class': 'controls'},
                                    label({'class': 'checkbox'},
                                        input({
                                            'type': 'checkbox',
                                            'name': 'help',
                                            'events': {
                                                'change': function(event) {
                                                    console.log('here');
                                                    if (this.get('checked')) {
                                                        document.body.addClass('no-help');
                                                    } else {
                                                        document.body.removeClass('no-help');
                                                    }
                                                }
                                            }
                                        }),

                                        'Hide Help Lines'
                                    ),

                                    p({'class': 'help-text'}, '* will affect next request.')
                                )
                            )
                        ),

                        div({'class': 'span'},
                            fieldset({'class': 'control-group'},
                                label({'class': 'control-label'}, 'Color Theme'),
                                div({
                                    'class': 'controls',
                                    'events': {
                                        'change:relay(input)': function(event) {
                                            if (this.get('checked')) {
                                                document.id('theme').set('href', 'css/prettify/{0}.css'.substitute([this.get('value')]));
                                            }
                                        }
                                    }},

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'default'}), 'Default'
                                    ),

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'bootstrap', 'checked': true}), 'Bootstrap'
                                    ),

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'bootstrap-dark'}), 'Bootstrap Dark'
                                    ),

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'desert'}), 'Desert'
                                    ),

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'sunburst'}), 'Sunburst'
                                    ),

                                    label({'class': 'radio'},
                                        input({'type': 'radio', 'name': 'theme', 'value': 'sons-of-obsidian'}), 'Sons of Obsidian'
                                    ),

                                    p({'class': 'help-text'}, 'Syntax highlighting default color theme')
                                )
                            )
                        )
                    )
                ).fireEvent('init')
            )
        }),

        'help': new Template(function(data) {
            section({'id': 'help'},
                this.renderTemplate('section-header', 'Help')
            )
        }),

        'about': new Template(function(data) {
            section({'id': 'about'},
                this.renderTemplate('section-header', 'About')
            )
        }),

        'footer': new Template(function(data) {
            footer({'class': 'navbar navbar-fixed'},
                div({'class': 'navbar-inner'},
                    div({'class': 'fluid-container sidebar-left'},
                        div({
                            'class': 'fluid-content controls',
                            'events': {
                                'click:relay(button)': function(event) {
                                    this.send();
                                }.bind(this)
                            }},

                            div({'class': 'row'},
                                div({'class': 'span10'},
                                    div({'class': 'progress info striped active'},
                                        div({'class': 'bar', 'style': 'width: 0%'})
                                    ),

                                    button({'tabindex': -1, 'data-action': 'submit', 'class': 'btn primary'}, 'Send'),
                                    button({'tabindex': -1, 'data-action': 'get', 'class': 'btn'}, 'GET'),
                                    button({'tabindex': -1, 'data-action': 'post', 'class': 'btn'}, 'POST'),
                                    button({'tabindex': -1, 'data-action': 'put', 'class': 'btn'}, 'PUT'),
                                    button({'tabindex': -1, 'data-action': 'delete', 'class': 'btn'}, 'DELETE')
                                ),

                                div({'class': 'pull-right'},
                                    button({'tabindex': -1, 'data-action': 'stop', 'class': 'btn danger'}, 'Stop'),
                                    button({'tabindex': -1, 'data-action': 'save', 'class': 'btn success'}, 'Save Request')
                                )
                            )
                        )
                    )
                )
            )
        }),

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

        'scripts': new Template(function(data) {
            script({'type': 'text/javascript', 'src': 'http://platform.twitter.com/widgets.js', 'async': true}),
            script({'type': 'text/javascript', 'src': 'http://platform.linkedin.com/in.js', 'async': true}),
            script({'type': 'text/javascript', 'src': 'https://ssl.google-analytics.com/ga.js', 'async': true})
        }),

        'historyItem': new Template(function(data) {
            var url = data.url.parseUrl();

            li({
                'events': {
                    'mouseover': function(event) {
                        this.getElement('.popover').position({
                            relativeTo: this,
                            position: 'centerRight',
                            edge: 'centerLeft'
                        });
                    }
                }},

                a(strong(data.method), ' ', url.path),

                div({'class': 'popover right'},
                    div({'class': 'arrow'}),
                    div({'class': 'inner'},
                        h3({'class': 'title'},
                            div({'class': 'pull-right'},
                                button({
                                    'class': 'btn',
                                    'events': {
                                        'click': function(event) {
                                            var item = this.getParent('li');
                                            var index = this.getParent('ul').getElements('li').indexOf(item);

                                            var data = new History().get(index);

                                            $RESTConsole.resetValues(data);
                                            $RESTConsole.saveValues();
                                        }
                                    }}, i({'class': 'icon repeat'}), 'Repeat'
                                ),

                                button({
                                    'class': 'btn danger',
                                    'events': {
                                        'click': function(event) {
                                            var item = this.getParent('li');
                                            var index = this.getParent('ul').getElements('li').indexOf(item);

                                            new History().remove(index);

                                            item.destroy();
                                        }
                                    }}, i({'class': 'icon white trash'}), 'Delete'
                                )
                            ),

                            div({'class': 'host'}, url.host)
                        ),

                        div({'class': 'content'},
                            table({'class': 'table table-striped table-bordered'},
                                tbody(
                                    tr(th('Method'), td({'class': 'selectable'}, data.method)),
                                    tr(th('Path'), td({'class': 'selectable'}, url.path)),
                                    tr(th('QueryString'), td({'class': 'selectable'}, data.queryString.toQueryString())),
                                    tr(th('Headers'), td({'class': 'selectable'}, this.renderTemplate('historyHeaders', data.headers))),
                                    tr(th('Payload'), td({'class': 'selectable'}, data.postData.text))
                                )
                            )
                        )
                    )
                )
            )
        }),

        'historyHeaders': new Template(function(header) {
            div(header.name, ': ', header.value)
        }),

        'httpRequest': new Template(function(data) {
            span({'class': 'nocode'}, span({'class': 'kwd'}, data.method, ' ', data.url.path, (data.queryString != '') ? '?' + data.queryString : '', ' ', 'HTTP/1.1 ')),
            span('\n'),
            span({'class': 'nocode'}, span({'class': 'typ'}, 'HOST'), span({'class': 'pun'}, ': '), span({'class': 'pln'}, data.url.host)),
            span('\n'),
            span(this.renderTemplate('httpHeaders', data.headers)),
            span('\n')
        }),

        'httpResponse': new Template(function(data) {
            span({'class': 'nocode'}, span({'class': 'kwd'}, 'HTTP/1.1 ', data.status, ' ', data.statusText)),
            span('\n'),
            span(this.renderTemplate('httpHeaders', data.headers)),
            span('\n')
        }),

        'httpHeaders': new Template(function(header) {
            span({'class': 'nocode'},
                span({'class': 'typ'}, header.name),
                span({'class': 'pun'}, ': '),
                span({'class': 'pln', 'text': header.value})
            ),
            span('\n')
        })
    },

    'sections': {
        'target': new Template(function(data) {
            section({'id': 'target'},
                this.renderTemplate('section-header', 'Target'),

                div({'class': 'row'},
                    div({'class': 'span2'},
                        this.renderTemplate('standard-input', {
                            'rfc': '5.1.1',
                            'label': 'Method',
                            'help': 'HTTP Verb',
                            'attributes': {
                                'class': 'span2',
                                'type': 'text',
                                'data-storage': 'option',
                                'name': 'method',
                                'tabindex': 1,
                                'autocomplete': true,
                                'placeholder': 'ex: POST',
                                'list': 'methods',
                                'required': true
                            }
                        })
                    ),

                    div({'class': 'span8'},
                        this.renderTemplate('standard-input', {
                            'rfc': '3.2',
                            'label': 'URI',
                            'help': 'Universal Resource Identifier. ex: https://www.sample.com:9000',
                            'attributes': {
                                'class': 'span8',
                                'type': 'text',
                                'data-storage': 'option',
                                'name': 'url',
                                'tabindex': 1,
                                'autocomplete': true,
                                'placeholder': 'ex: http://example.com/resources/ef7d-xj36p',
                                'required': true,
                                'events': {
                                    'change': function(event) {
                                        var value = this.get('value');

                                        if (value.length && value.substr(0, 4) != 'http') {
                                            this.set('value', 'http://' + value);
                                        }

                                        this.fireEvent('highlight');
                                    }
                                }
                            }
                        })
                    ),

                    div({'class': 'span2'},
                        this.renderTemplate('standard-input', {
                            'label': 'Timeout',
                            'help': 'seconds',
                            'attributes': {
                                'class': 'span2',
                                'type': 'number',
                                'data-storage': 'extra',
                                'name': 'timeout',
                                'value': 60,
                                'tabindex': 1,
                                'min': 1,
                                'step': 1,
                                'required': true
                            }
                        })
                    )
                ),

                div({'class': 'row'},
                    this.renderTemplate('pairs', [
                        {
                            'name': 'query',
                            'label': 'Query String',
                            'data-storage': 'queryString',
                            'tabindex': 0
                        },

                        {
                            'name': 'headers',
                            'label': 'Headers',
                            'data-storage': 'headerCollection',
                            'tabindex': 0
                        }
                    ])
                )
            )
        }),

        'payload': new Template(function(data) {
            section({'id': 'payload', 'class': 'collapsed'},
                this.renderTemplate('section-header', 'Payload'),

                div({'class': 'row'},
                    div({'class': 'span6'},
                        this.renderTemplate('optional-input', [
                            {
                                'label': 'Content-Type',
                                'help': 'The mime type of the body of the request',
                                'attributes': {
                                    'class': 'span6',
                                    'type': 'text',
                                    'data-storage': 'header',
                                    'name': 'Content-Type',
                                    'tabindex': 2,
                                    'autocomplete': false,
                                    'placeholder': 'ex: application/x-www-form-urlencoded',
                                    'list': 'mimetypes',
                                    'disabled': true,
                                    'events': {
                                        'change': function(event) {
                                            var payload = this.getParent('#payload');
                                            var tab = payload.getElement('.tab-pane.urlencoded');
                                            var textarea = payload.getElement('textarea');

                                            if (this.get('disabled') != true && this.get('value').toLowerCase() == 'application/x-www-form-urlencoded') {
                                                tab.addClass('enabled');
                                                textarea.fireEvent('change');
                                            } else {
                                                tab.removeClass('enabled');
                                            }

                                            this.fireEvent('highlight');
                                        }
                                    }
                                }
                            },

                            {
                                'label': 'Content-Type Encoding',
                                'help': 'Acceptable encodings',
                                'attributes': {
                                    'class': 'span6',
                                    'type': 'text',
                                    'data-storage': 'extra',
                                    'name': 'content-encoding',
                                    'tabindex': 2,
                                    'autocomplete': false,
                                    'placeholder': 'ex: utf-8',
                                    'list': 'charset',
                                    'disabled': true
                                }
                            },

                            {
                                'label': 'Content-Length',
                                'help': 'The length of the request body in octets (8-bit bytes).',
                                'attributes': {
                                    'class': 'span6',
                                    'type': 'text',
                                    'data-storage': 'header',
                                    'name': 'Content-Length',
                                    'tabindex': 2,
                                    'autocomplete': true,
                                    'placeholder': 'ex: 348',
                                    'disabled': true
                                }
                            },

                            {
                                'label': 'Content-MD5',
                                'help': 'A Base64-encoded binary MD5 sum of the content of the request body.',
                                'attributes': {
                                    'class': 'span6',
                                    'type': 'text',
                                    'data-storage': 'header',
                                    'name': 'Content-MD5',
                                    'tabindex': 2,
                                    'autocomplete': true,
                                    'placeholder': 'ex: Q2hlY2sgSW50ZWdyaXR5IQ==',
                                    'disabled': true
                                }
                            }
                        ])
                    ),

                    div({'class': 'span6'},
                        div({'class': 'tabbable', 'data-name': 'payload'},
                            ul({'class': 'nav tabs'},
                                li({'class': 'active'}, a({'data-toggle': 'tab'}, 'RAW Body')),
                                li(a({'data-toggle': 'tab'}, 'Form Data')),
                                li(a({'data-toggle': 'tab'}, 'Attachments'))
                            ),

                            div({'class': 'tab-content'},
                                div({'class': 'tab-pane active'},
                                    fieldset({'class': 'control-group'},
                                        div({'class': 'controls'},
                                            textarea({
                                                'class': 'span6 padded',
                                                'name': 'payload',
                                                'data-storage': 'post-text',
                                                'rows': 5,
                                                'tabindex': 2,
                                                'placeholder': 'ex: XML, JSON, etc ...',
                                                'events': {
                                                    'change': function(event) {
                                                        var payload = this.get('value');
                                                        var section = this.getParent('#payload');
                                                        var type = section.getElement('input[name="Content-Type"]').get('value').toLowerCase();
                                                        var pairs = section.getElement('.pairs.payload');
                                                        var controls = pairs.getElement('.controls');

                                                        // remove all but last one
                                                        pairs.getElements('.input-append:nth-last-of-type(n+2)').destroy();

                                                        if (type == 'application/x-www-form-urlencoded') {
                                                            if (payload != '') {
                                                                payload = payload.parseQueryString();

                                                                Object.each(payload, function(value, key) {
                                                                    if (typeOf(value) == 'array') {
                                                                        value.each(function(val) {
                                                                            controls.fireEvent('addRow', {'name': key, 'value': val});
                                                                        });
                                                                    } else {
                                                                        controls.fireEvent('addRow', {'name': key, 'value': value});
                                                                    }
                                                                }.bind(this));
                                                            }
                                                        }
                                                    }
                                                }
                                            }),

                                            p({'class': 'help-text'}, 'Remember to set the Content-Type header.')
                                        )
                                    )
                                ),

                                div({
                                    'class': 'tab-pane urlencoded',
                                    'events': {
                                        'change:relay(input[type="text"])': function(event) {
                                            var form = this.getParent('form');
                                            var data = form.getPairs('payload');
                                            var type = form.getElement('input[name="Content-Type"]').get('value').toLowerCase();
                                            var textarea = form.getElement('textarea[name="payload"]');

                                            if (type == 'application/x-www-form-urlencoded') {
                                                textarea.set('value', Object.toQueryString(data));

                                                // trigger change event to store the resutls
                                                document.fireEvent('change', new FakeEvent(textarea));
                                            }
                                        },

                                        'click:relay(.remove)': function(event) {
                                            var container = document.getElement('.urlencoded');
                                            container.fireEvent('change', new FakeEvent(container.getElement('input[type="text"]')));
                                        }
                                    }},

                                    p({'class': 'help-text'}, 'Only Enabled for Content-Type: application/x-www-form-urlencoded'),

                                    this.renderTemplate('pairs', {
                                        'name': 'payload',
                                        'tabindex': 0
                                    })
                                ),

                                div({'class': 'tab-pane attachments'},
                                    this.renderTemplate('pairs', {
                                        'name': 'files',
                                        'tabindex': 0
                                    })
                                )
                            )
                        )
                    )
                )
            )
        }),

        'authorization': new Template(function(data) {
            section({'id': 'authorization', 'class': 'collapsed'},
                this.renderTemplate('section-header', 'Authorization'),

                div({'class': 'tabbable', 'data-name': 'authorization'},
                    ul({
                        'class': 'nav tabs',
                        'events': {
                            'click:relay(li a)': function(event) {
                                var tabbable = this.getParent('.tabbable');
                                var tabs = tabbable.getElements('ul.tabs li a');
                                var index = tabs.indexOf(this) + 1;

                                var pane = tabbable.getElement('> .tab-content > .tab-pane:nth-of-type(' + index + ')');
                                var panes = tabbable.getElements('> .tab-content > .tab-pane:not(:nth-of-type(' + index + '))');

                                panes.getElements('input[type="checkbox"]').each(function(checkbox) {
                                    checkbox.set('checked', false).fireEvent('change');
                                });

                                panes.getElements('select').each(function(select) {
                                    select.set('disabled', true);
                                });

                                pane.getElements('select').set('disabled', false);
                            }
                        }},

                        li({'class': 'active'}, a({'data-toggle': 'tab'}, 'Custom')),
                        li(a({'data-toggle': 'tab'}, 'Basic')),
                        li(a({'data-toggle': 'tab'}, 'Digest')),
                        li(a({'data-toggle': 'tab'}, 'oAuth'))
                    ),

                    div({'class': 'tab-content'},
                        div({'class': 'tab-pane active'},
                            this.renderTemplate('optional-input', [
                                {
                                    'label': 'Authorization',
                                    'help': 'Authentication credentials for HTTP authentication.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Authorization',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.34',
                                    'label': 'Proxy-Authorization',
                                    'help': 'Authorization credentials for connecting to a proxy.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Proxy-Authorization',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
                                        'disabled': true
                                    }
                                }
                            ])
                        ),

                        div({'class': 'tab-pane'},
                            input({'name': 'Authorization', 'type': 'hidden', 'disabled': true}),

                            this.renderTemplate('optional-input', [
                                {
                                    'label': 'Username',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'authorization',
                                        'name': 'basic-username',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: username',
                                        'required': true,
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'Password',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'password',
                                        'data-storage': 'authorization',
                                        'name': 'basic-password',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: password',
                                        'disabled': true
                                    }
                                }
                            ])
                        ),

                        div({'class': 'tab-pane'},
                            input({'name': 'Authorization', 'type': 'hidden', 'disabled': true}),

                            this.renderTemplate('optional-input', [
                                {
                                    'label': 'Username',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'name': 'digest-username',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: username',
                                        'required': true,
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'Password',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'password',
                                        'name': 'digest-password',
                                        'tabindex': 3,
                                        'autocomplete': true,
                                        'placeholder': 'ex: password',
                                        'disabled': true
                                    }
                                }
                            ])
                        ),

                        div({'class': 'tab-pane oauth'},
                            div({'class': 'row'},
                                div({'class': 'span6'},
                                    div({'class': 'row'},
                                        div({'class': 'span2'},
                                            this.renderTemplate('optional-input', {
                                                'label': 'Version',
                                                'help': '',
                                                'attributes': {
                                                    'class': 'span2',
                                                    'type': 'number',
                                                    'data-storage': 'authorization',
                                                    'name': 'version',
                                                    'tabindex': 3,
                                                    'autocomplete': true,
                                                    'placeholder': 'ex: 1.0',
                                                    'required': true,
                                                    'disabled': true,
                                                    'events': {
                                                        'change': function(event) {
                                                            this.set('value', parseInt(this.get('value')).toFixed(1));

                                                            this.fireEvent('highlight');
                                                        }
                                                    }
                                                }
                                            })
                                        ),

                                        div({'class': 'span2'},
                                            fieldset({'class': 'control-group'},
                                                label({'class': 'control-label', 'for': 'signature'}, 'Signature Method'),
                                                div({'class': 'controls'},
                                                    select({'class': 'span2', 'name': 'signature', 'data-storage': 'authorization', 'tabindex': 3, 'disabled': true},
                                                        option({'value': 'HMAC-SHA1', 'selected': true},'HMAC-SHA1'),
                                                        option({'value': 'PLAINTEXT'}, 'PLAINTEXT')
                                                    ),
                                                    p({'class': 'help-text'}, '')
                                                )
                                            )
                                        ),

                                        div({'class': 'span2'},
                                            fieldset({'class': 'control-group'},
                                                label({'class': 'control-label', 'for': 'method'}, 'Preferred Method'),
                                                div({'class': 'controls'},
                                                    select({'class': 'span2', 'name': 'method', 'data-storage': 'authorization', 'tabindex': 3, 'disabled': true},
                                                        option({'value': 'header', 'selected': true}, 'Header'),
                                                        option({'value': 'query'},'Query String')
                                                    ),
                                                    p({'class': 'help-text'}, '')
                                                )
                                            )
                                        )
                                    ),

                                    this.renderTemplate('optional-input', [
                                        {
                                            'label': 'Consumer Key',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'consumer_key',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                                'required': true,
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Consumer Secret',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'consumer_secret',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                                'required': true,
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Token Key',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'token_key',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Token Secret',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'token_secret',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Scope',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'scope',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: ',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Realm',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span6',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'realm',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: ',
                                                'disabled': true
                                            }
                                        }
                                    ])
                                ),

                                div({
                                    'class': 'span5',
                                    'events': {
                                        'keyup:relay(input[type="text"])': function(event) {
                                            var container = this.getParent('.span5');
                                            var button = container.getElement('button');
                                            var urls = container.getElements('input[type="text"][name$="_url"]').get('value');

                                            button.set('disabled', urls.contains(''));
                                        }
                                    }},

                                    this.renderTemplate('optional-input', [
                                        {
                                            'label': 'Request token URL',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span5',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'request_url',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: https://api.provider.com/oauth/request_token',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Access token URL',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span5',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'access_url',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: https://api.provider.com/oauth/access_token',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Authorize URL',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span5',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'authorize_url',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: https://api.provider.com/oauth/authorize',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Oauth Callback',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span5',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'oauth_callback',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: https://www.domain.com',
                                                'disabled': true
                                            }
                                        },

                                        {
                                            'label': 'Oauth Verifier',
                                            'help': '',
                                            'attributes': {
                                                'class': 'span5',
                                                'type': 'text',
                                                'data-storage': 'authorization',
                                                'name': 'oauth_verifier',
                                                'tabindex': 3,
                                                'autocomplete': true,
                                                'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                                'disabled': true
                                            }
                                        }
                                    ]),

                                    button({
                                        'class': 'btn info',
                                        'disabled': true,
                                        'events': {
                                            'click': function(event) {
                                                alert('awesome');
                                            }
                                        }
                                    }, 'Authorize')
                                )
                            )
                        )
                    )
                )
            )
        }),

        'headers': new Template(function(data) {
            section({'id': 'headers', 'class': 'collapsed'},
                this.renderTemplate('section-header', 'Headers'),

                div({'class': 'tabbable'},
                    ul({'class': 'nav tabs'},
                        li({'class': 'active'}, a({'data-toggle': 'tab'}, 'Standard Headers')),
                        li(a({'data-toggle': 'tab'}, 'Cache')),
                        li(a({'data-toggle': 'tab'}, 'Common non-standard headers'))
                    ),

                    div({'class': 'tab-content'},
                        div({'class': 'tab-pane active'},
                            this.renderTemplate('optional-input', [
                                {
                                    'rfc': '14.1',
                                    'label': 'Accept',
                                    'help': 'Content-Types that are acceptable.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Accept',
                                        'tabindex': 4,
                                        'autocomplete': false,
                                        'placeholder': 'ex: text/plain',
                                        'list': 'mimetypes',
                                        'disabled': true
                                    }
                                },
/*
                                {
                                    'rfc': '14.2',
                                    'label': 'Accept Charset',
                                    'help': 'Character sets that are acceptable.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Accept-Charset',
                                        'tabindex': 4,
                                        'autocomplete': false,
                                        'placeholder': 'ex: utf-8',
                                        'list': 'charset',
                                        'disabled': true
                                    }
                                },
                                {
                                    'rfc': '14.3',
                                    'label': 'Accept Encoding',
                                    'help': 'Acceptable encodings.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Accept-Encoding',
                                        'tabindex': 4,
                                        'autocomplete': false,
                                        'placeholder': 'ex: identity',
                                        'list': 'encoding',
                                        'disabled': true
                                    }
                                },


                                {
                                    'rfc': '14.4',
                                    'label': 'Accept Language',
                                    'help': 'Acceptable languages for response.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Accept-Language',
                                        'tabindex': 4,
                                        'autocomplete': false,
                                        'placeholder': 'ex: en-US',
                                        'list': 'languages',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.10',
                                    'label': 'Connection',
                                    'help': 'What type of connection the user-agent would prefer',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Connection',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: keep-alive',
                                        'disabled': true
                                    }
                                },
                                *
                                {
                                    'label': 'Cookie',
                                    'help': 'an HTTP cookie previously sent by the server',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Cookie',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: UserID=JohnDoe; Max-Age=3600; Version=1',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.18',
                                    'label': 'Date',
                                    'help': 'The date and time that the message was sent',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Date',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Tue, 15 Nov 1994 08:12:31 GMT',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.20',
                                    'label': 'Expect',
                                    'help': 'Indicates that particular server behaviors are by the client',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Expect',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 100-continue',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.22',
                                    'label': 'From',
                                    'help': 'The email address of the user making the request.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'From',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: user@example.com',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.31',
                                    'label': 'Max-Forwards',
                                    'help': 'Limit the number of times the message can be forwarded through proxies or gateways.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Max-Forwards',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 10',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.32',
                                    'label': 'Pragma',
                                    'help': 'Implementation-specific headers that may have various effects anywhere along the request-response chain.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Pragma',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: no-cache',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.35',
                                    'label': 'Range',
                                    'help': 'Request only part of an entity. Bytes are numbered from 0.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Range',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: bytes=500-999',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.36',
                                    'label': 'Referer',
                                    'help': 'This address of the previous web page from which a link to the currently requested page was followed.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Referer',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: http://www.restconsole.com/',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.41',
                                    'label': 'Transfer-Encoding',
                                    'help': 'The transfer encodings the user agent is willing to accept.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'TE',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: trailers, deflate',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.42',
                                    'label': 'Upgrade',
                                    'help': 'Ask the server to upgrade to another protocol.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Upgrade',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.43',
                                    'label': 'User-Agent',
                                    'help': 'The user agent string of the user agent.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'User-Agent',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.45',
                                    'label': 'Via',
                                    'help': 'Informs the server of proxies through which the request was sent.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Via',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 1.0 fred, 1.1 nowhere.com (Apache/1.1)',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.64',
                                    'label': 'Warning',
                                    'help': 'A general warning about possible problems with the entity body.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Warning',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 199 Miscellaneous warning',
                                        'disabled': true
                                    }
                                }
                            ])
                        ),

                        div({'class': 'tab-pane'},
                            this.renderTemplate('optional-input', [
                                {
                                    'rfc': '14.9',
                                    'label': 'Cache-Control',
                                    'help': 'Used to specify caching mechanisms along the request/response chain',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Cache-Control',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: no-cache',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.24',
                                    'label': 'If-Match',
                                    'help': 'Only perform the action if the client supplied entity matches the same entity on the server.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'If-Match',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.25',
                                    'label': 'If-Modified-Since',
                                    'help': 'Allows a 304 Not Modified to be returned if content is unchanged',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'If-Modified-Since',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Sat, 29 Oct 1994 19:43:31 GMT',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.26',
                                    'label': 'If-None-Match',
                                    'help': 'Allows a 304 Not Modified to be returned if content is unchanged',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'If-None-Match',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.27',
                                    'label': 'If-Range',
                                    'help': 'If the entity is unchanged, send the missing part(s); otherwise, send the entire new entity',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'If-Range',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 737060cd8c284d8af7ad3082f209582d',
                                        'disabled': true
                                    }
                                },

                                {
                                    'rfc': '14.28',
                                    'label': 'If-Unmodified-Since',
                                    'help': 'Only send the response if the entity has not been modified since a specific time.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'If-Unmodified-Since',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: Sat, 29 Oct 1994 19:43:31 GMT',
                                        'disabled': true
                                    }
                                }
                            ])
                        ),

                        div({'class': 'tab-pane'},
                            this.renderTemplate('optional-input', [
                                {
                                    'label': 'Origin',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'Origin',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: chrome-extension',
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'X-HTTP-Method-Override',
                                    'help': 'mainly used bypass firewalls and browsers limitations.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'X-HTTP-Method-Override',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: PUT',
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'X-Requested-With',
                                    'help': 'mainly used to identify Ajax requests.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'X-Requested-With',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: XMLHttpRequest',
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'X-Forwarded-For',
                                    'help': '',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'X-Forwarded-For',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: ',
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'X-Do-Not-Track',
                                    'help': 'Requests a web application to disable their tracking of a user.',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'X-Do-Not-Track',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 1',
                                        'disabled': true
                                    }
                                },

                                {
                                    'label': 'DNT',
                                    'help': 'Requests a web application to disable their tracking of a user. (This is Mozilla\'s version of the X-Do-Not-Track header',
                                    'attributes': {
                                        'class': 'span12 padded',
                                        'type': 'text',
                                        'data-storage': 'header',
                                        'name': 'DNT',
                                        'tabindex': 4,
                                        'autocomplete': true,
                                        'placeholder': 'ex: 1',
                                        'disabled': true
                                    }
                                }
                            ])
                        )
                    )
                )
            )
        }),

        'response': new Template(function(data) {
            section({'id': 'response'},
                this.renderTemplate('section-header', 'Response'),

                div({'class': 'tabbable', 'data-name': 'response'},
                    ul({'class': 'nav tabs'},
                        li({'class': 'active'}, a({'accesskey': 'q', 'data-toggle': 'tab'}, 'Re', span('q'), 'uest')),
                        li(a({'accesskey': 'n', 'data-toggle': 'tab'}, 'Respo', span('n'), 'se')),
                        li(a({'accesskey': 'v', 'data-toggle': 'tab'}, 'Pre', span('v'), 'iew')),
                        li(a({'accesskey': 'c', 'data-toggle': 'tab'}, 'HTTP Ar', span('c'), 'hive'))
                    ),

                    div({'class': 'tab-content'},
                        div({'class': 'tab-pane'},
                            pre({'class': 'prettyprint linenums request'}, code()),
                            a({'class': 'har btn disabled', 'download': 'request'}, i({'class': 'icon download-alt'}), 'Download HTTP Request'),
                            a({'class': 'har btn disabled', 'download': 'requestBody'}, i({'class': 'icon download-alt'}), 'Download Body')
                        ),

                        div({'class': 'tab-pane active'},
                            pre({
                                'class': 'prettyprint linenums response',
                                'events': {
                                    // clicks within the response body
                                    'click:relay(a[href])': function(event) {
                                        event.preventDefault();

                                        document.getElement('input[name="url"]').set('value', this.get('href'));
                                        document.getElement('input[name="method"]').set('value', 'GET');
                                        //document.getElement('form[name="request"]').fireEvent('submit', new DOMEvent);
                                    }
                                }
                            }, code()),
                            a({'class': 'har btn disabled', 'download': 'response'}, i({'class': 'icon download-alt'}), 'Download HTTP Response'),
                            a({'class': 'har btn disabled', 'download': 'responseBody'}, i({'class': 'icon download-alt'}), 'Download Body')
                        ),

                        div({'class': 'tab-pane'},
                            div({'id': 'preview'}),
                            a({'class': 'har btn disabled', 'download': 'preview'}, i({'class': 'icon download-alt'}), 'Download')
                        ),

                        div({'class': 'tab-pane'},
                            pre({'class': 'prettyprint linenums har'}, code({'class': 'language-js'})),
                            a({'class': 'har btn disabled', 'download': 'har'}, i({'class': 'icon download-alt'}), 'Download')
                        )
                    )
                )
            )
        })
    },

    'resizeEvent': function(event) {
        document.getElement('.fluid-container.main').setStyle('height', window.getHeight() - 80);
        document.getElement('.fluid-sidebar').setStyle('height', window.getHeight() - 140);
        document.getElement('#response').setStyle('min-height', window.getHeight() - 140);
        document.getElements('#response pre, #preview').setStyle('height', window.getHeight() - 298);
    },

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

    'initialize': function() {
        var debug = new Console();

        debug.groupStart('REST Console: Initializing');

        // set google analytics info
        window._gaq = [['_setAccount','UA-598217-26'],['_trackPageview'],['_trackPageLoadTime']];

        // render the body templates
        debug.group('rendering body');
        var body = document.body.empty();
        body.adopt(this.renderTemplate('header'));
        body.adopt(this.renderTemplate('container'));
        body.adopt(this.renderTemplate('footer'));

        // add the datalists
        debug.group('loading datalists');
        Object.each(this.datalists, function(datalist, id) {
            datalist.sort();
            body.adopt(this.renderTemplate('datalist', {'id': id, 'values': datalist}));
        }.bind(this));

        // load history
        debug.group('loading history');
        document.getElement('.nav.list.history').adopt(this.renderTemplate('historyItem', new History().getAll())).fireEvent('change');

        // assign global events
        debug.group('attaching events');
        document.addEvents(this.events);

        // fix sizing
        window.addEvent('resize', this.resizeEvent).fireEvent('resize');

        this.initInterface(defaults);

        // load default values
        var defaults = new Storage('defaults');

        if (Object.getLength(defaults.data) == 0) {
            debug.group('first run, starting with empty object');

            // create empty defaults object
            localStorage.setItem('defaults', JSON.encode(new HAR.Request().toObject()));

            // reload
            defaults = new Storage('defaults');
        }

        debug.groupEnd();

        this.resetValues(defaults.data);

        this.checkOnlineStatus(this);
    },

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

    'clearTabIndex': function() {
        document.getElements('iframe').set('tabindex', '-1');
        document.getElements('.IN-widget a').set('tabindex', '-1');
    },

    'saveValues': function() {
        new Console().log('Saving ...');

        var form = document.getElement('form[name="main"]');

        // init data object
        var data = {
            'url': form.getElement('[name="url"]').get('value'),
            'method': form.getElement('[name="method"]').get('value'),
            'authorization': {},
            'extra': {},
        };

        // construct extras array
        form.getElements('[data-storage="extra"]').each(function(field) {
            if (!field.get('disabled')) {
                data.extra[field.get('name')] = field.get('value');
            }
        });

        form.getElements('[data-storage="authorization"]').each(function(field) {
            if (!field.get('disabled')) {
                data.authorization[field.get('name')] = field.get('value');
            }
        });

        // init HAR.Request
        var request = new HAR.Request(data);

        // post text
        request.addPostText(form.getElement('[data-storage="post-text"]').get('value'));

        // headers
        form.getElements('[data-storage="header"]').each(function(header) {
            if (!header.get('disabled')) {
                request.addHeader(header.get('name'), header.get('value'));
            }
        });

        // custom headers
        var headers = {
            'keys': form.getElements('[data-storage="headerCollection"][name="key"]').get('value'),
            'values': form.getElements('[data-storage="headerCollection"][name="value"]').get('value')
        };

        headers.keys.each(function(key, index) {
            if (key != '') {
                request.addHeader(key, headers.values[index]);
            }
        });

        // query string data
        var query = {
            'keys': form.getElements('[data-storage="queryString"][name="key"]').get('value'),
            'values': form.getElements('[data-storage="queryString"][name="value"]').get('value')
        };

        query.keys.each(function(key, index) {
            if (key != '') {
                request.addQueryParam(key, query.values[index]);
            }
        });

        localStorage.setItem('defaults', JSON.stringify(request.toObject()));
    },

    'resetValues': function(defaults) {
        var debug = new Console();

        debug.groupStart('REST Console: Loading Defaults ...');

        // main fields
        debug.group('main fields');
        document.getElement('input[name="url"]').set('value', defaults.url).fireEvent('change');
        document.getElement('input[name="method"]').set('value', defaults.method).fireEvent('change');
        document.getElement('textarea[name="payload"]').set('value', defaults.postData.text).fireEvent('change');

        // query string params
        debug.group('query string');
        defaults.queryString.each(function(param) {
            document.getElement('.pairs.query .controls').fireEvent('addRow', param)
        });

        // headers
        debug.group('headers');
        defaults.headers.each(function(header) {
            var input = document.getElement('[data-storage="header"][name="' + header.name + '"]');

            if (input) {
                var container = input.set('value', header.value).getParent('.input-prepend');

                if (container) {
                    container.getElement('input[type="checkbox"]').set('checked', true).fireEvent('change');
                }

                input.fireEvent('change')
            } else {
                document.getElement('.pairs.headers .controls').fireEvent('addRow', header)
            }
        });

        // authorization
        debug.group('authorization fields');
        Object.each(defaults.authorization, function(value, name) {
            var input = document.getElement('[data-storage="authorization"][name="' + name + '"]');

            if (input) {
                var container = input.set('value', value).getParent('.input-prepend');

                if (container) {
                    container.getElement('input[type="checkbox"]').set('checked', true).fireEvent('change');
                }

                input.fireEvent('change')
            }
        });

        // extra
        debug.group('extras');
        Object.each(defaults.extra, function(value, name) {
            var input = document.getElement('[data-storage="extra"][name="' + name + '"]');

            if (input) {
                var container = input.set('value', value).getParent('.input-prepend');

                if (container) {
                    container.getElement('input[type="checkbox"]').set('checked', true).fireEvent('change');
                }

                input.fireEvent('change');
            }
        });

        debug.groupEnd();

        // focus on method field
        document.getElement('input[name="method"]').focus();
    },

    'initInterface': function() {
        var debug = new Console();

        debug.groupStart('Loading Interface Defaults ...');

        var tabs        = new Storage('tabs');
        var sections    = new Storage('sections');

        // sections
        debug.group('sections');
        document.getElements('section').each(function(section) {
            var data = sections.get(section.get('id'));

            if (data != null) {
                section.removeClass('collapsed');

                if (data == false) {
                    section.addClass('collapsed');
                }
            }
        });

        // tabs
        debug.group('tabs');
        document.getElements('.tabbable .tabs').each(function(tab) {
            var index = tabs.get(tab.getParent('.tabbable').dataset.name);

            var link = tab.getElement('li:nth-of-type({0}) a'.substitute([index + 1]));

            document.fireEvent('click', new FakeEvent(link));

            tab.fireEvent('click', new FakeEvent(link));
        });

        debug.groupEnd();
    },

    'setProgress': function(progress) {
        document.getElement('.progress .bar').setStyle('width', progress + '%');
    },

    'send': function() {
        var error = false;

        // check for required fields
        document.getElements('*[required]').each(function(element) {
            if (!error && !element.get('disabled') && element.get('value').length == 0) {
                element.focus();
                new Console().log('Missing ' + element.get('name'));
                new Alert('danger', 'Missing Data', 'Please Fill out all the required fields');
                error = true;
            }
        });

        if (!error) {
            var data = new Storage('defaults').data;

            // check for authorization data
            switch (true) {
                case (data.authorization.consumer_key  != undefined && data.authorization.consumer_secret  != undefined):
                    var oauth = this.signOAuth();

                    if (data.authorization.method == 'header') {
                        data.headers.push({
                            'name': 'Authorization',
                            'value': oauth.header
                        });
                    } else {
                        Object.each(oauth.query.parseQueryString(), function(value, name) {
                            data.queryString.push({
                                'name': name,
                                'value': value
                            })
                        });
                    }
                    break;

                case (data.authorization['basic-username'] != undefined):
                    var header = data.authorization['basic-username'] + ':';

                    if (data.authorization['basic-password'] != undefined) {
                        header += data.authorization['basic-password'];
                    }

                     data.headers.push({
                        'name': 'Authorization',
                        'value': 'Basic ' + btoa(header)
                    });
                    break;
            }

            // set mimeType
            var contentType = document.getElement('input[name="Content-Type"]');

            if (!contentType.get('disabled')) {
                data.postData.mimeType = contentType.get('value').split(';')[0];
            }

            // store into history
            if (new History().add(data)) {
                document.getElement('.nav.list.history').adopt(this.renderTemplate('historyItem', data)).fireEvent('change');
            }

            var options = {
                'url': data.url,
                'query': {},
                'payload': '',
                'files': [],
                'headers': {},
                'async': true,
                'method': data.method,
                'link': 'ignore',
                'isSuccess': null,
                'emulation': false,
                'evalScripts': false,
                'evalResponse': false,
                'timeout': data.extra.timeout * 1000,

                'onRequest': function() {
                    // replace buttons with animation
                    document.getElement('footer').addClass('active');

                    // scroll to the response area
                    document.fireEvent('click', new FakeEvent(document.getElement('a[href="#response"]')));

                    // set progress
                    $RESTConsole.setProgress(10);
                },

                'onProgress': function(event, xhr) {
                    if (event.lengthComputable) {
                        $RESTConsole.setProgress((event.loaded / event.total) * 100);
                    } else {
                        $RESTConsole.setProgress(50);
                    }
                },

                'onTimeout': function() {
                    window.XHR.cancel();

                    new Alert('danger', 'Connection Timed-out', '');
                },

                'onCancel': function() {
                    // remove loading animation
                    document.getElement('footer').removeClass('active');
                }.bind(this),

                'onComplete': this.processResponse
            };

            // queryString
            data.queryString.each(function(param) {
                options.query[param.name] = param.value;
            });

            // headers
            data.headers.each(function(header) {
                options.headers[header.name] = header.value;
            });

            // set payload
            if (options.headers['Content-Type'] == 'application/x-www-form-urlencoded') {
                options.payload = (data.postData.text.length) ? data.postData.text.parseQueryString() : {};
            } else {
                options.payload = data.postData.text;
            };

            // modify Content-Type header based on encoding charset
            // TODO: shouldn't this be done as a rule in the REQUEST object?
            if (data.extra['content-encoding']) {
                options.encoding = data.extra['content-encoding'],
                options.headers['Content-Type'] = options.headers['Content-Type'] + '; charset=' + options.encoding;
            }

            // files
            document.getElements('.input-append:not(:last-of-type) input[type="file"]').each(function(input) {
                var key = input.getPrevious('input[name="key"]').get('value');

                if (key != '') {
                    input.files[0].key = key;
                }

                options.files.push(input.files);
            });

            // clear response area
            document.getElements('#preview, pre.har code, pre.request code, pre.response code').each(function(code) {
                code.empty();
            });

            if (error) {
                // stop on error
                return false;
            } else {
                window.XHR = new Request(options).send();
            }
        }
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
