const APP_ID = 'cokgbflfommojglbmbpenpphppikmonn';
const APP_URL = chrome.extension.getURL('index.html');

// handle duplicate instances
function handleDuplicate(context) {
    if (context.url == APP_URL) {
        chrome.tabs.query({'url': APP_URL}, function(tabs) {
            tabs.each(function(tab) {
                if (tab.id != context.id) {
                    chrome.tabs.remove(context.id);
                    chrome.tabs.update(tab.id, {'active': true});
                }
            });
        })
    }
}

// app launcher
function openApp() {
    chrome.tabs.query({'url': APP_URL}, function(tabs) {
        if (tabs.length) {
            chrome.tabs.update(tabs[0].id, {'active': true});
        } else {
            chrome.tabs.create({'url': APP_URL, 'active': true});
        }
    })
}

// attach handlers
chrome.tabs.onCreated.addListener(function (tab) {
    handleDuplicate(tab);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    changeInfo.url && handleDuplicate(tab);
});

// context menus
chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        'title': 'Open with REST Console',
        'contexts': ['page','frame','link'],
        'onclick': openApp,
        'documentUrlPatterns': ['http://*/*', 'https://*/*'],
        'targetUrlPatterns': ['http://*/*', 'https://*/*']
    });
});
/*
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
*/
