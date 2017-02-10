function Cwb() {
	
	// Save state for calling from callbacks.
	var self = this;
	
	/******** Styling ********/
	// For smoother loading, hide forms until everything is ready
	
	this.init = function () {
		
		// Methods for getting sources and targets. The "current" versions are
		// updated to reflect deletions.
		this.getAllTargets = function () {
			return $allTargets;
		};
		
		this.getCurrentTargets = function () {
			return $currentTargets;
		};
		
		this.getAllSources = function () {
			return $allSources;
		};
		
		this.getCurrentSources = function () {
			return $currentSources;
		};
		
		/******** Initialize Packery JS ********/
		// Set Packery container and assign forms
		$container.packery({
			/*columnWidth: 80,
			rowHeight: 80
			gutter: 15*/
		});
		
		// Make forms draggable by Packery.
		$forms.draggable();
		
		// Bind draggable events to Packery.
		$container.packery("bindUIDraggableEvents", $forms);
		
		/******** Initialize jsPlumb ********/
		// jsPlumb configurations
		var sourceAnchors =[[0, 1, 0, 1],[0.25, 1, 0, 1],[0.5, 1, 0, 1],[0.75, 1, 0, 1],[1, 1, 0, 1]];
		var instance = window.instance = jsPlumb.getInstance({
			Anchors:[ "BottomCenter", "TopCenter"],
			DragOptions: {
				cursor: "pointer", zIndex: 2000
			},
			EndpointStyles:[ {
				fillStyle: "#0d78bc"
			}, {
				fillStyle: "#558822"
			}],
			// blue endpoints 7px, green endpoints 11px.
			Endpoints:[[ "Dot", {
				radius: 7
			}],[ "Dot", {
				radius: 11
			}]],
			PaintStyle: {
				gradient: {
					stops:[[0, "#0d78bc"],[1, "#558822"]]
				},
				//strokeStyle: "#558822",
				strokeStyle: "rgba(50, 50, 200, 0)",
				lineWidth: 5
			}
		});
		
		// Set jsPlumb container
		instance.setContainer(document.getElementById("form-wrapper"));
		
		// Set jsPlumb targets, make draggable
		instance.draggable($forms);
		
		// Suspend jsPlumb drawing and initialize
		instance.batch(function () {
			instance.makeTarget($allTargets, {
				dropOptions: {
					hoverClass: "hover"
				},
				allowLoopback: false
			});
			instance.makeSource($allSources, {
				maxConnections: 1
			});
		});
		
		/******** Initialize GreenTurtle ********/
		GreenTurtle.attach(document);
		
		// Handle jsPlumb events. beforeDrop intercepts the connection event before it
		// fires.
		instance.bind("beforeDrop", function (info, originalEvent) {
			var $srcDiv = $("#" + info.sourceId).closest(".resource").attr("id");
			var $tarDiv = $("#" + info.targetId).closest(".resource").attr("id");
			
			// If a source is contained in the same div as its target, then prevent the connection.
			if ($srcDiv === $tarDiv) {
				return false;
			} else {
				return true;
			}
		});
		
		// Listen for new connections and update the XF instance when they are made.
		instance.bind("connection", function (info, originalEvent) {
			
			// jsPlumb gives access to source and target DOM elements
			var src = info.source;
			var tar = info.target;
			var con = info.connection;
			var $src = $(src);
			var $tar = $(tar);
			srcID = info.sourceId;
			tarID = info.targetId;
			
			// Get the index of the resource being attached.
			var srcEl = document.getElementById(info.sourceId);
			var $x = $(document).xpath("//*[@resource = '" + $src.attr("resource") + "']");
			var $i = $x.index(srcEl);
			self.update(self.instanceDoc, src, $i, tar, "add");
			// Refresh layout.
			$container.packery();
			self.layout();
			//return srcID;
		});
		
		// Listen for detached connections and update the XF instance when they occur.
		instance.bind("connectionDetached", function (info, originalEvent) {
			var src = info.source;
			var tar = info.target;
			var $src = $(src);
			var $tar = $(tar);
			srcID = "";
			tarID = "";
			
			// Get the index of the resource being detached.
			var srcEl = document.getElementById(info.sourceId);
			if (srcEl !== null) {
				var $x = $(document).xpath("//*[@resource = '" + $src.attr("resource") + "']");
				var $i = $x.index(srcEl);
				self.update(self.instanceDoc, src, $i, tar, "detach");
			}
		});
		
		// Update connections and egister new jsPlumb sources for inline resources
		// added by xf:repeat.
		$(document).on("click", ".repeat-resource button", function () {
			
			// Update global variables with inserted elements.
			$allSources = $(".connect");
			$currentSources = $(".connect");
			$allTargets = $(".resource-form");
			var $update = $(this).parents(".xforms-repeat");
			var $inserted = $(this).parents(".xforms-repeat-item").nextAll().last().find(".connect");
			
			// Register inserted elements as sources.
			instance.makeSource($inserted, {
			});
			
			// Get index of current source.
			var $currentIndex = $allSources.index($(this).parents(".xforms-repeat-item").find(".connect"));
			
			// Refresh the connections.
			self.refresh($allSources, $allTargets, $currentIndex, "repeat");
		});
		
		// Update connections when items are removed.
		$(document).on("click", ".remove-resource button", function () {
			//$allSources = $(self.getAllTargets());
			$currentSources = $(".connect");
			$currentTargets = $(".resource-form");
			$deleted = $(this).parents(".xforms-repeat-item").find(".connect");
			
			// Get index of current source.
			var $currentIndex = $allSources.index($(this).parents(".xforms-repeat-item").find(".connect"));
			
			// Refresh the connections.
			self.refresh($(self.getAllSources()), $(self.getAllTargets()), $currentIndex, "remove");
		});
		
		// XF model and main instance
		this.model = document.getElementById("rdf-model");
		this.instanceDoc = this.model.getInstanceDocument("graph");
	};
	
	$(document).on("click", ".detach-plumb button", function () {
		var $src = $(this).parents(".detach-plumb").prevAll(".connect");
		console.log($src[0]);
		// Remove current connection.
		instance.detachAllConnections($src[0]);
	});
	
	// Repaint connections when an item is moved. Smoother with jQuery UI
	// "dragstop" event than with Packery's "dragItemPositioned."
	$(document).on("dragstop", ".resource", function () {
		self.layout();
	});
	
	// Refresh layout when a new instance of a class is added
	$(document).on("click", "#add-new, .trigger-new-resource", function () {
		$container.packery();
	});
	// Refresh layout when a new instance of a class is added
	$(document).on("click", ".rm-new-resource, .trigger-show-switch, .trigger-hide-switch", function () {
		$container.packery();
	});
	
	$(document).on("click", "#show-plumb", function () {
		// Show plumbing
		$("svg").attr("class", "show");
	});
	
	$(document).on("click", "#hide-plumb", function () {
		// Show plumbing
		$("svg").attr("class", "hide");
	});
	
	this.layout = function () {
		if (instance.getAllConnections().length > 0) {
			
			// Instead of repainting everything, try looping through connections
			// with offset info from Packery and using
			// instance.repeat(el, ui)
			var items = $container.packery("getItemElements")
			var l = $container.packery("getItemElements").length;
			
			for (var i = 0; i < l; i++) {
				var item = $container.packery("getItem", items[i]);
				if (instance.getConnections({
					source: $(item.element).find(".connect")
				}).length > 0 || instance.getConnections({
					target: $(item.element).find(".resource-form")
				}).length > 0) {
					instance.repaint(item.element, {
						left: item.position.x, top: item.position.y
					});
				}
			}
		}
	};
	
	this.update = function (context, source, index, target, action) {
		
		// jQuerify
		var $src = $(source);
		var $tar = $(target);
		var $srcDiv = $src.closest(".resource").attr("id");
		var $tarDiv = $tar.closest(".resource").attr("id");
		
		// Get RDFa attributes
		var $resource = $src.attr("resource");
		var $about = $tar.attr("about");
		
		// If a source is contained in the same div as its target, prevent the connection.
		if ($srcDiv !== $tarDiv && typeof $about !== "undefined") {
			
			//  Converting XF instance doc to jQuery object was throwing "not well-formed"
			//  error in FireFox debugger (though seemed to be working otherwise), so switched
			//  to https://github.com/ilinsky/jquery-xpath.
			var $foundSource = $(context).xpath("//*[@rdf:resource='" + $resource + "'][count(preceding-sibling::*[@rdf:resource='" + $resource + "']) + 1]", function (prefix) {
				if (prefix == "rdf")
				return "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
			});
			var $foundTarget = $(context).xpath("//*[@rdf:about='" + $about + "']", function (prefix) {
				if (prefix == "rdf")
				return "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
			});
			
			//console.log($foundSource);
			
			// Convert JQuery object back to DOM and get attribute node to update.
			if ($foundSource.length > 1) {
				var node = $foundSource[index].getAttributeNodeNS("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "resource");
				console.log(index);
			} else {
				var node = $foundSource[0].getAttributeNodeNS("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "resource");
			}
			if (action === "add") {
				//console.log($foundSource[index]);
				// Disable source once a connection has been made.
				instance.unmakeSource(source);
				
				// Hide plumbing on connection.
				//$("svg").attr("class", "hide");
				
				// Add a reciprocal label to source and target to show they have been linked.
				/*var linkedTo = '<span data-linked="' + $resource + '">Linked to > ' + $.trim($tar.children("div").text()) + '</span>';
				var linkedFrom = '<span data-linked="' + $resource + '">Linked from > ' + $.trim($src.children("span:last-child").text()) + '</span>';
				$src.append(linkedTo);
				$tar.append(linkedFrom);*/
				var value = $foundTarget[0].getAttributeNodeNS("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "about").nodeValue;
			} else if (action === "detach") {
				//console.log($foundSource[index]);
				// Reenable source once a connection has been detached.
				instance.makeSource(source);
				/*$tar.children("span").each(function () {
				if ($(this).attr("data-linked") === $src.children("span:last-child").attr("data-linked")) {
				$(this).remove();
				}
				});*/
				
				// Not sure why the @data-linked elements are not being deleted consistently
				// (had to repeat this above to get it to work).
				//$src.children("span[data-linked]").remove();
				
				// We are detaching the jsPlumb connector, so the value should be blank.
				// Create a new ID as a filler for @rdf:resource.
				// @rdf:resource always needs a unique ID for linking to work.
				value = guid();
				$foundSource = {
				};
			}
			
			// Update the XForms instance when making connections.
			
			// Update XForms instance using XSLTForms methods.
			XsltForms_globals.openAction();
			
			// Pass in node and value.
			// If a source is contained in the same div as its target, prevent it from updating the value.
			XsltForms_browser.setValue(node, value || "");
			document.getElementById(XsltForms_browser.getMeta(node.ownerDocument.documentElement, "model")).xfElement.addChange(node);
			
			// Output to debug console
			XsltForms_browser.debugConsole.write("Setvalue " + XsltForms_browser.name2string(node) + " = " + value);
			XsltForms_globals.refresh();
			XsltForms_globals.closeAction();
		}
	};
	
	this.refresh = function ($sources, $targets, $index, action) {
		var c = {
		};
		c.source =[];
		c.target =[];
		for (var i = 0; i < instance.getAllConnections().length; i++) {
			c.source.push(instance.getAllConnections()[i].source);
			c.target.push(instance.getAllConnections()[i].target);
		}
		for (var i = 0; i < c.source.length; i++) {
			var $s = $(c.source[i]);
			
			// Note: there might be a better way to do this by simply
			// updating the element IDs with jsPlumb:
			// http://www.jsplumb.org/doc/utilities.html
			instance.detachAllConnections($s[0]);
			//$s.children("span[data-linked]").remove();
			$(this).parents(".xforms-repeat-item").find(".detach-plumb").trigger("click");
		}
		
		// Brute force to remove text from last item.
		/*if ($(".connect").last().children("span[data-linked]").length > 0) {
		$(".connect").last().children("span[data-linked]").remove();
		}*/
		for (var j = 0; j < c.source.length; j++) {
			var $srcIndex = $.inArray(c.source[j], $sources);
			
			var $tarIndex = $.inArray(c.target[j], $targets);
			if (action === "repeat") {
				if ($index === $srcIndex) {
					instance.connect({
						source: $sources.eq($srcIndex)[0], target: $targets.eq($tarIndex)[0]
					});
				} else if ($index < $srcIndex) {
					instance.connect({
						source: $sources.eq($srcIndex + 1)[0], target: $targets.eq($tarIndex)[0]
					});
				} else if ($index > $srcIndex) {
					instance.connect({
						source: $sources.eq($srcIndex)[0], target: $targets.eq($tarIndex)[0]
					});
				}
			} else if (action === "remove") {
				if ($index < $srcIndex) {
					instance.connect({
						source: $sources.eq($srcIndex - 1)[0], target: $targets.eq($tarIndex)[0]
					});
				} else if ($index > $srcIndex) {
					instance.connect({
						source: $sources.eq($srcIndex)[0], target: $targets.eq($tarIndex)[0]
					});
				}
			}
		}
		
		// Register updates with GreenTurtle.
		GreenTurtle.attach(document);
		
		// Refresh layout.
		$container.packery();
	};
	
	return true;
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 * @via https://github.com/lcnetdev/bfe
 */
function guid () {
	function _p8(s) {
		var p = (Math.random().toString(16) + "000000000").substr(2, 8);
		return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4): p;
	}
	return _p8() + _p8(true) + _p8(true) + _p8();
}
function workTitle(title) {
	var i = title.indexOf(" ");
	var str = title.substring(0, i);
	switch (str) {
		case "El":
		case "La":
		case "Los":
		case "Las":
		case "Un":
		case "Una":
		case "Unos":
		case "Unas":
		case "The":
		case "A ":
		case "An":
		var l = str.length;
		var newTitle = title.substring(l + 1);
		var newTitleCap = newTitle.substring(0, 1).toUpperCase();
		title = newTitleCap.concat(newTitle.substring(1));
		return title;
		break;
		default:
		return title;
	}
}