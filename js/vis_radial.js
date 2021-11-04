// Data
let departments;
let nodes;

class visRadial {

    constructor(parentElement, dataPeople, dataCenters) {
        this.parentElement = parentElement;
        this.dataPeople = dataPeople;
        this.dataCenters = dataCenters;
        this.departments;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 20, bottom: 20, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        console.log(vis.width, vis.height)
        // vis.width2 = 450
        // vis.height2 = 450
        // vis.margin2 = 40



        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", 2000)
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`);

// append the svg object to the div called 'my_dataviz'
//         vis.svg2 =  d3.select("#" + vis.parentElement).append("svg")
//             .attr("width", vis.width)
//             .attr("height", vis.height)
//             .append("g")
//             .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

// Create dummy data

        // vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //     .attr("width", vis.width+vis.margin.left+vis.margin.right)
        //     .attr("height", 2000)
        //     .append('g')
        //     .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // vis.svg.append("rect")
        //     .attr("width", vis.width)
        //     .attr("height", 2000)
        //     .style("fill", "white")
        //     .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`);
            // .on("click", function () {
            //     vis.repress(false);
            // });

        // document.addEventListener('scroll', function() {
        //     vis.updateVis()
        // });

        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;

        vis.Nodes = [];
        vis.Links = [];

        vis.filteredData = [];
        vis.listFaculty = [];
        vis.listAreas = [];
        vis.listCenters = [];
        vis.AreasDict=[]

        vis.dataPeople.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');
            let researchInterests = faculty['Research Interests'].split('|');

            // console.log(faculty)
            teachingAreas.forEach((d,i)=>{
                vis.AreasDict.push({"name":title, "area": d})
            })

            if(teachingAreas.length === 1 && teachingAreas[0] === ""){return;}
            if(researchInterests.length === 1 && researchInterests[0] === ""){return;}

            vis.filteredData.push(faculty);
            vis.listFaculty.push(title);
        });

        console.log(vis.AreasDict)

        vis.teachingAreasRolled=d3.rollups(vis.AreasDict, v=>v.length, d=>d.area)
        vis.areaDonutData=Object.assign({}, ...vis.teachingAreasRolled.map((x) => ({[x[0]]: x[1]})))


        vis.filteredData.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');

            vis.Nodes.push({
                "lvl": 1,
                "name": title
            })

            teachingAreas.forEach(function(area){
                if(!vis.listAreas.includes(area)){
                    vis.listAreas.push(area);
                    vis.Nodes.push({
                        "lvl": 0,
                        "name": area
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": area,
                    "lvl": 0
                })
            })
        });

        vis.dataCenters.forEach(function(row, index){
            let title = row['Title'];
            let center = row['Center'];

            if(!vis.listFaculty.includes(title)){return;}

            if(!vis.listCenters.includes(center)) {
                vis.listCenters.push(center);

                vis.Nodes.push({
                    "lvl": 2,
                    "name": center
                })
            }

            vis.Links.push({
                "source": title,
                "target": center,
                "lvl": 1
            })
        });

        // console.log(vis.listCenters)
        vis.centerDonutData=Object.assign({}, ...vis.listCenters.map((x) => ({[x]: 1})))

        // console.log(vis.centerDonutData)
        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl && a.lvl !== 2){
                return a.name.localeCompare(b.name);
            }
            return a.lvl - b.lvl;
        });

        // console.log("areas", vis.listAreas)

        vis.listAreas.sort(function(a,b){ return a.localeCompare(b) });
        vis.listFaculty.sort(function(a,b){ return a.localeCompare(b) });

        // console.log(vis.Nodes)

        vis.colors = ["#ed1b34", "#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca"]
        vis.colors2 = ["#808080", "#696969"]
        vis.colorAreas = d3.scaleOrdinal().domain(vis.listAreas).range(vis.colors)
        vis.colorCenters = d3.scaleOrdinal().domain(vis.listCenters).range(vis.colors2)

        vis.areaCount = vis.listAreas.length;
        vis.facultyCount = vis.listFaculty.length;
        vis.centerCount = vis.listCenters.length;

        // console.log(vis.centerCount)

        vis.Nodes.forEach(function (d, i) {
            d.id = "n" + i;
        });
        vis.Links.forEach(function (d) {
            d.source = vis.Nodes.filter(obj => {return obj.name === d.source})[0];
            d.target = vis.Nodes.filter(obj => {return obj.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.prepareCenterDonuts()
        vis.prepareAreaDonuts()

    }

    prepareCenterDonuts() {
        let vis = this;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        vis.radiusAreas = Math.min(vis.width, vis.height) / 6 - vis.margin.left
        vis.radiusCenters = (Math.min(vis.width, vis.height) - vis.margin.top - vis.margin.bottom) / 2
        vis.radiusFaculty = Math.min(vis.width, vis.height) / 4 - vis.margin.left

        vis.anglesCenter = 2 * Math.PI / vis.listCenters.length; //radians NOT Degrees
        vis.radiusCenterCircles = vis.radiusCenters * Math.sin(vis.anglesCenter / 2)
        // console.log(vis.anglesCenter, vis.radiusCenters, vis.radiusCenterCircles)

        var data = {a: 20, b: 20, c: 20, d: 20, e: 20}

// Compute the position of each group on the department donut:
        vis.pie = d3.pie()
            .value(function (d) {
                // console.log(d);
                return d[1];
            })
        vis.centerDonutDataReady = vis.pie(Object.entries(vis.centerDonutData))

        vis.svg
            .selectAll('.path')
            .data(vis.centerDonutDataReady)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(vis.radiusCenters * 8.65 / 10)         // This is the size of the donut hole
                .outerRadius(vis.radiusCenters)
                .cornerRadius(50)
                .padAngle(0.01)
            )
            .attr('fill', function (d) {
                return (vis.colorCenters(d.data[0]))
            })
        // .attr("stroke", "black")
        // .style("stroke-width", "2px")
        // .style("opacity", 0.7)
        // .append("svg:title")
        // .text(d => d.data[0])

    }

    prepareAreaDonuts(){
        let vis = this;

        vis.radiusAreas = Math.min(vis.width, vis.height) / 6 - vis.margin.left
        vis.anglesCenter = 2 * Math.PI / vis.listCenters.length; //radians NOT Degrees

        vis.pie = d3.pie()
            .value(function (d) {
                // console.log(d);
                return d[1];
            })
        vis.areaDonutDataReady = vis.pie(Object.entries(vis.areaDonutData))

// Build the department donut chart: Basically, each part of the pie is a path that we build using the arc function.
        vis.svg
            .selectAll('.path')
            .data(vis.areaDonutDataReady)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(vis.radiusAreas * 4 / 5)         // This is the size of the donut hole
                .outerRadius(vis.radiusAreas)
                .cornerRadius(2)
                .padAngle(0.03)
            )
            .attr('fill', function (d) {
                return (vis.colorAreas(d.data[0]))
            })
            // .attr("stroke", "black")
            // .style("stroke-width", "2px")
            // .style("opacity", 0.7)
            // .append("svg:title")
            // .text(d => d.data[0])

    }
}