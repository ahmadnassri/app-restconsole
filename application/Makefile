name	:= rest-console
tmp		:= ../dist/tmp
path	:= ../dist/application
vendor	:= ../vendor
#json	:= $(shell find dist -type f -name "*.json")

.PHONY: all setup css js crx build clean ${json}

all: clean setup css js ${json}

setup:
	@echo "[SETUP] copying files"
	@mkdir -p $(tmp)
	@mkdir -p $(path)

	@cp *.json $(path)
	@cp -r _locales $(path)
	@cp -r pages $(path)
	@cp -r images $(path)
	@cp -r fonts $(path)

# target: css - minify CSS with LESSC
css:
	@echo "[CSS] compiling CSS"
	@lessc --yui-compress styles/app.less $(path)/app.css

# target: js minify JavaScript with UgilifyJS
js:
	@echo "[MooTools] Building MooTools"
	@$(vendor)/mootools-core/build > $(tmp)/mootools.js
	@$(vendor)/mootools-more/build >> $(tmp)/mootools.js
	@echo "[JS] compressing JavaScript"
	@uglifyjs js/background.js -o $(path)/background.js
	@cat $(tmp)/mootools.js $(vendor)/mooml/Source/mooml.js ../libs/*.js js/app.js js/ui.js | uglifyjs -o $(path)/app.js

# TODO: figure out what UglifyJS doesn't wory with JSON
# ${json}:
#	@echo "[JS] compressing JSON"
#	@uglifyjs -o $@ $@

# target: crx - Build .crx extension
crx:
	@echo "[CRX] building CRX"
	@google-chrome --pack-extension=$(path)

# target: clean - Removes minified CSS and JS files.
clean:
	@echo "[CLEAN] cleaning up"
	@rm -rf $(path)
	@rm -rf $(tmp)
	@rm -rf *.crx
	@rm -rf *.pem

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
