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

        vis.center=[vis.width/2, vis.height/2];

        // the radius of the node circles
        vis.radiusAreas = (Math.min(vis.width, vis.height)  - vis.margin.top)/ 4.5
        vis.radiusCenters = (Math.min(vis.width, vis.height) - vis.margin.top - vis.margin.bottom) / 2.5
        vis.radiusFaculty = (Math.min(vis.width, vis.height)  - vis.margin.top - vis.margin.bottom)/ 4


        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", 2000)
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`);

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

            teachingAreas.forEach((d,i)=>{
                vis.AreasDict.push({"name":title, "area": d})
            })

            if(teachingAreas.length === 1 && teachingAreas[0] === ""){return;}
            if(researchInterests.length === 1 && researchInterests[0] === ""){return;}

            vis.filteredData.push(faculty);
            vis.listFaculty.push(title);
        });



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

        // vis.Links[0].source="Amir Yacoby"
        // vis.Links[0].target = "Applied Physics"

        // z: For the donut diagram, roll the teaching data to get a list of faculty per each area
        vis.teachingAreasRolled=d3.rollups(vis.AreasDict, v=>v.length, d=>d.area)
        vis.areaDonutData=Object.assign({}, ...vis.teachingAreasRolled.map((x) => ({[x[0]]: x[1]})))
        // give each faculty and center a value of one.
        // vis.centerDonutData=Object.assign({}, ...vis.listCenters.map((x) => ({[x]: 1})))

        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl && a.lvl !== 2){
                return a.name.localeCompare(b.name);
            }
            return a.lvl - b.lvl;
        });

        vis.listAreas.sort(function(a,b){ return a.localeCompare(b) });
        vis.listFaculty.sort(function(a,b){ return a.localeCompare(b) });

        // write the color scales
        vis.colors = ["#ed1b34", "#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca"]
        vis.colors2 = ["#808080", "#696969"]
        vis.colorAreas = d3.scaleOrdinal().domain(vis.listAreas).range(vis.colors)
        vis.colorCenters = d3.scaleOrdinal().domain(vis.listCenters).range(vis.colors2)

        // number of areas, faculty, and centers
        vis.areaCount = vis.listAreas.length;
        vis.facultyCount = vis.listFaculty.length;
        vis.centerCount = vis.listCenters.length;

        //
        vis.angleAlphaCenter =2 * Math.PI / vis.centerCount; //radians NOT Degrees
        vis.angleAlphaFaculty = 2 * Math.PI / vis.facultyCount;

        // d.lvl = 0 Areas & Departments
        // d.lvl = 1 Faculty
        // d.lvl = 2 Centers

        vis.Nodes.forEach(function (d, i) {
            d.id = "n" + i;
            if (d.lvl === 2){
                d.value = 1;
                d.nodeRadius = vis.radiusCenters * Math.sin(vis.angleAlphaCenter / 2);
                d.circleRadius = vis.radiusCenters;

            } else if( d.lvl === 1){ // level 2 = centers & level 1 = faculty
                d.value = 1;
                d.nodeRadius = vis.radiusFaculty * Math.sin( vis.angleAlphaFaculty/2);
                d.circleRadius = vis.radiusFaculty;
            } else { // level 0 = area/department
                d.value = vis.areaDonutData[d.name]
                d.nodeRadius = 3;
                d.circleRadius = vis.radiusAreas;
            }

        });

        console.log(vis.Links)

        vis.Links.forEach(function (d,i) {
            d.source = vis.Nodes.filter(obj => {return obj.name === d.source})[0];
            d.target = vis.Nodes.filter(obj => {return obj.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;


        });

        console.log(vis.Links)

        //
        vis.prepareNodes()
        vis.prepareAreaDonuts()

    }

    prepareNodes() {
        let vis = this;


        vis.pie = d3.pie()
            .value(function (d) {;
                return d[1].value;
            })
        vis.radialNodeData = vis.pie(Object.entries(vis.Nodes))

        vis.anglesCenter = 2 * Math.PI / vis.listCenters.length; //radians NOT Degrees

        vis.pie2 = d3.pie()
            .value(function (d) {
                // console.log(d);
                return d[1];
            })
        vis.areaDonutDataReady = vis.pie2(Object.entries(vis.areaDonutData))

        vis.areaDonutAngles=[]

        vis.areaDonutDataReady.forEach((d,i)=>{
            // console.log(d)
            vis.areaDonutAngles[d.data[0]]={ "startAngle": d.startAngle, "endAngle": d.endAngle}
        })

        vis.facultyAngleScale = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .domain([0, vis.facultyCount]);

        vis.centerAngleScale = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .domain([0, vis.centerCount]);


        vis.radialNodeData.forEach((d,i)=>{
            // console.log(d)
            if (d.data[1].lvl === 0) {
                // console.log(d, vis.areaDonutAngles[d.data[1].name])
                d.theta = vis.areaDonutAngles[d.data[1].name].startAngle+(vis.areaDonutAngles[d.data[1].name].endAngle-vis.areaDonutAngles[d.data[1].name].startAngle)/2-Math.PI/2
                d.centerAngle = d.startAngle + ((d.endAngle - d.startAngle) / 2)
                d.coords = vis.toCartesian(vis.radiusAreas*1.05,d.theta)
            } else if (d.data[1].lvl === 1) {
                d.theta = vis.facultyAngleScale(i)
                d.centerAngle = d.startAngle + ((d.endAngle - d.startAngle) / 2)
                d.coords = vis.toCartesian(vis.radiusFaculty*1.3,d.theta)
            } else if (d.data[1].lvl ===2) {
                d.theta = vis.centerAngleScale(i)
                d.centerAngle = d.startAngle + ((d.endAngle - d.startAngle) / 2)
                d.coords = vis.toCartesian(vis.radiusCenters*1.1, d.theta)
            } else {
                console.log("error")
            }
        })


        vis.nodeGroups = vis.svg.selectAll('.nodeGroup')
            .data(vis.radialNodeData)


        let nodes = vis.svg.selectAll(".node").data(vis.radialNodeData)
        nodes.exit().remove();



        let nodesEnter = nodes.enter().append("circle")
            .attr("class", "node")
            .attr("id", d=>d.data[1].id)
            .attr("r", d=>d.data[1].nodeRadius)
            .attr("cx", d=>d.coords[0])
            .attr("cy", d=>d.coords[1])
            .attr("fill","none")
            .attr("stroke", "black")
            .attr("stroke-width", "2px")
            .attr("fill", function(d){
                if(d.data[1].lvl === 0){ return vis.colorAreas(d.data[1].name); }
                else if(d.data[1].lvl === 2){ return "#2eecec"; }
                else{ return "#c60b0b"; }
            })
            .on("mouseover", function(event,d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'red')
               })

        nodes.merge(nodesEnter)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })

        vis.diagonal = function link(d) {
            // console.log("diagonal",d)
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        let links = vis.svg.selectAll(".link").data(vis.Links, d=>d.id)
        links.exit().remove();

        let linksEnter = links.enter().append("path", "g")
            .attr("class", "link")
            .attr("id", li => li.id)
            .attr("stroke", function(li){
                // console.log(li)
                if(li.target.lvl === 0){ return vis.colorAreas(li.target.name); }
                else{ return vis.colorCenters(li.target.name); }
            });

        // links.merge(linksEnter)
        //     .attr("d", function (li) {
        //         let oTarget;
        //         let oSource;
        //
        //         if(li.target.lvl === 0){
        //             oTarget = {
        //                 x: li.target.y + 0.5 * vis.boxHeightArea,
        //                 y: li.target.x
        //             };
        //             oSource = {
        //                 x: li.source.y + 0.5 * vis.boxHeight,
        //                 y: li.source.x
        //             };
        //
        //             if (oSource.y < oTarget.y) {
        //                 oSource.y += vis.boxWidth;
        //             } else {
        //                 oTarget.y += vis.boxWidthArea;
        //             }
        //         } else{
        //             oTarget = {
        //                 x: li.target.y + 0.5 * vis.boxHeightCenter,
        //                 y: li.target.x
        //             };
        //             oSource = {
        //                 x: li.source.y + 0.5 * vis.boxHeight,
        //                 y: li.source.x
        //             };
        //
        //             if (oSource.y < oTarget.y) {
        //                 oSource.y += vis.boxWidth;
        //             } else {
        //                 oTarget.y += vis.boxWidthCenter;
        //             }
        //         }
        //
        //         return vis.diagonal({
        //             source: oSource,
        //             target: oTarget
        //         });
            })

    }

    prepareAreaDonuts(){
        let vis = this;



// Build the department donut chart: Basically, each part of the pie is a path that we build using the arc function.
        vis.svg
            .selectAll('whatever')
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
            .style("opacity",1)
            .append("svg:title")
            .text(d => d.data[0])

    }

    toCartesian(radial, theta) {
        var x = radial * Math.cos(theta);
        var y = radial * Math.sin(theta);
        // console.log(radial, theta, x, y)
        return [x,y];
    }
}