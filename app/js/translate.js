$(function Translate () {
    // process input placeholders
    var prefix = chrome.i18n.getMessage('placeholder_example_prefix');

    $('[placeholder]').each(function translateInputPlaceholder () {
        var input = $(this);
        input.attr('placeholder', prefix + ' ' + input.prop('placeholder'));
    });

    // process all other elements
    $('[i18n]').each(function translateElement () {
        var element = $(this);
        var message = chrome.i18n.getMessage(element.attr('i18n'));

        switch (element.data('i18nTarget')) {
            case 'value':
                element.val(message);
                break;

            case 'title':
                element.attr('title', message);
                break;

            case 'placeholder':
                element.attr('placeholder', prefix + ' ' + message);
                break;

            default:
                element.html(message);
        }
    });
});
