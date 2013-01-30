.PHONY: application extension help

all: app ext

# target: application - Build Application.
app:
	@echo "[APPLICATION] building application"
	@make --no-print-directory --directory application

# target: extension - Build Extension.
ext:
	@echo "[APPLICATION] building application"
	@make --no-print-directory --directory extension

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
