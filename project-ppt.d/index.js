// -*- js-indent-level: 2 -*-
// -*- js2-basic-offset: 2 -*-
(function (root, factory) {
  root.Index = factory(root);
  console.log("Document is ready");
}(this, function(root) {
  'use strict';
  var document = root.document;
  var Index = {};
  // More info about config & dependencies:
  // - https://github.com/hakimel/reveal.js#configuration
  // - https://github.com/hakimel/reveal.js#dependencies
  Reveal.initialize({

	// Factor of the display size that should remain empty around the content
	margin: 0.02,

    center : false,

    transition : "fade",
    history : true,
    slideNumber: 'c/t',
    controls: false,
    showNotes: false,
    dependencies: [
      { src: 'reveal.js/plugin/markdown/marked.js' },
      { src: 'reveal.js/plugin/markdown/markdown.js' },
      { src: 'reveal.js/plugin/math/math.js', async: true },
      { src: 'reveal.js/plugin/notes/notes.js', async: true },
      { src: 'reveal.js/plugin/highlight/highlight.js',
        async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
      { src: 'socket.io.js', async: true },
      { src: 'reveal.js/plugin/multiplex/master.js', async: true },
      // and if you want speaker notes
      // { src: 'reveal.js/plugin/notes-server/client.js', async: true }
    ],
    math : {
        mathjax: "./MathJax/MathJax.js",
    },
    keyboard: {
      38: 'prev', // prev on key down
      40: 'next', // next on key up
    },
    multiplex: {
        // Example values. To generate your own, see the socket.io server instructions.
        "secret": "15428297917341906458",
        "id":"4308ad89fe2e7d3f",
        url: 'http://fovea.eecs.umich.edu:1948' // Location of socket.io server
    },
  });

  var safeGetElemementById = function (parent, id) {
      var svg = parent.getElementById(id) || console.error("Bad id ", id);
      return svg;
  };

  var safeContentDocument = function (ele) {
      try {
          var svgdoc = ele.contentDocument;
      }
      catch(e) {
          svgdoc = ele.getSVGDocument();
      }
      if ( ! svgdoc)
          console.error("Cannot get svgdoc. Maybe replace file:// with http://");
      return svgdoc;
  };

  Index.getSVGObjElementById = function (svg_ele, ele_id) {
    var ele = safeGetElemementById(safeContentDocument(svg_ele), ele_id);
    return ele;
  };

  Index.getSVGElementById = function (svg_id, ele_id) {
    return Index.getSVGObjElementById(safeGetElemementById(document, svg_id),
      ele_id);
  };

  Index.makeAppear = function (svg_id, ele_id) {
      return [
          function (svg) {
              Index.getSVGElementById(svg_id, ele_id).style["display"] = "inherit";
          },
          function (svg) {
              Index.getSVGElementById(svg_id, ele_id).style["display"] = "none";
          }
      ];
  };

  Index.makeDisappear = function (svg_id, ele_id) {
      return [
          function (svg) {
              Index.getSVGElementById(svg_id, ele_id).style["display"] = "none";
          },
          function (svg) {
              Index.getSVGElementById(svg_id, ele_id).style["display"] = "inherit";
          }
      ];
  };

  Index.makeSwap = function (svg_id, ele_out, ele_in) {
      return [
          function (_) {
              var svg = safeContentDocument(safeGetElemementById(document, svg_id));
              safeGetElemementById(svg, ele_in).style["display"] = "inherit";
              safeGetElemementById(svg, ele_out).style["display"] = "none";
          },
          function (_) {
              var svg = safeContentDocument(safeGetElemementById(document, svg_id));
              safeGetElemementById(svg, ele_in).style["display"] = "none";
              safeGetElemementById(svg, ele_out).style["display"] = "inherit";
          }
      ];
  };

  Index.forSVGElementById = function (svg_id, element_ids, per_ele_func) {
      element_ids.forEach(function (ele_id) {
          var svg = document.getElementById(svg_id) || console.error("Bad svg_id", svg_id);
          var ele = Index.getSVGObjElementById(svg, ele_id) || console.error("Bad ele_id", ele_id);
          per_ele_func(ele);
      });
  };

  Reveal.addFragmentListner = function (
    fragment_id,
    on_fragment_shown, on_fragment_hidden)
  {
    Reveal.addEventListener("fragmentshown", function(e) {
      Array.from(e.fragments).forEach(function (frag) {
        if (frag.id == fragment_id)
          on_fragment_shown(frag);
      });
    }, false);
    Reveal.addEventListener("fragmenthidden", function(e) {
      Array.from(e.fragments).forEach(function (frag) {
        if (frag.id == fragment_id)
          on_fragment_hidden(frag);
      });
    }, false);
  };

  // *************************************************************
  // Handle videos inside fragments
  // *************************************************************
  var getTagChildren = function (element, tag_name, class_name) {
    var videles;
    if (element.tagName.toUpperCase() == tag_name.toUpperCase()) {
      videles = [element];
    } else {
      videles = Array.from(element.getElementsByTagName(tag_name));
    }
    if (class_name)
      videles = videles.filter(
          function (v) { return v.classList.contains(class_name); });
      return videles;
  };


  // Pause and play videos on slide change
  var pauseVideo = function (element) {
    getTagChildren(element, "video").forEach(function (pvidele) {
      console.log("Pausing : " + pvidele.id);
      pvidele.pause();
    });

    getTagChildren(element, "iframe").forEach(function (pvidele) {
      pvidele.contentWindow.postMessage(
        '{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*'); 
    });
  };

  var parseURIFragments = function (uri) {
      var dummya = document.createElement("a");
      dummya.href = uri;
      var hash = dummya.hash;
      var fragments = {};
      if (hash) {
          hash.slice(1).split("&").forEach(function (fragstr) {
              var parts = fragstr.split("=");
              fragments[parts[0]] = parts[1];
          });
      }
      return fragments;
  };

  var parseVideoStartTime = function (videle) {
      var fragments = parseURIFragments(videle.children[0].src);
      var starttime = 0;
      if (fragments["t"]) {
          var startend = fragments["t"].split(",");
          starttime = parseInt(startend[0]);
      }
      return starttime;
  };

  // Keep a record of previously played videos and pause them before
  // playing the next set of videos.
  var PLAY_ON_FRAGMENT_CLASS = PLAY_ON_FRAGMENT_CLASS;
  var previously_played_videos = [];
  var resetAndPlayVideo = function (element) {
    getTagChildren(element, "video", PLAY_ON_FRAGMENT_CLASS).forEach(function (videle) {
      videle.pause();
      videle.currentTime = parseVideoStartTime(videle);
      console.log("Playing : " + videle.id + " from: " + videle.currentTime);
      if ( ! videle.classList.contains("pause") ) {
        videle.play();
      }
      previously_played_videos.push(videle);
    });

    getTagChildren(element, "iframe", PLAY_ON_FRAGMENT_CLASS).forEach(function (videle) {
      if ( ! videle.classList.contains("pause") ) {
        videle.src += "&autoplay=1";
      }
    });
  };
  Reveal.addEventListener( 'fragmentshown',
                           function (e) {
                             previously_played_videos.forEach(
                               function (vid) { vid.pause() });
                             previously_played_videos = [];
                             Array.from(e.fragments).forEach(resetAndPlayVideo);
                           } );
  Reveal.addEventListener( 'fragmenthidden',
                           function ( e ) {
                             console.log("fragmenthidden " + e.fragment.id);
                             e.fragments.forEach(pauseVideo);
                           }, false);
  Reveal.addEventListener( 'slidechanged',
                           function ( e ) {
                             if (e.previousSlide)
                               pauseVideo(e.previousSlide);
                             if (e.currentSlide)
                               getTagChildren(
                                 e.currentSlide,
                                 "video", "slide-play").forEach(function (v) {
                                     v.pause();
                                     v.currentTime = parseVideoStartTime(v);
                                     console.log("Playing : " + v.id + " from: " + v.currentTime);
                                     v.play();
                                 });
                           });

  // *************************************************************
  // End of handling videos inside fragments
  // *************************************************************

  // Handle footnotes and citations
  Reveal.addEventListener( 'slidechanged', function( event ) {
    // event.previousSlide, event.currentSlide, event.indexh, event.indexv
    var footerele = document.getElementById("footer");
    footerele.innerHTML = "";
    var footnotelist = event.currentSlide.getElementsByTagName("cite");
    var rightfootnotestrings = [];
    var leftfootnotestrings = [];
    Array.from(footnotelist).forEach(function(fnl) {
      var key = fnl.getAttribute("data-key");
      var value = fnl.innerHTML;
      if ( ! value )
        value = key;
      var citeplace = fnl.getAttribute("data-place") || "right";
      var citationhtml = "<span href='" + key + "'>"
            + value.replace(" ", "&nbsp;") + "</span>";
      if (citeplace == "left") {
          leftfootnotestrings.push(citationhtml);
      } else {
          rightfootnotestrings.push(citationhtml);
      }
    });
      footerele.innerHTML = "<div>" + "&nbsp;" + leftfootnotestrings.join(", ")
          + "</div>" + "<div>" + "&nbsp;" + rightfootnotestrings.join(", ") +
          "</div>";
  } );

  // handle slide numbering
  /**
    * Applies HTML formatting to a slide number before it's
    * written to the DOM.
    *
    * @param {number} a Current slide
    * @param {string} delimiter Character to separate slide numbers
    * @param {(number|*)} b Total slides
    * @return {string} HTML string fragment
    */
  function formatSlideNumber( a, delimiter, b ) {

      if( typeof b === 'number' && !isNaN( b ) ) {
          return '<span class="slide-number-a">'+ a +'</span>' +
              '<span class="slide-number-delimiter">'+ delimiter +'</span>' +
              '<span class="slide-number-b">'+ b +'</span>';
      }
      else {
          return '<span class="slide-number-a">'+ a +'</span>';
      }

  }

  Reveal.addEventListener( 'slidechanged', function (event) {
      // event.previousSlide, event.currentSlide, event.indexh, event.indexv
      if (event.currentSlide.id != "title-slide") {
        var onSlideNumberElement = document.getElementById( 'slide-number-container' );
        onSlideNumberElement.classList.add('on-slide-number');
        onSlideNumberElement.innerHTML = formatSlideNumber(
            event.indexh + 1, '/', Reveal.getTotalSlides() );
      }
  });

  // Handle svg capturing the keypress and mouse press events
  var bubbleSVGEvent = function (obj) {
      var events = ["mouseup", "click", "mousedown", "keypress", "keydown", "keyup"];
        events.forEach(function (eventname) {
            safeContentDocument(obj).documentElement.addEventListener(
                eventname, function (e) {
                    var new_event = new e.constructor(e.type, e);
                    obj.dispatchEvent(new_event);
                });
        });
  };
  (// bubbleSVGEvent for all object tags
      function () {
          Array.from(document.getElementsByTagName("object")).forEach(function (obj) {
              obj.addEventListener("load", function (loadevent) {
                  bubbleSVGEvent(obj);
              });
          });
      }()
  );

  (// Handle citations to add to bibliography in the end
    function () {
      var added = {};
      Array.from(document.getElementsByTagName("cite")).forEach(
        function (fnl) {
          var key = fnl.getAttribute("data-key");
          if ( ! (key in added) ) {
            var citation = document.getElementById(key);
            if (citation) {
              document.getElementById("bibliography").innerHTML += 
                "<li>" + key
                + " &nbsp;&nbsp;:&nbsp;&nbsp; " + citation.innerHTML
                + "</li>";
              added[key] = 1;
            } else {
              console.error("Citation not found for " + key);
            }
          }
        });
    }());

    var nullsplit = function (str, sep) {
        if (str) {
            return str.split(sep);
        } else {
            return [];
        }
    };

    Index.mapDummyFragments = function (parentid, svgid) {
        var dummyfragments = document.getElementById(parentid).children;
        Array.from(dummyfragments).forEach(function (frag) {
            var svgeleinids = nullsplit(frag.getAttribute("svg-ele-in-ids"), " ");
            var svgeleoutids = nullsplit(frag.getAttribute("svg-ele-out-ids"), " ");
            var alleleids = svgeleinids.concat(svgeleoutids);
            var fragid = frag.id || parentid.concat("-", alleleids.join("-"));
            frag.id = fragid;
            var style_in = frag.getAttribute("style-in") || "display:inherit";
            var style_out = frag.getAttribute("style-out") || "display:none";
            var svg = safeContentDocument(safeGetElemementById(document, svgid));
            Reveal.addFragmentListner(
                frag.id,
                function (f) {
                    svgeleinids.forEach(function (eleid) {
                        var svgele = safeGetElemementById(svg, eleid);
                        svgele.style = style_in;
                    });
                    svgeleoutids.forEach(function (eleid) {
                        var svgele = safeGetElemementById(svg, eleid);
                        svgele.style = style_out;
                    });
                },
                function (f) {
                    svgeleinids.forEach(function (eleid) {
                        var svgele = safeGetElemementById(svg, eleid);
                        svgele.style = style_out;
                    });
                    svgeleoutids.forEach(function (eleid) {
                        var svgele = safeGetElemementById(svg, eleid);
                        svgele.style = style_in;
                    });
                }
            );
        });
    };

  // Map dummy-to-svg-map
    root.addEventListener("load", function () {
        var dummies = document.querySelectorAll(".dummy-to-svg-map");
        Array.from(dummies).forEach(function (dummy) {
            var mappedsvg = dummy.getAttribute("mapped-svg")
                || console.error("needs mapped-svg");
            // console.log("mapping dummy ", dummy.id, " to svg ", mappedsvg);
            Index.mapDummyFragments(dummy.id, mappedsvg);
        });
    });

  // Handle title repetition
  Array.from(document.getElementsByClassName("presentationtitle")).forEach(
    function (pttl) {
    pttl.innerHTML = document.presentationtitle;
  });

  // Handle author repetition
  Array.from(document.getElementsByClassName("presentationauthor")).forEach(
    function (pa) {
    pa.innerHTML = document.presentationauthor;
  });

  Array.from(document.getElementsByClassName("copy-of")).forEach(
    function (copy) {
      if (copy.hasAttribute("data-copy-of")) {
        var copy_of = document.getElementById(copy.getAttribute("data-copy-of"));
        Array.from(copy_of.childNodes).forEach(function (child) {
            copy.appendChild(child.cloneNode(true));
        });
      }
    });

  // remove hidden slides from the slide deck
  (function () {
    var slidedeck = document.querySelectorAll(".reveal .slides")[0];
    Array.from(slidedeck.getElementsByClassName("hideslide")).forEach(
      function (slide) {
        console.log("Removed slide " + slide.id);
        slidedeck.removeChild(slide);
      });
  });

  // If you change the order of slides dynamically, we need to sync the slides with Reveal
  return Index;
}));
