$(function () {
    // catch all input-pairs
    $('.input-pairs')
        .on('focus', '.form-group:last-of-type input', function () {
            $(this).trigger('duplicate');
        })

        .on('duplicate', '.form-group:last-of-type input', function () {
            var container = $(this).parents('.form-group');

            container.clone().insertAfter(container).find('input').val('');

            container.find('button').toggleClass('disabled');
        })

        .on('click', '.form-group:not(:last-of-type) button', function () {
            var pairs = $(this).parents('.input-pairs');
            $(this).parents('.form-group').remove();

            // re-construct
            pairs.find('.form-group:first-of-type input').trigger('change');
        });
});
