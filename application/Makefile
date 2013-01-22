name	:= rest-console
#version	:= $(shell python2 -c "import json;print json.load(open('manifest.json'))['version']")
#release	:= ${name}-${version}

#chrome := $(which google-chrome)
#crush  := pngcrush -force -l 9 -rem text -rem gAMA -rem cHRM -rem iCCP -rem sRGB -res 96 -rem time -q
zip    := zip -9 -q

.PHONY: all setup css js crx dist clean

all: clean setup css js

setup:
	@echo "[SETUP] copying files"
	@mkdir -p bin

	@cp *.html *.json bin
	@cp -r _locales bin
	@cp -r images bin

# target: css - minify CSS with LESSC
css:
	@echo "[CSS] compiling CSS"
	@lessc --yui-compress less/app.less bin/app.css

# target: js minify JavaScript with UgilifyJS
js:
	@echo "[JS] compressing JavaScript"
	@cat js/libs/*.js js/app.js | uglifyjs -o bin/app.js
#	yuicompressor --type js src/scripts/$(notdir $@) -o bin/scripts/$(notdir $@)

# target: crx - Build .crx extension
crx:
	@$(if $(shell pidof $(chrome)),$(error $(chrome) running, cannot create extension) $(exit 1),)
	@echo "[CRX] building CRX"
	@ln -s bin $(name)
	$(chrome) --pack-extension=$(name)
	@rm $(name)

#dist: css javascript
#	@echo "[SETUP] copying files..."
#	@mkdir -p bin

#	@cp *.html *.json bin
#	@cp -r _locales bin
#	@cp -r images bin

#	@echo "[DIST] crushing images and icons..."
#	@${crush} -d $(build_dir)/icons src/icons/*.png 2>&1>/dev/null
#	@rm $(build_dir)/icons/TF_*.png
#	@${crush} -d $(build_dir)/media src/media/*.png 2>&1>/dev/null

#	@echo "[DIST] creating distribution..."
#	@cd $(build_dir) && $(zip) -r ../$(dist_dir)/$(release).zip .
#	@echo "[DIST] build complete.  Distributable at $(dist_dir)/$(release).zip"

# target: clean - Removes minified CSS and JS files.
clean:
	@echo "[CLEAN] cleaning up"
	@rm -rf bin


# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
