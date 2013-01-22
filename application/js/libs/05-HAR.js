var HAR = {
    'Log': new Class({
        'Implements': Options,

        'options': {
            'version' : '1.2',
            'creator': {
                'name': 'REST Console',
                'version': '4.0.1',
            },

            'browser': {
                'name': Browser.name,
                'version': Browser.version,
                'comment': navigator.userAgent
            },

            'pages': [],

            'entries': []
        },

        'initialize': function(options) {
            this.setOptions(options)
        },

        'addEntry': function(entry) {
            this.options.entries.push(entry);

            return this;
        },

        'toJson': function() {
            return JSON.encode(this.options);
        },

        'toObject': function() {
            return Object.clone(this.options);
        },

        'fromXHR': function(xhr) {

        }
    }),

    'Entry': new Class({
        'Implements': Options,

        'options': {
            'startedDateTime': new Date().toISOString(),
            'time': 0,
            'request': {},
            'response': {}
        },

        'initialize': function(options) {
            this.setOptions(options)
        },

        'toJson': function() {
            return JSON.encode(this.options);
        },

        'toObject': function() {
            return Object.clone(this.options);
        }
    }),

    'Request': new Class({
        'Implements': Options,

        'options': {
            'method': null,
            'url': null,
            'httpVersion': 'HTTP/1.1',
            'cookies': [],
            'headers': [],
            'queryString': [],
            'postData': {
                'mimeType': null,
                'params': [],
                'text' : null,
            },
            'headersSize': -1,
            'bodySize': -1,
            'comment': null
        },

        'initialize': function(options) {
            this.setOptions(options)
        },

        'addHeader': function(name, value, comment) {
            this.options.headers.push({
                'name': name,
                'value': value,
                'comment': comment
            });

            return this;
        },

        'addQueryParam': function(name, value) {
            this.options.queryString.push({
                'name': name,
                'value': value
            });

            return this;
        },

        'addPostParam': function(name, value, fileName, contentType) {
            this.options.postData.params.push({
                'name': name,
                'value': value,
                'fileName': fileName,
                'contentType': contentType,
            });

            return this;
        },

        'addPostText': function(value) {
            this.options.postData.text = value;

            return this;
        },

        'toJson': function() {
            return JSON.encode(this.options);
        },

        'toObject': function() {
            return Object.clone(this.options);
        }
    }),

    'Response': new Class({
        'Implements': Options,

        'options': {
            'status': 0,
            'statusText': null,
            'httpVersion': 'HTTP/1.1',
            'cookies': [],
            'headers': [],
            'content': {
                'size': 0,
                'compression': 0,
                'mimeType': null,
                'text': null
            },
            'redirectURL': null,
            'headersSize': -1,
            'bodySize': -1
        },

        'initialize': function(options) {
            this.setOptions(options)
        },

        'addHeader': function(name, value) {
            this.options.headers.push({
                'name': name,
                'value': value
            });

            return this;
        },

        'toObject': function() {
            return Object.clone(this.options);
        },

        'encode': function(encoding) {
            try {
                this.options.content.text = btoa(this.options.content.text);
                this.options.content.encoding = encoding;
            } catch (e) {
                console.log('failed encoding');
            }

            return this;
        },

        'setContentText': function(text) {
            this.options.content.text = text;

            return this;
        },

        'fromXHR': function(xhr) {
            var mimeType = xhr.getResponseHeader('Content-Type');

            if (mimeType != null) {
                var index = mimeType.indexOf(';');

                if (index > 1) {
                    mimeType = mimeType.slice(0, index);
                }
            }

            this.options.status = xhr.status;
            this.options.statusText = xhr.statusText;
            this.options.content.mimeType = mimeType;
            this.options.content.text = xhr.responseText;

            xhr.getAllResponseHeaders().split('\n').each(function(header) {
                if (header.trim() != '') {
                    header = header.trim().split(': ', 2)

                    this.addHeader(header[0], header[1]);
                }
            }.bind(this));

            return this;
        }
    })
}
