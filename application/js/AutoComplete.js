var AutoComplete = new Class({
    'Implements': Options,

    'options': {
        'size': 10,
        'render': function(value) {
            return new Element('span', {'text': value});
        }
    },

    'initialize': function(options) {
        this.setOptions(options);

        document.getElements('input[list]').each(function(input) {
            var options = document.id(input.get('list')).getElements('option');
            var values = options.get('value');
            var labels = options.get('text');

            var children = [];

            values.each(function(value, index) {
                children.push(new Element('div', { 'data-value': value, 'text': labels[index] }));
            });

            var list = new Element('div', {
                'class':  'autocomplete',
                'for': input.get('name'),
                'data-current': 0,
                'styles': {
                    'display': 'none',
                    'width': input.getWidth() - 2
                },

                'events': {
                    'click:relay(div)': function(event) {
                        event.stopPropagation();

                        var list = this.getParent().hide();
                        list.dataset.current = -1;
                        var input = list.getPrevious('[name={0}]'.substitute([list.get('for')]));
                        input.set('value', this.dataset.value);
                    }
                }
            });

            list.adopt(children).inject(input, 'after');

            list.position({
                'relativeTo': input,
                'position': 'bottomLeft',
                'edge': 'upperLeft'
            });
        });

        document.getElements('input[list]').addEvents({
            'focus': function(event) {
                var list = this.getNext('[for={0}]'.substitute([this.get('name')])).show().scrollTo(0, 0);

                // reposition the list
                list.position({
                    'relativeTo': this,
                    'position': 'bottomLeft',
                    'edge': 'upperLeft'
                });

                list.dataset.current = -1;
                list.getElements('div').hide().removeClass('enabled').removeClass('active');

                if (this.get('value').length > 0) {
                    list.getElements('div[data-value*="{0}"]'.substitute([this.get('value')])).show().addClass('enabled');
                } else {
                    list.getElements('div').show().addClass('enabled');
                }
            },

            'click': function(event) {
                event.stopPropagation();
            },

            'keyup': function(event) {
                if (!['down', 'up', 'left', 'right', 'esc', 'enter'].contains(event.key)) {
                    this.fireEvent('focus', event);
                }
            },

            'keydown:keys(down)': function(event) {
                event.stop();

                var list = this.getNext('[for={0}]'.substitute([this.get('name')]));

                if (!list.isDisplayed()) {
                    this.fireEvent('focus', event);
                } else {
                    list.show();
                }

                var suggestions = list.getElements('div.enabled');

                if (suggestions.length == 0) {
                    suggestions = list.getElements('div').show();
                }

                var current = Number(list.dataset.current);

                if (current + 1 < suggestions.length) {
                    var next = current + 1;
                    var size = suggestions[next].getSize(list);
                    var coordinates = suggestions[next].getCoordinates(list);

                    list.dataset.current = next;

                    if (suggestions[current]) {
                        suggestions[current].removeClass('active');
                    }

                    suggestions[next].addClass('active');

                    if (coordinates.bottom >= list.getSize().y) {
                        list.scrollTo(0, list.getScroll().y + size.y);
                    }
                }
            },

            'keydown:keys(up)': function(event) {
                event.stop();

                var list = this.getNext('[for={0}]'.substitute([this.get('name')]));

                if (!list.isDisplayed()) {
                    this.fireEvent('focus', event);
                } else {
                    list.show();
                }

                var suggestions = list.getElements('div.enabled');

                if (suggestions.length == 0) {
                    suggestions = list.getElements('div').show();
                }

                var current = Number(list.dataset.current);

                if (current - 1 >= 0) {
                    var previous = current - 1;
                    var size = suggestions[previous].getSize(list);
                    var coordinates = suggestions[previous].getCoordinates(list);

                    list.dataset.current = previous;

                    suggestions[current].removeClass('active');
                    suggestions[previous].addClass('active');

                    if (coordinates.top <= 0) {
                        list.scrollTo(0, list.getScroll().y - size.y);
                    }
                }
            },

            'keydown:keys(esc)': function(event) {
                document.getElements('.autocomplete').hide()
            },

            'keydown:keys(enter)': function(event) {
                var list = this.getNext('[for={0}]'.substitute([this.get('name')]));

                if (list.isDisplayed()) {
                    event.stop();

                    var suggestions = list.getElements('div.enabled');

                    if (suggestions.length == 0) {
                        suggestions = list.getElements('div');
                    }

                    if (list.dataset.current > -1) {
                        this.set('value', suggestions[list.dataset.current].dataset.value);
                        list.dataset.current = -1;
                    }

                    list.hide();
                }
            }
        });

        document.body.addEvent('click', function(event) {
            document.getElements('.autocomplete').hide()
        });
    }
});
