// Google Analytics
var GA = analytics.getService('restconsole').getTracker('UA-598217-26');

GA.sendAppView('MainView');

$(function () {
    // enable tabs
    $('a[data-toggle="tab"]').tab();

    // enable toggling buttons
    $().button('toggle');

    // initiate HTTP Log
    var HTTPLog = new HTTPArchiveLog({
        'browser': {
            'name': 'REST Console',
            'version': 'x.x.x'
        }
    });
});
