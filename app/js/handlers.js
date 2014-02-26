$(function Handlers () {
    console.log('initiating Handlers.js');

    function onChange () {
        console.log('(onChange) textarea[name="payload"]');

        var payload = $('textarea[name="payload"]');
        var md5 = CryptoJS.MD5(payload.val()).toString(CryptoJS.enc.Hex);

        // update input filed and trigger change
        $('input[name="Content-MD5"]').val(md5).trigger('enable').trigger('change');
    }

    // auto-MD5 toggle
    $('button[data-action="auto-md5"]').on('click', function onClick (event) {
        console.log('(onClick) button[data-action="auto-md5"]');

        var payload = $('textarea[name="payload"]');

        // seems weird that jQuery is not able to query registered event handlers
        // the work around is to rely on the toggle class state of the button
        if ($(this).hasClass('active')) {
            // remove listner
            payload.off('change', onChange);
        } else {
            // run the first time
            onChange();

            // attach as listner
            payload.on('change', onChange);
        }
    });

    $('button[data-action="send-request"]').on('click', function onClick (event) {
        console.log('(onClick) button[data-action="send-request"]');

        window.XHR.send();
    });

    $('button[data-action="clipboard-copy"]').on('click', function onClick (event) {
        console.log('(onClick) button[data-action="clipboard-copy"]');

        document.execCommand('copy');
    });
});
