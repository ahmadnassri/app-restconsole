$(function Form () {
    console.log('initiating Form.js');

    function force() {
        var type = $('input[name="Content-Type"]');

        if ($.inArray(type.val(), ['application/x-www-form-urlencoded', 'multipart/form-data']) === -1) {
            var result = confirm('Content-Type needs to be set to either "application/x-www-form-urlencoded" or "multipart/form-data", press ok to overwrite the current value now.');

            if (result === true) {
                // update value and force enable
                type.val('application/x-www-form-urlencoded').trigger('enable').trigger('change');
            }

            return result;
        }

        return true;
    }

    // form builder
    $('#payload')
        .on('change', '#payload-form .form-group:not(:last-of-type) input', function onChange () {
            console.log('(onChange) #payload-form > input');

            if (!force()) {
                return;
            }

            var payload = $('textarea[name="payload"]');
            var uri = new URI(payload.val());

            // clear the existing string
            uri.query('');

            // create key-value array
            // TODO: handle duplicate keys => array values
            // TODO: isn't this the same as pairs.js?
            $('#payload-form .form-group:not(:last-of-type)').each(function addQueryPair () {
                var group = $(this);
                uri.addQuery(group.find('input[name="key"]').val(), group.find('input[name="value"]').val());
            });

            payload.val(uri.query()).trigger('change');
        })

        .on('change', '#payload-raw textarea', function onChange (event, skip) {
            console.log('(onChange) #payload-raw > textarea');

            if (skip) {
                return;
            }

            // should only work for the correct Content-Type
            var type = $('input[name="Content-Type"]').val();
            if ($.inArray(type, ['application/x-www-form-urlencoded', 'multipart/form-data']) === -1) {
                // clear the pairs
                $('#payload-form .form-group:not(:last-of-type)').remove();
                return;
            }

            var payload = $(this);

            // TODO: handle duplicate keys => array values
            var uri = new URI().query(payload.val());

            // clear inputs
            $('#payload-form .form-group:not(:last-of-type)').remove();

            $.each(URI.parseQuery(uri.query()), function setQueryPair (key, value) {
                var container = $('#payload-form .form-group:last-of-type');
                container.find('input[name="key"]').val(key);

                // triggering focus does not work here becuase the tab will not be in view
                container.find('input[name="value"]').val(value).trigger('duplicate');
            });
        });
});
