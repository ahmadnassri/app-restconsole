var Alert = new Class({
    'Implements': [Events, Templates],

    'templates': {
        'main': new Template(function(data) {
            div({
                'class': 'alert alert-' + data.type,
                'events': {
                    'click:relay(a)': function(event) {
                        this.getParent().destroy();
                    }
                }},

                a({'class': 'close'}, '×'),
                strong(data.title + ' '),
                data.message
            )
        })
    },

    'initialize': function(type, title, message) {
        var alert = this.renderTemplate('main', {'type': type, 'title': title, 'message': message});

        document.body.adopt(alert);

        // trigger auto close after a dealy
        alert.destroy.delay(5000, alert);
    }
});

window.addEvent('domready', function(event) {
    document.addEvents({
        'click:relay(a[data-scroll="smooth"])': function(event) {
            var anchor = this.get('href');
            var context = document.getElement('.fluid-container.main');
            var element = document.getElement(anchor) || document.getElement('a[name=' + anchor + ']');

            if (!element) {
                return;
            }

            event.preventDefault();

            new Fx.Scroll(context, {'offset': {'y': -20}, 'wheelStops': true}).toElement(element, 'y');
        },

        'click:relay(a[data-toggle="tab"], .nav.list li > a:not([data-spy="scroll"]))': function(event) {
            this.getParent('ul').getElement('.active').removeClass('active');
            this.getParent('li').addClass('active');
        },

        'click:relay(a[data-toggle="tab"])': function(event) {
            var tabbable = this.getParent('.tabbable');
            var tabs = tabbable.getElements('> ul.tabs li a');
            var panes = tabbable.getElements('> .tab-content > .tab-pane');
            var index = tabs.indexOf(this);

            panes.removeClass('active')[index].addClass('active');

            new Storage('tabs').set(tabbable.dataset.name, index);
        },

        'click:relay(.nav.list summary)': function(event) {
            var open = this.getParent('.nav').getElement('details[open]');

            if (open) {
                open.erase('open');
            }
        }
    })
});
