$(function () {
    /**
     * checkbox listener for enabling/disabling optional input fields
     */
    $('#editor').on('click', '.input-group-addon input[type="checkbox"]', function () {
        // go up, then go down
        var input = $(this).parents('.input-group').find('.form-control');

        // change it
        input.prop('disabled', !$(this).prop('checked')).trigger('change');
    });
});
