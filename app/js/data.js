$(function () {
    function constructHTTPRequestText () {
        chrome.storage.local.get('session', function (storage) {
            console.log(storage.session.target.Path);
            // construct HTTPArchive Request object
            var request = new HTTPArchiveRequest({
                'method': storage.session.target.Method,
                'url': 'http://' + storage.session.target.Host + storage.session.target.Path,
                'httpVersion': storage.session.target.Protocol
            });

            // construct headers
            $.each(storage.session.headers, function (name, value) {
                request.setHeader(name, value);
            });

            // add Authorization header
            if (storage.session.authorization.Authorization) {
                request.setHeader('Authorization', storage.session.authorization.Authorization);
            }

            // add Proxy-Authorization header
            if (storage.session.authorization['Proxy-Authorization']) {
                request.setHeader('Proxy-Authorization', storage.session.authorization['Proxy-Authorization']);
            }
            // write outputs
            //$('#request-curl code').html(harToCurl(HAR));
            $('#request-har code').html(JSON.stringify(request.toJSON()));

            // TODO: manually add blocked headers (ex: HOST)
            $('#request-raw code').html(request.printHeaders());
        });
    }

    /**
     * listener on input changes to clean up and set default values
     */
    $('#editor').on('change', 'input:not([type="checkbox"], [name="Username"], [name="Password"], [name="key"], [name="value"]), select', function (event, enable) {
        chrome.storage.local.get('session', function (storage) {
            var el = $(this);
            var form = el.parents('form').prop('name');
            var name = el.prop('name');
            var deflt = el.data('default');

            // ensure the the field is enabled (if triggered by a change event)
            if (enable) {
                // enable the field
                if (el.is(':disabled')) {
                    el.prop('disabled', false);
                    el.prev('.input-group-addon').find('input[type="checkbox"]').prop('checked', true);
                }
            }

            // trim (anything other than username / password fields)
            if ($.inArray(name, ['Username', 'Password']) === -1) {
                el.val(el.val().trim());
            }

            // if empty set default value
            if (el.val() === '' && deflt !== '') {
                el.val(deflt);
            }

            // only store enabled elements
            if (el.is(':disabled')) {
                delete storage.session[form][name];
            } else {
                storage.session[form][name] = el.val();
            }

            if (name === 'Path') {
                console.log(name, storage.session[form][name]);
            }

            // save changes
            chrome.storage.local.set({'session': storage.session});
        }.bind(this));
    });

    // listener to changes on local storage
    // TODO this is not successful, need to get away from callback hell
    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.hasOwnProperty('session')) {
            // reconstruct request
            constructHTTPRequestText();
        }
    });

    // initiate local storage
    chrome.storage.local.get('session', function (storage) {
        // must be first time
        if (!storage.hasOwnProperty('session')) {
            storage.session = {};

            // cycle through all the individual forms and generate output
            $('#editor form').each(function () {
                var form = $(this);
                var name = form.prop('name');

                if (storage.session[name] === undefined) {
                    storage.session[name] = {};
                }

                // create key-value array
                $.each(form.serializeArray(), function (_, input) {
                    storage.session[name][input.name] = input.value;
                });
            });

            // update storage
            chrome.storage.local.set({'session': storage.session});
        } else {
            for (var form in storage.session) {
                if (storage.session.hasOwnProperty(form)) {
                    for (var name in storage.session[form]) {
                        if (storage.session[form].hasOwnProperty(name)) {
                            $('#editor form[name="' + form + '"] [name="' + name + '"]').val(storage.session[form][name]).trigger('change', [true]);
                        }
                    }
                }
            }
        }

        // construct request for the first time
        constructHTTPRequestText();
    });
});
