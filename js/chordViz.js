class ChordVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 320, right: 0, bottom: 0, left: 400};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'chordTooltip')
            .attr("opacity", 0.0);

        vis.colors = ["#f0a3ff", "#0075dc", "#993f00", "#4c005c", "#191919",
                      "#005c31", "#2bce48", "#ffcc99", "#808080", "#94ffb5",
                      "#8f7c00", "#9dcc00", "#c20088", "#003380", "#ffa405",
                      "#ffa8bb", "#426600", "#ff0010", "#5ef1f2", "#00998f",
                      "#e0ff66", "#740aff", "#990000", "#ffff80", "#ff5005", ]

        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        // get unique locations from faculty data
        vis.locationArray = vis.data.nodes.map(d => d.location).filter(
            function (value, index, self) {
                return self.indexOf(value) === index;
            })

        // Create one dimensional array
        vis.chordData = new Array(vis.locationArray.length);

        // Loop to create 2D array using 1D array
        for (var i = 0; i < vis.chordData.length; i++) {
            vis.chordData[i] = new Array(vis.locationArray.length);
        }

        // initialize with 0 values
        // Loop to initialize 2D array elements.
        for (var i = 0; i < vis.chordData.length; i++) {
            for (var j = 0; j < vis.chordData.length; j++) {
                vis.chordData[i][j] = 0;
            }
        }

        vis.data.links.forEach(d => {
            let sourceLocation = d.source.location;
            let targetLocation = d.target.location;
            vis.chordData[vis.locationArray.indexOf(sourceLocation)][vis.locationArray.indexOf(targetLocation)]+=addValue(d.weight);
        })

        function addValue(d) {
            if (Number.isInteger(d)) {return d}
            else {return 1}
        };

        vis.updateVis()
    }
    updateVis() {
        let vis = this;

        vis.chord = d3.chord()
            .padAngle(0.05)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending)
            (vis.chordData)

        // add the groups on the inner part of the circle
        vis.group = vis.svg
            .datum(vis.chord)
            .append("g")
            .selectAll("g")
            .data(function(d) { return d.groups; })
            .enter()

        vis.group.append("g")
            .append("path")
            .style("fill", d => vis.colors[d.index])
            .style("stroke", "grey")
            .style("stroke-opacity", 0.7)
            .attr("d", d3.arc()
                .innerRadius(200)
                .outerRadius(210)
            )

        // Add the links between groups
        vis.svg
            .datum(vis.chord)
            .append("g")
            .selectAll("path")
            .data(function(d) { return d; })
            .enter()
            .append("path")
            .attr("class", "chord")
            .attr("d", d3.ribbon()
                .radius(200)
            )
            .style("fill-opacity", 0.7)
            .style("stroke-opacity", 0.7)
            .style("fill", "#c4c4c4")
            .style("stroke", "grey")

        vis.group.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("class", "titles")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (200+20) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d,i) { return vis.locationArray[i]; });
    }
}