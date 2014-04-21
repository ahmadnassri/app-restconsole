$(function DOM () {
    'use strict';

    console.log('initiating DOM.js');

    /**
     * checkbox listener for enabling/disabling optional input fields
     */
    $('#editor').on('click', '.input-group-addon input[type="checkbox"]', function onClick () {
        console.log('(onClick) #editor > input');

        // go up, then go down
        var input = $(this).parents('.input-group').find('.form-control');

        // change it
        input.prop('disabled', !$(this).prop('checked')).trigger('change');
    });

    /**
     * enable fields that are disabled
     */
    $('input:disabled').on('enable', function onEnable () {
        var el = $(this);
        el.prop('disabled', false);
        el.prev('.input-group-addon').find('input[type="checkbox"]').prop('checked', true);
    });
});
