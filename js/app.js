window.addEvent('domready', function() {
    // field checkboxes
    document.getElements('div.input-prepend > label.add-on > input[type="checkbox"]').addEvent('change', function(event) {
        this.getParent('div.input-prepend > input').set('disabled', !this.get('checked'));
    }).fireEvent('change');

    // modals
    document.getElements('.modals .modal-backdrop').addEvent('click', function(event) {
        this.getParent('.modals').toggleClass('hide').getElements('.modal').addClass('hide');
    });

    document.getElements('.modals .modal-header a.close').addEvent('click', function(event) {
        this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
    });

    // authorization modals
    document.getElements('button.authorization').addEvent('click', function(event) {
        event.preventDefault();

        document.getElement('.modals').toggleClass('hide').getElement('.modal.authorization.' + this.dataset.type).removeClass('hide');
    });

    // basic auth submit event
    document.getElement('form.authorization.basic').addEvents({
        'submit': function(event) {
            event.preventDefault();

            var auth = this.toQueryString().parseQueryString();

            document.getElement('input[name="Authorization"]').set('value', 'Basic ' + btoa(auth.username + ':' + auth.password));

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        },

        'reset': function(event) {
            document.getElement('input[name="Authorization"]').set('value', null);

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        }
    });

    // oauth submit event
    document.getElement('form.authorization.oauth').addEvents({
        'submit': function(event) {
            event.preventDefault();

            var request = document.getElement('form[name="request"]').toQueryString().parseQueryString();
            var auth = this.toQueryString().parseQueryString();

            var request = {
                'path': request.uri,
                'action': request.method,
                'method': auth.method,
                'signatures': {
                    'consumer_key': auth.consumer_key,
                    'shared_secret': auth.consumer_secret,
                    'access_token': auth.token_key,
                    'access_secret': auth.token_secret
                }
            };

            var data_query = '';
            //var data_query = Object.toQueryString(options.data);

            if (data_query != '' && request['Content-Type'] == 'application/x-www-form-urlencoded') {
                request.parameters = data_query + '&oauth_version=' + auth.version;
            } else {
                request.parameters = 'oauth_version=' + auth.version;
            }

            var oauth = OAuthSimple().sign(request);

            if (auth.method == 'header') {
                document.getElement('input[name="Authorization"]').set('value', oauth.header);
            } else {
                //options.url = oauth.signed_url;

                // MooTools appends the same body twice
                // TODO: Params!
                //if (form.elements['body[type]'].get('value') == 'application/x-www-form-urlencoded') {
                    //options.url = options.url.replace('&' + form.elements['body[type]'].get('value'), null);
                //}
            }
        },

        'reset': function(event) {
            document.getElement('input[name="Authorization"]').set('value', null);

            this.getParent('.modals').getElement('.modal-backdrop').fireEvent('click');
        }
    });

    // request submit event
    document.getElement('form[name="request"]').addEvent('submit', function(event) {
        event.preventDefault();

        var data = this.toQueryString().parseQueryString();

        console.log(data);
    });
});
