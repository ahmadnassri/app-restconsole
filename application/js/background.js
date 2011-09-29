var oAuth = {
    'instance': null,

    'hasInstance': function() {
        return this.instance ? true : false;
    },

    'initialize': function(options) {
        this.instance = ChromeExOAuth.initBackgroundPage(options);
    },

    'hasToken': function() {
        return this.instance.hasToken();
    },

    'authorize': function() {
        if (this.hasInstance()) {
            this.instance.authorize(function() {
                chrome.extension.getViews().forEach(function(view) {
                    dialog = view.document.querySelector('form.authorization.oauth');

                    if (dialog) {
                        var token_key = dialog.querySelector('input[name="token_key"]');
                        var token_secret = dialog.querySelector('input[name="token_secret"]');

                        token_key.value = oAuth.instance.getToken();
                        token_key.fireEvent('change');

                        token_secret.value = oAuth.instance.getTokenSecret();
                        token_secret.fireEvent('change');
                    }
                });
            });
        }
    },

    'clear': function() {
        if (this.hasInstance()) {
            this.instance.clearTokens();
            this.instance = null;
        }
    }
}
