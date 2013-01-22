.PHONY: application extension help

all: application extension

# target: application - Build Application.
application:
	$(MAKE) -C application

# target: extension - Build Extension.
extension:
	$(MAKE) -C extension

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile
