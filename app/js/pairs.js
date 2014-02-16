$(function pairs () {
    // catch all input-pairs
    $('.input-pairs')
        .on('focus', '.form-group:last-of-type input', function onFocus () {
            $(this).trigger('duplicate');
        })

        .on('duplicate', '.form-group:last-of-type input', function onDuplicate () {
            var container = $(this).parents('.form-group');

            container.clone().insertAfter(container).find('input').val('');

            container.find('button').toggleClass('disabled');
        })

        .on('click', '.form-group:not(:last-of-type) button', function onClick () {
            var pairs = $(this).parents('.input-pairs');
            $(this).parents('.form-group').remove();

            // re-construct
            pairs.find('.form-group:first-of-type input').trigger('change');
        });
});
