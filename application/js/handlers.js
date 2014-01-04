var Handlers = {
    parseHost: function () {
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
        // go up, then go down
        var input = $(this).parents('.input-group').find('.form-control');

        // change it
        input.prop('disabled', !$(this).prop('checked')).trigger('change');
    },

    /**
     * listener on input changes to clean up and set default values
     */
    inputChange: function () {
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

            // TODO: handle duplicate keys => array values
            var uri = new URI(path.val());

            // clear inputs
            $('.input-pairs .form-group:not(:last-of-type)').remove();

            $.each(URI.parseQuery(uri.query()), function(key, value) {
                var container = $('.input-pairs .form-group:last-of-type');
                container.find('input[name="key"]').val(key);
                container.find('input[name="value"]').val(value).trigger('focus');
            });
        }
    },

    MD5: {
        toggle: function() {
            var payload = $('textarea[name="payload"]');

            // seems weird that jQuery is not able to query registered event handlers
            // the work around is to rely on the toggle class state of the button
            if ($(this).hasClass('active')) {
                // remove listner
                payload.off('change', Handlers.MD5.change);
            } else {
                // run the first time
                Handlers.MD5.change();

                // attach as listner
                payload.on('change', Handlers.MD5.change);
            }
        },

        change: function() {
            var payload = $('textarea[name="payload"]');
            var md5 = CryptoJS.MD5(payload.val()).toString(CryptoJS.enc.Hex);

            // update input filed and trigger change
            $('input[name="Content-MD5"]').val(md5).trigger('change');
        }
    }
};
