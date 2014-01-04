// TODO move to localStorage;
var DATA = {};

$(function () {
    function constructHTTPRequestText (data) {
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

        // write outputs
        //$('#request-curl code').html(harToCurl(HAR));
        $('#request-har code').html(JSON.stringify(HAR.request));
        $('#request-raw code').html(jQuery.substitute('{target.Method} {target.Path} {target.Protocol}\nHost: {target.Host}\n', data) + headers_string);
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

        constructHTTPRequestText(DATA);
    });

    // onload cycle through all the individual forms and generate output
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

    constructHTTPRequestText(DATA);
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
