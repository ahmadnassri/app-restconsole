// Google Analytics
var GA = analytics.getService('restconsole').getTracker('UA-598217-26');

GA.sendAppView('MainView');

// TODO: best way to execute?
$(window).on('load', function () {
    // translate page
    $('[i18n]').each(Utilities.translate);

    // enable tabs
    $('a[data-toggle="tab"]').tab();

    // enable toggling buttons
    $().button('toggle');

    // attach global listeners
    $('#editor')
        .on('click', '.input-group-addon input[type="checkbox"]', Handlers.checkBoxToggle)
        .on('change', 'input:not([type="checkbox"], [name="Username"], [name="Password"], [name="key"], [name="value"]), select', Handlers.inputChange);

    // catch all input-pairs
    $('.input-pairs')
        .on('focus', '.form-group:last-of-type input', Handlers.inputPairs.focus)
        .on('click', '.form-group:not(:last-of-type) button', Handlers.inputPairs.remove);

    // query builder
    $('button[data-action="query-builder"]').on('click', Handlers.queryPairs.toggle);
    $('#query .input-pairs').on('change', '.form-group:not(:last-of-type) input', Handlers.queryPairs.change);
    $('input[name="Path"]').on('change', Handlers.queryPairs.path);

    // form builder
    $('#payload')
        //.on('focus', '#payload-form .input-pairs .form-group:last-of-type input', Handlers.payloadForm.confirm)
        .on('change', '#payload-form .form-group:not(:last-of-type) input', Handlers.payloadForm.pairs)
        .on('change', '#payload-raw textarea', Handlers.payloadForm.text)

    // auto-MD5 toggle
    $('button[data-action="auto-md5"]').on('click', Handlers.MD5.toggle);

    // attach special listeners
    $('input[name="Host"').on('change', Handlers.parseHost);
    $('#authorization-basic').on('change', 'input', AuthorizationProcessors.basic);

    // generate the first output on load
    Utilities.processAllForms();
});
