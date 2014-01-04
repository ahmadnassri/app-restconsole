var AuthorizationProcessors = {
    basic: function () {
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
