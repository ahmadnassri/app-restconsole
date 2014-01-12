$(function () {
    function change () {
        var payload = $('textarea[name="payload"]');
        var md5 = CryptoJS.MD5(payload.val()).toString(CryptoJS.enc.Hex);

        // update input filed and trigger change
        $('input[name="Content-MD5"]').val(md5).trigger('change', [true]);
    }
    // auto-MD5 toggle
    $('button[data-action="auto-md5"]').on('click', function () {
        var payload = $('textarea[name="payload"]');

        // seems weird that jQuery is not able to query registered event handlers
        // the work around is to rely on the toggle class state of the button
        if ($(this).hasClass('active')) {
            // remove listner
            payload.off('change', change);
        } else {
            // run the first time
            change();

            // attach as listner
            payload.on('change', change);
        }
    });
});
