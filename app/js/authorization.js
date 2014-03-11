$(function Authorization() {
    console.log('Authorization.js');

    // input field listener
    $('#authorization-basic').on('click', 'button', function onChange (event, skipStorage) {
        event.preventDefault();

        var container = $('#authorization-basic');
        var authorization = $('input[name="Authorization"]');

        var base64 = btoa(container.find('input[name="Username"]').val() + ':' + container.find('input[name="Password"]').val());

        // set the header value
        authorization.val('Basic ' + base64);

        // update
        authorization.trigger('enable').trigger('change', [skipStorage]);
    });
});
