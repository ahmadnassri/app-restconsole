$(function Query () {
    'use strict';

    console.log('Query.js');

    $('button[data-action="query-builder"]').on('click', function onClick () {
        console.log('(onClick) button[data-action="query-builder"]');

        $('#query').toggle();
    });

    $('input[name="Path"]').on('change', function onChange (event, skipStorage, skipProcessing) {
        console.log('(onChange) input[name="Path"]');

        if (skipProcessing !== true) {
            var path = $('input[name=Path]');

            // validate starting slash
            if (path.val().indexOf('/') !== 0) {
                path.val('/' + path.val());
            }

            // TODO: handle duplicate keys => array values
            var uri = new URI(path.val());

            // clear inputs
            $('#query .input-pairs .form-group:not(:last-of-type)').remove();

            $.each(URI.parseQuery(uri.query()), function setQueryPair (key, value) {
                var container = $('#query .input-pairs .form-group:last-of-type');
                container.find('input[name="key"]').val(key);

                // triggering focus does not work here becuase the tab will not be in view
                container.find('input[name="value"]').val(value).trigger('duplicate');
            });
        }
    });

    $('#query .input-pairs').on('change', '.form-group:not(:last-of-type) input', function onChange () {
        console.log('(onChange) #query .input-pairs > .form-group:not(:last-of-type) > input');

        var path = $('input[name="Path"]');
        var uri = new URI(path.val());

        // clear the existing string
        uri.query('');

        // create key-value array
        // TODO: handle duplicate keys => array values
        $('form[name="query"] .form-group:not(:last-of-type)').each(function addQueryPair () {
            var group = $(this);
            uri.addQuery(group.find('input[name="key"]').val(), group.find('input[name="value"]').val());
        });

        // trigger change on the Path input, but skip processing (loop)
        path.val(uri.resource()).trigger('change', [false, true]);
    });
});
