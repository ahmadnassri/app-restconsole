$(function () {
    // TODO move to localStorage;
    var DATA = {};

    function constructHTTPRequestText () {
        // construct HTTPArchive Request object
        var request = new HTTPArchiveRequest({
            'method': DATA.target.Method,
            'url': 'http://' + DATA.target.Host + DATA.target.Path,
            'httpVersion': DATA.target.Protocol
        });

        // construct headers
        $.each(DATA.headers, function (name, value) {
            request.setHeader(name, value);
        });

        // add Authorization header
        if (DATA.authorization['Authorization']) {
            request.setHeader('Authorization', DATA.authorization['Authorization']);
        }

        // add Proxy-Authorization header
        if (DATA.authorization['Proxy-Authorization']) {
            request.setHeader('Proxy-Authorization', DATA.authorization['Proxy-Authorization']);
        }
        // write outputs
        //$('#request-curl code').html(harToCurl(HAR));
        $('#request-har code').html(JSON.stringify(request.toJSON()));

        // TODO: manually add blocked headers (ex: HOST)
        $('#request-raw code').html(request.printHeaders());
    }

    /**
     * listener on input changes to clean up and set default values
     */
    $('#editor').on('change', 'input:not([type="checkbox"], [name="Username"], [name="Password"], [name="key"], [name="value"]), select', function (event, enable) {
        var el = $(this);
        var form = el.parents('form').prop('name');
        var name = el.prop('name');
        var data = el.data('default');

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
        if (el.val() === '' && data !== '') {
            el.val(data);
        }

        // only store enabled elements
        if (el.is(':disabled')) {
            delete DATA[form][name];
        } else {
            DATA[form][name] = el.val();
        }

        constructHTTPRequestText();
    });

    // onload cycle through all the individual forms and generate output
    $('#editor form').each(function () {
        var form = $(this);

        // initiate grouping
        var name = form.prop('name');

        if (DATA[name] === undefined) {
            DATA[name] = {};
        }

        // create key-value array
        $.each(form.serializeArray(), function (_, input) {
            DATA[name][input.name] = input.value;
        });
    });

    constructHTTPRequestText();
});

// jQuery plugins
jQuery.substitute = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split('.'), v = data[keys.shift()];

        for (var i = 0, l = keys.length; i < l; i++) {
            v = v[keys[i]];
        }

        return (typeof v !== 'undefined' && v !== null) ? v : '';
    });
};
