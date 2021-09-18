class NetworkGraph {
    constructor(parentElement, data, allInfoMap) {
        this.parentElement = parentElement;
        this.data = data;
        this.allInfoMap = allInfoMap;
        this.initVis();
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 100, left: 10};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Most code adapted from
        // https://www.d3-graph-gallery.com/graph/network_basic.html

        vis.simulation = d3.forceSimulation(vis.data.nodes)                 // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function(d) { return d.id; })                     // This provide  the id of a node
                .links(vis.data.links)                                    // and this the list of links
            )
            .force("forceX", d3.forceX().strength(.4).x(vis.width/2))
            .force("forceY", d3.forceY().strength(.4).y(vis.height/2))
            .force("charge", d3.forceManyBodyReuse().strength(-300))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))     // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // Initialize the links
        vis.link = vis.svg
            .selectAll(".network-line")
            .data(vis.data.links)
            .enter()
            .append("line")
            .attr("class", "network-line")
            .style("stroke", d=>
            {if(d.type == "news") {return "#1b9e77"}
            else if(d.type=="research") {return "#d95f02"}
            else if(d.type=="center") {return "#7570b3"}
            else if(d.type=="school") {return "#e7298a"}
            else {return "#4e88c7"};
            })
            .attr("stroke-width", 2);

        // Initialize nodes
        vis.node = vis.svg
            .selectAll(".network-node")
            .data(vis.data.nodes)
            .enter()
            .append("circle")
            .attr("class", "network-node")
            .attr("id", d => "node"+d.id)
            .attr("r", 5)
            .attr("fill", "#121212")
            .on("click", connectedNodes)
            .on('mouseover', function(event, d){
                // highlight this circle
                d3.select(this)
                    .attr('r', 7);

                // update tooltip
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", (d3.select(this).attr("cx")-100) + "px")
                    .style("top",  (d3.select(this).attr("cy")-60) + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 2px">
                        
                        <h6 style="text-align: center;font-size:20px;">${d.name}</h6>
                        <p>
                         <b>Click on me to see my picture!</b>
                         <br>
                        <b>Teaching Area:</b> ${vis.allInfoMap[d.name]["Teaching Areas"]} 
                        <br>
                        <b>Office Location:</b> ${vis.allInfoMap[d.name]["Office"]}
                        <br>
                        <b>Email:</b> ${vis.allInfoMap[d.name]["Email"]}
                        <br>
                        <b>Phone:</b> ${vis.allInfoMap[d.name]["Phone"]}
                        </p>
                     </div>`);

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('r', 5);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);

            });

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'networkTooltip')
            .attr("opacity", 0.0);

        function ticked() {
            vis.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            vis.node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

        }

        //Toggle stores whether the highlighting is on
        //Create an array logging what is connected to what
        var linkedByIndex = {};
        var i;
        for (i = 0; i < vis.data.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        };
        vis.data.links.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });
        //This function looks up whether a pair are neighbours
        function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }
        function connectedNodes() {
            let d = d3.select(this).node().__data__;
            vis.node.attr("fill", "#121212");
            d3.select(this).attr("fill","#C4C4C4").attr("stroke", "black");
                //Reduce the opacity of all but the neighbouring nodes
                vis.node.style("opacity", function (o) {
                    return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
                });
                vis.link.style("opacity", function (o) {
                    return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
                });
            networkTableSelector(d);
            myNetworkBarVis.wrangleData();
        }

        function networkTableSelector(d) {
            $("#network-selector").val(d.id);
            selectedFacultyNetworkViz = $("#network-selector").val();
            $(".table").empty();
            if (selectedFacultyNetworkViz>0) {
                $("#network-table").append('<table style="width:auto"> <tr> <td>Title</td> <td id="network-title" class="table" ></td> </tr>'+
                    '<tr> <td>Research Interests</td><td id="network-research-interests" class="table" ></td> </tr>'+
                    '<tr><td>Teaching Areas</td> <td id="network-teaching-areas" class="table" ></td> </tr>'+
                    '<tr><td>Location</td><td id="network-location" class="table" ></td></tr> </table>');
                $("#network-title").text(d.primaryTitle);
                $("#network-research-interests").text(d.researchInterests);
                $("#network-teaching-areas").text(d.teachingArea);
                $("#network-location").text(d.location)
                $('#network-pic').prepend('<a href="http://seasdrupalstg.prod.acquia-sites.com/node/'
                    +selectedFacultyNetworkViz.toString()+'" target="_blank">'+
                    '<img id="faculty-image" src='+d.image +' title="Click to go to my card" width=200 height=300/>' +
                    '</a>')
            }
        }

    }
    updateVis() {
        let vis = this;

        myNetworkBarVis.wrangleData();

        // from http://coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/

        if(selectedFacultyNetworkViz==0) {
            vis.node.attr("fill", "#121212");
            vis.node.style("opacity", 1);
            vis.link.style("opacity", 1);
        }
        else {
            //Create an array logging what is connected to what
            var linkedByIndex = {};
            var i;
            for (i = 0; i < vis.data.nodes.length; i++) {
                linkedByIndex[i + "," + i] = 1;
            };
            vis.data.links.forEach(function (d) {
                linkedByIndex[d.source.index + "," + d.target.index] = 1;
            });
            //This function looks up whether a pair are neighbours
            function neighboring(a, b) {
                return linkedByIndex[a.index + "," + b.index];
            }

            //Reduce the opacity of all but the neighbouring nodes
            let d = d3.select("#node"+selectedFacultyNetworkViz).node().__data__;
            vis.node.attr("fill", "#121212");
            d3.select("#node"+selectedFacultyNetworkViz).attr("fill","#C4C4C4").attr("stroke", "#121212");
            vis.node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            });

            vis.link.style("opacity", function (o) {
                return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
            });
        }

    }

    barMouseOver(type) {
        let vis = this;
        if(selectedFacultyNetworkViz>0) {
            let d = d3.select("#node"+selectedFacultyNetworkViz).node().__data__;
            vis.link.style("opacity", function (o) {
                return (d.index==o.source.index | d.index==o.target.index) && o.type==type.toLowerCase() ? 1 : 0.1;
            });
        }
        else {
            vis.link.style("opacity", function(o) {
                return o.type == type.toLowerCase() ? 1: 0.1;
            })
        }
    }

  }