PN=project-templates
PREFIX=$(HOME)/.local
STOWPREFIX=$(PREFIX)/stow/$(PN)
install: $(PREFIX)/create-project.sh

$(PREFIX)/create-project.sh:
	mkdir -p $(STOWPREFIX)/bin
	install *.sh $(STOWPREFIX)/bin
	mkdir -p $(STOWPREFIX)/share
	cp -vr *.d $(STOWPREFIX)/share
	cd $(dir $(STOWPREFIX)) && stow $(PN)
