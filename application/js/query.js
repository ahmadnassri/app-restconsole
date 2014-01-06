$(function () {
    $('button[data-action="query-builder"]').on('click', function () {
        $('#query').toggle();
    });

    $('input[name="Path"]').on('change', function (event, skip) {
        if (!skip) {
            var path = $('input[name=Path]');

            // TODO: handle duplicate keys => array values
            var uri = new URI(path.val());

            // clear inputs
            $('#query .input-pairs .form-group:not(:last-of-type)').remove();

            $.each(URI.parseQuery(uri.query()), function (key, value) {
                var container = $('#query .input-pairs .form-group:last-of-type');
                container.find('input[name="key"]').val(key);

                // triggering focus does not work here becuase the tab will not be in view
                container.find('input[name="value"]').val(value).trigger('duplicate');
            });
        }
    });

    $('#query .input-pairs').on('change', '.form-group:not(:last-of-type) input', function () {
        var path = $('input[name="Path"]');
        var uri = new URI(path.val());

        // clear the existing string
        uri.query('');

        // create key-value array
        // TODO: handle duplicate keys => array values
        $('form[name="query"] .form-group:not(:last-of-type)').each(function () {
            var group = $(this);
            uri.addQuery(group.find('input[name="key"]').val(), group.find('input[name="value"]').val());
        });

        path.val(uri.resource()).trigger('change', [true]);
    });
});
