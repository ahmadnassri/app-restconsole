var Console = new Class({
    'initialize': function() {
        if  (typeof(console) !== 'undefined') {
            this.enabled = true;
        }
    },

    'log': function() {
        if (this.enabled) {
            arguments[0] = 'REST Console: ' + arguments[0];
            console.log.apply(console, arguments);
        }
    },

    'group': function() {
        if (this.enabled) {
            console.log.apply(console, arguments);
        }
    },

    'groupStart': function() {
        if (this.enabled) {
            console.groupCollapsed.apply(console, arguments);
        }
    },

    'groupEnd': function() {
        if (this.enabled) {
            console.groupEnd.apply(console, arguments);
        }
    }
})

/**
 * Template class shortcut for Mooml templates
 */
Template = new Class({
    'Extends': Mooml.Template,

    'initialize': function(HTMLCode) {
        this.name = null;
        this.HTMLCode = HTMLCode;
        this.prepared = false;
    }
});

/**
 * Mixin for implemenation in Mootools classes
 */
Templates = new Class({
    'Implements': [Mooml.Templates],

    'renderSection': function(name, data, bind) {
        var template = this.sections[name];
        return (template)? template.render(data, [bind, this].pick()) : null;
    }
});

String.implement({
    'htmlEntities': function() {
        return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    'parseUrl': function() {
        var exp = /\b(https?|ftp):\/\/([-A-Z0-9.]+)(\/[-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[-A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
        var parts = exp.exec(this);

        if (parts) {
            if (parts[3] == undefined) {
                parts[3] = '/';
            }

            return {
                'scheme': parts[1],
                'host': parts[2],
                'path': parts[3],
                'queryString': parts[4]
            }
        } else {
            return {
                'scheme': null,
                'host': null,
                'path': null,
                'queryString': null
            }
        }
    }
});

Array.implement({
    'toQueryString': function() {
        var queryString = {};

        this.each(function(param) {
            queryString[param.name] = param.value;
        });

        return Object.toQueryString(queryString);
    }
});

Element.implement({
    'toObject': function() {
        var str = this.toQueryString();

        if (str == '') {
            return {};
        } else {
            return str.parseQueryString();
        }
    },

    'toObjectNoPairs': function() {
        var obj = this.toObject();

        delete obj.key;
        delete obj.value;

        return obj;
    },

    'getPairs': function(name) {
        var keys = this.getElements('.pairs.' + name + ' input[name="key"]:not([value=""])').get('value');
        var values = this.getElements('.pairs.' + name + ' input[name="value"]:not([value=""])').get('value');

        // remove the last one because its always empty
        keys.pop();

        return values.associate(keys);
    },

    'getPadding': function() {
        var size = [
            this.getStyle('padding-left'),
            this.getStyle('padding-left'),
            this.getStyle('border-left-width'),
            this.getStyle('border-right-width')
        ];

        size.each(function(px, index) {
            size[index] = parseInt(px);
        });

        return size.sum();
    }
});

var Storage = new Class({
    'name': false,

    'initialize': function(name) {
        this.name = name;
        this.data = JSON.parse(localStorage.getItem(this.name));

        if (this.data == null) {
            this.data = {};
        }
    },

    'save': function() {
        localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    'get': function(key) {
        return this.data[key];
    },

    'set': function(key, value) {
        this.data[key] = value;
        this.save();
    },

    'remove': function(key) {
        delete this.data[key];
        this.save();
    }
});

var History = new Class({
    'initialize': function() {
        this.data = JSON.parse(localStorage.getItem('history'));

        if (this.data == null) {
            this.data = [];
        }
    },

    'save': function() {
        localStorage.setItem('history', JSON.stringify(this.data));
    },

    'getAll': function() {
        return this.data;
    },

    'get': function(index) {
        return this.data[index];
    },

    'getLast': function() {
        return this.get(this.data.length - 1);
    },

    'add': function(item) {
        var duplicate = false;

        this.data.each(function(record) {
            if (JSON.stringify(record) == JSON.stringify(item)) {
                duplicate = true;
            }
        });

        if (!duplicate) {
            this.data.push(item);
            this.save();

            return true;
        } else {
            return false;
        }
    },

    'remove': function(index) {
        this.data.splice(index, 1);
        this.save();
    },

    'removeLast': function(index) {
        this.remove(this.data.length - 1);
        this.save();
    }
});

FakeEvent = new Class({
    'initialize': function(target) {
        var event = new DOMEvent(document.createEvent('CustomEvent'));

        if (target) {
            event.target = target;
        }

        return event;
    }
});

function uint8ToString(buf) {
    var i, length, out = '';
    for (i = 0, length = buf.length; i < length; i += 1) {
        out += String.fromCharCode(buf[i]);
    }
    return out;
}
