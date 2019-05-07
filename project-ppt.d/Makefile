all: Gruntfile.js package.json node_modules Mathjax
	npm start --  --port=1201


%.js: reveal.js/%.js reveal.js/package.json
	ln -s $<
	touch $@

%.json: reveal.js/%.json 
	ln -s $<
	touch $@

reveal.js/%.json: ~/co/reveal.js/%.json
	ln -s ~/co/reveal.js
	touch $@

node_modules: reveal.js/node_modules reveal.js/package.json
	mv reveal.js/$@ $@
	npm install
	mv $@ reveal.js/$@
	ln -s $@ reveal.js/$@
	touch $@

Mathjax: ~/co/MathJax/
	ln -s $<
	touch $@
