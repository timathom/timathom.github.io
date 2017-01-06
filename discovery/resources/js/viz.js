function queueD3js(path1, path2) {
    queue().defer(d3.csv, path1).defer(d3.csv, path2).await(function (error, file1, file2) {
        createForceLayout(file1, file2);
    });
}

function createForceLayout(nodes, edges) {
    
    var nodeHash = {
    };
    for (x in nodes) {
        nodeHash[nodes[x].id] = nodes[x];
    }
    for (x in edges) {
        edges[x].weight = parseInt(edges[x].weight);
        edges[x].source = nodeHash[edges[x].source];
        edges[x].target = nodeHash[edges[x].target];
    }
    
    var width = 460,
    height = 300;
    
    var fill = d3.scale.category20();
    
    var linkScale = d3.scale.linear().domain(d3.extent(edges, function (d) {
        return d.weight
    })).range([2, 12]);
    
    var force = d3.layout.force().gravity(1).linkDistance(80).linkStrength(function (d) {
        return linkScale(d.weight)
    }).charge(-600).size([width, height]);
    
    force.nodes(nodes).links(edges).start();
    
    var link = d3.select("#viz").selectAll(".link").data(edges).enter().append("line").attr("class", "link").style("stroke", "gray").style("opacity", .8).style("stroke-width", function (d) {
        return linkScale(d.weight)
    });
    
    var node = d3.select("#viz").selectAll(".node").data(nodes).enter().append("g").attr("class", "node").call(force.drag()).on("click", fixNode);
    
    function fixNode(d) {
        d3.select(this).select("circle").style("stroke-width", 4);
        d.fixed = true;
    }
    
    var nodeScale = d3.scale.linear().domain(d3.extent(nodes, function (d) {
        return d.weight
    })).range([5, 25]);
    
    var fontScale = d3.scale.linear().domain(d3.extent(nodes, function (d) {
        return d.weight
    })).range([14, 24]);
    
    node.append("circle").attr("r", (function (d) {
        return nodeScale(d.weight)
    })).style("fill", function (d) {
        return fill(d.group);
    }).style("stroke", "white").style("opacity", .8).style("stroke-width", "2px");
    
    node.append("text").text(function (d) {
        return d.weight >= 1 ? d.name: null
    }).style("font-size", 14).style("font-weight", 500).style("fill", "black").attr("dy", ".5em").attr("dx", ".5em");
    
    node.append("title").text(function (d) {
        return d.name
    });
    
    force.on("tick", function () {
        var radius = 6;
        link.attr("x1", function (d) {
            return d.source.x;
        }).attr("y1", function (d) {
            return d.source.y;
        }).attr("x2", function (d) {
            return d.target.x;
        }).attr("y2", function (d) {
            return d.target.y;
        });
        
        node.attr("transform", function (d) {
            return "translate(" + Math.max(radius, Math.min(width - radius, d.x)) + "," + Math.max(radius, Math.min(height - radius, d.y)) + ")";
        });
        //node.each(collide(0.5));
    });
    
    // From: http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
    var padding = 1;
    // separation between circles
    radius = 8;
    function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            var rb = 2 * radius + padding,
            nx1 = d.x - rb,
            nx2 = d.x + rb,
            ny1 = d.y - rb,
            ny2 = d.y + rb;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y);
                    if (l < rb) {
                        l = (l - rb) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }
}