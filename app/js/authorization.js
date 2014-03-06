$(function Authorization() {
    console.log('Authorization.js');

    // input field listener
    $('#authorization-basic').on('change', 'input', function onChange (event, skipStorage) {
        console.log('(onChange) #authorization-basic > input');

        var input = $('input[name="Authorization"]').first();
        var container = $(this).parents('.form-group');
        var base64 = btoa(container.find('input[name="Username"]').val() + ':' + container.find('input[name="Password"]').val());

        // set the header value
        input.val('Basic ' + base64);

        // update
        input.trigger('enable').trigger('change', [skipStorage]);
    });
});
