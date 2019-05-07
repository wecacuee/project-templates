ifndef INCLUDED_PDFLATEX_MK
INCLUDED_PDFLATEX_MK=1
OO?=out
PDFLATEX?=xelatex -shell-escape -interaction=nonstopmode -file-line-error -output-directory=$(OO)
PDFLATEX_R:=$(PDFLATEX) -recorder

-include $(OO)/*.mk

e:=
INDENT:=$(e)    $(e)

.PRECIOUS .ONESHELL:
$(OO)/%.pdf: %.tex $(OO)/.mkdir
	$(PDFLATEX_R) $<
	### Create a dependency list in makefile format
	echo "$@: \\" > $(OO)/$*.mk
	# If some file is missing add it to dependency list (e.g $*.bbl)
	sed -n 's/No file \([^ ]\+\.\w\{3,4\}\)\.\?/$(INDENT)$(OO)\/\1 \\/p' $(OO)/$*.log >> $(OO)/$*.mk
	# -recorder flag will output the files that were opened by pdflatex to
	# $*.fls
	# Parse the input files into the makefile. Remove the aux file from
	# dependency list.
	sed -n 's/INPUT \(.\+\)/$(INDENT)\1 \\/p' $(OO)/$*.fls | grep -Ev '$*.(aux|w18|aex)' >> $(OO)/$*.mk
	# Rerun pdflatex if the log file says so
	if grep -q 'Rerun to get cross-references right' $(OO)/$*.log; \
		then $(PDFLATEX_R) $<; \
	fi

PWD:=$(shell pwd)
.PRECIOUS:
$(OO)/%.bbl: %.tex
	cd $(OO) 
	BIBINPUTS=.:$(PWD):$(BIBINPUTS) BSTINPUTS=.:$(PWD):$(BSTINPUTS) bibtex $(*F).aux
	cd $(PWD)
	# The bibfile is present in log output as Database file #1: <filename>
	# Parse the blg file to generate the list of dependent bib files.
	echo "$@: \\" > $(OO)/$*.bbl.mk
	sed -n 's/Database file #\d\+: \([^ ]\+.bib\)/$(INDENT)\1 \\/p' $(OO)/$*.blg >> $(OO)/$*.bbl.mk
	grep -F '.tex' $(OO)/$*.mk >> $(OO)/$*.bbl.mk

.PRECIOUS: %/.mkdir
%/.mkdir: 
	mkdir -p $(@D)
	touch $@

.PHONY:
%.pdf-clean:
	rm $(OO)/$*.*
	rm $*.pdf
	rm $(OO)/.mkdir
	rmdir $(OO)

endif
