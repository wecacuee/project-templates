ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
OO?=out
GROUPBIBDIR:=$(HOME)/wrk/group-bib
TEXINPUTS:=.:$(ROOT_DIR)/mtheme/:
#PDFLATEX:=xelatex -shell-escape -interaction=nonstopmode -file-line-error -output-directory=$(OO)
export TEXINPUTS

out/main.pdf:

out/main.bbl: $(GROUPBIBDIR)/shared.bib

iclr2017_conference.sty iclr2017_conference.bst fancyhdr.sty natbib.sty: \
	iclr2017.zip
	unzip $<
	touch $@

iclr2017.zip:
	wget http://www.iclr.cc/lib/exe/fetch.php?media=iclr2017:iclr2017_stylefiles_conference.zip -O $@

BIBINPUTS:=$(if $(wildcard $(GROUPBIBDIR)/shared.bib) \
	,.:$(GROUPBIBDIR), \
	$(error $(GROUPBIBDIR)/shared.bib not found. Please set GROUPBIBDIR in the Makefile))
include pdflatex.mk
