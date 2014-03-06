$(function Main () {
    console.log('initiating Main.js');

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
