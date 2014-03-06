$(function Pairs () {
    console.log('initiating Pairs.js');

    // catch all input-pairs
    $('.input-pairs')
        .on('focus', '.form-group:last-of-type input', function onFocus () {
            console.log('(onFocus) .input-pairs > .form-group:last-of-type > input');

            $(this).trigger('duplicate');
        })

        .on('duplicate', '.form-group:last-of-type input', function onDuplicate () {
            console.log('(onDuplicate) .input-pairs > .form-group:last-of-type > input');

            var container = $(this).parents('.form-group');

            container.clone().insertAfter(container).find('input').val('');

            container.find('button').toggleClass('disabled');
        })

        .on('click', '.form-group:not(:last-of-type) button', function onClick () {
            console.log('(onClick) .input-pairs > .form-group:last-of-type > button');

            var pairs = $(this).parents('.input-pairs');
            $(this).parents('.form-group').remove();

            // re-construct
            pairs.find('.form-group:first-of-type input').trigger('change');
        });
});
