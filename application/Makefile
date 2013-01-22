name	:= rest-console
#json	:= $(shell find dist -type f -name "*.json")

.PHONY: all setup css js crx dist clean ${json}

all: clean setup css js ${json}

setup:
	@echo "[SETUP] copying files"
	@mkdir -p dist

	@cp *.html *.json dist
	@cp -r _locales dist
	@cp -r images dist

# target: css - minify CSS with LESSC
css:
	@echo "[CSS] compiling CSS"
	@lessc --yui-compress less/app.less dist/app.css

# target: js minify JavaScript with UgilifyJS
js:
	@echo "[JS] compressing JavaScript"
	@cat js/libs/*.js js/app.js | uglifyjs -o dist/app.js

# TODO: figure out what UglifyJS doesn't wory with JSON
# ${json}:
#	@echo "[JS] compressing JSON"
#	@uglifyjs -o $@ $@

# target: crx - Build .crx extension
crx:
	@echo "[CRX] building CRX"
	@google-chrome --pack-extension=dist
	@mv dist.crx $(name).crx

# target: clean - Removes minified CSS and JS files.
clean:
	@echo "[CLEAN] cleaning up"
	@rm -rf dist
	@rm -rf *.crx
	@rm -rf *.pem

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
