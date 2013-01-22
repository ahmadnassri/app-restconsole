name	:= rest-console-launcher
#json	:= $(shell find dist -type f -name "*.json")

.PHONY: all setup js crx dist clean ${json}

all: clean setup js $(json)

setup:
	@echo "[SETUP] copying files"
	@mkdir -p dist

	@cp *.json dist
	@cp -r _locales dist
	@cp -r images dist

# target: js minify JavaScript with UgilifyJS
js:
	@echo "[JS] compressing JavaScript"
	@uglifyjs background.js -o dist/background.js

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
