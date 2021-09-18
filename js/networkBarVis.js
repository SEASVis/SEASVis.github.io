class NetworkBarGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }
    initVis() {

        let vis = this;

        vis.margin = {top: 10, right: 100, bottom: 10, left: 100};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.y = d3.scaleBand()
            .rangeRound([vis.height, 0])
            .paddingInner(0.1);

        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("id", "network-axis");

        vis.wrangleData();

    }
    wrangleData() {
        let vis = this;

        // from https://stackoverflow.com/questions/29364262/how-to-group-by-and-sum-array-of-object
        if (selectedFacultyNetworkViz > 0) {
            vis.displayData = [];
            vis.filteredData = vis.data.filter(filterData);
            vis.filteredData.reduce(function (res, value) {
                if (!res[value.type]) {
                    res[value.type] = {type: value.type.charAt(0).toUpperCase() + value.type.slice(1), qty: 0};
                    vis.displayData.push(res[value.type])
                }
                res[value.type].qty += addValue(value.weight);
                return res;
            }, {});

            function filterData(d) {
                return d.source.id == selectedFacultyNetworkViz || d.target.id==selectedFacultyNetworkViz;
            }
        }
        else {
            vis.displayData = [];
            vis.data.reduce(function(res, value) {
                if (!res[value.type]) {
                    res[value.type] = { type: value.type.charAt(0).toUpperCase() + value.type.slice(1), qty: 0 };
                    vis.displayData.push(res[value.type])
                }
                res[value.type].qty += addValue(value.weight);
                return res;
            }, {});

        }

        vis.displayData.sort((a,b)=> a.qty - b.qty)

        function addValue(d) {
            if (Number.isInteger(d)) {return d}
            else {return 1}
        };

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update domains
        vis.y.domain(vis.displayData.map(d=> d.type));
        vis.x.domain([0, d3.max(vis.displayData, d=> d.qty)]);

        // Data-join
        vis.bar = vis.svg.selectAll(".bar")
            .data(vis.displayData);

        // Enter (initialize the newly added elements)
        vis.bar.enter()
            .append("rect")
            .merge(vis.bar)
            .attr("class", "bar")
            .attr("height", vis.y.bandwidth())
            .attr("y", d=> vis.y(d.type))
            .on("mouseover", function(d,i) {
                myNetworkVis.barMouseOver(i.type);
                d3.select(this).attr("fill", function() {
                    if(i.type == "News") {return "#1b9e77"}
                else if(i.type=="Research") {return "#d95f02"}
                else if(i.type=="Center") {return "#7570b3"}
                else if(i.type=="School") {return "#e7298a"}
                else {return "#4e88c7"}});
                d3.select("#network-axis")
                    .selectAll('text')
                    .filter(function(x) { return x == i.type; })
                    .attr("fill", function() {
                    if(i.type == "News") {return "#1b9e77"}
                    else if(i.type=="Research") {return "#d95f02"}
                    else if(i.type=="Center") {return "#7570b3"}
                    else if(i.type=="School") {return "#e7298a"}
                    else {return "#4e88c7"}});
                d3.select("#barLabel"+i.type).style("fill", function() {
                    if(i.type == "News") {return "#1b9e77"}
                    else if(i.type=="Research") {return "#d95f02"}
                    else if(i.type=="Center") {return "#7570b3"}
                    else if(i.type=="School") {return "#e7298a"}
                    else {return "#4e88c7"}})

            })
            .on("mouseout", function() {
                d3.select(this).attr("fill", "black");
                d3.select("#network-axis")
                    .selectAll('text').attr("fill", "black");
                vis.svg.selectAll(".label").style("fill", "black");
                if (selectedFacultyNetworkViz==0) {
                    myNetworkVis.link.style("opacity", 1);
                }
                else {
                    //Reduce the opacity of all but the neighbouring nodes
                    let d = d3.select("#node"+selectedFacultyNetworkViz).node().__data__;

                    myNetworkVis.link.style("opacity", function (o) {
                        return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
                    });
                }
            })
            // // Enter and Update (set the dynamic properties of the elements)
            .transition()
            .duration(1000)
            .attr("width", d=> vis.x(d.qty));

        // Exit
        vis.bar.exit().remove();

        // (3) Draw labels
        vis.texts = vis.svg.selectAll(".label").data(vis.displayData);

        vis.texts.enter().append("text")
            .merge(vis.texts)
            .attr("class", "label")
            .attr("id", d => "barLabel"+d.type)
            .style("fill", "black")
            .attr("y", function (d) {
                return vis.y(d.type) + vis.y.bandwidth() / 2 + 4;
            })
            .transition()
            .duration(800)
            .attr("x", function (d) {
                return vis.x(d.qty)+3;
            })
            .text(function (d) {
                return d.qty.toLocaleString();
            });

        vis.texts.exit().remove();

        // Call axis function with the new domain
        vis.svg.select(".y-axis").call(vis.yAxis).call(g => g.select(".domain").remove());;

    }
}