$(function Translate () {
    console.group('Translate.js');
    console.time('Translate.js');

    // process input placeholders prefix
    var prefix = chrome.i18n.getMessage('placeholder_example_prefix');

    console.groupCollapsed('[placeholder]');

    $('[placeholder]').each(function translateInputPlaceholder () {
        var input = $(this);
        var value = prefix + ' ' + input.prop('placeholder');
        input.attr('placeholder', value);

        console.log('[%s] = "%s"', this.name, value);
    });

    console.groupEnd();

    console.groupCollapsed('[i18n]');

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

        console.log('[%s][%s] = "%s"', this.tagName, element.data('i18nTarget') || 'innerText', message);
    });

    console.groupEnd();

    console.timeEnd('Translate.js');
    console.groupEnd();
});
