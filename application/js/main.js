// Google Analytics
var GA = analytics.getService('restconsole').getTracker('UA-598217-26');

GA.sendAppView('MainView');

$(function () {
    // enable tabs
    $('a[data-toggle="tab"]').tab();

    // enable toggling buttons
    $().button('toggle');
});
