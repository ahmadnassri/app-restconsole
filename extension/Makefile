name	:= rest-console-launcher
path	:= ../dist/extension
#json	:= $(shell find dist -type f -name "*.json")

.PHONY: all setup js crx dist clean ${json}

all: clean setup js $(json)

setup:
	@echo "[SETUP] copying files"
	@mkdir -p $(path)

	@cp *.json $(path)
	@cp -r _locales $(path)
	@cp -r images $(path)

# target: js minify JavaScript with UgilifyJS
js:
	@echo "[JS] compressing JavaScript"
	@uglifyjs background.js -o $(path)/background.js

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
	@rm -rf *.crx
	@rm -rf *.pem

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
