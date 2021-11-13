// Data
let departments;
let nodes;
let hover;

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
        vis.radiusAreas = (Math.min(vis.width, vis.height)  - vis.margin.top)/ 6
        vis.radiusCenters = (Math.min(vis.width, vis.height) - vis.margin.top - vis.margin.bottom) / 3
        vis.radiusFaculty = (Math.min(vis.width, vis.height)  - vis.margin.top - vis.margin.bottom)/ 4.5
        vis.arcInnerRadius = vis.radiusAreas*4/5

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", vis.height)
            .attr("class", "whiteboard")
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height/2})`)
            .style("position", "absolute")
            .style("top", '0px')
            .style("left", '0px');

        vis.centerDiv = d3.select("svg")
            .append('g')
            // .attr("height", 500)
            // .attr("width", 500)
            .attr("class", "mainTitle")
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
                "name": title,
                "teachingArea":teachingAreas[0]
            })

            teachingAreas.forEach(function(area){
                if(!vis.listAreas.includes(area)){
                    vis.listAreas.push(area);
                    vis.Nodes.push({
                        "lvl": 0,
                        "name": area,
                        "teachingArea":null
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": area,
                    "lvl": 0
                })
            })
        });

        vis.Nodes.forEach(function(d){
            console.log(d)
            if (d.name==='Pavlos Protopapas') {
                console.log(d)
                d.teachingArea = 'Applied Computation'
            }}


        )


        vis.dataCenters.forEach(function(row, index){
            let title = row['Title'];
            let center = row['Center'];

            if(!vis.listFaculty.includes(title)){return;}

            if(!vis.listCenters.includes(center)) {
                vis.listCenters.push(center);

                vis.Nodes.push({
                    "lvl": 2,
                    "name": center,
                    "teachingArea":null
                })
            }

            vis.Links.push({
                "source": title,
                "target": center,
                "lvl": 1
            })
        });

        vis.sortedFaculty=vis.Nodes.filter(d=>d.lvl===1).slice().sort((a, b) => {
            // console.log(a,b);
            return d3.ascending(a.teachingArea, b.teachingArea)
        })

        vis.sortedAreas=vis.Nodes.filter(d=>d.lvl===0).slice().sort((a, b) => {
            // console.log(a,b);
            return d3.ascending(a.name, b.name)
        })
        vis.sortedCenters=vis.Nodes.filter(d=>d.lvl===2).slice().sort((a, b) => {
            // console.log(a,b);
            return d3.ascending(a.name, b.name)
        })

        vis.Nodes2=[...vis.sortedAreas,...vis.sortedFaculty, ...vis.sortedCenters]
        // vis.Nodes2=[...vis.sortedFaculty]
        // vis.Nodes2=[...vis.sortedCenters]
        // console.log(vis.Nodes2)

        // z: For the donut diagram, roll the teaching data to get a list of faculty per each area
        vis.teachingAreasRolled=d3.rollups(vis.AreasDict, v=>v.length, d=>d.area)
        vis.areaDonutData=Object.assign({}, ...vis.teachingAreasRolled.map((x) => ({[x[0]]: x[1]})))
        // give each faculty and center a value of one.
        // vis.centerDonutData=Object.assign({}, ...vis.listCenters.map((x) => ({[x]: 1})))

        // sorts faculty?


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




        vis.Nodes2.forEach(function (d, i) {
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
                d.nodeRadius = 1;
                d.circleRadius = vis.radiusAreas;
            }

        });



        vis.Links.forEach(function (d,i) {
            d.source = vis.Nodes.filter(obj => {return obj.name === d.source})[0];
            d.target = vis.Nodes.filter(obj => {return obj.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;


        });

        //
        vis.setTitle(hover=false);
        vis.prepareNodes()
        vis.drawAreaDonut()

    }

    prepareNodes() {
        let vis = this;

        /////// NODES
        // console.log(vis.Nodes2)

        vis.pie = d3.pie()
            .value(function (d) {
                return d[1].value;
            })
            // .endAngle(Math.PI/2 )
            // .sort((a,b)=>{
            //     // return d3.descending(a,b)
            //     return (a[1].lvl ===1 && b[1].lvl===1)? d3.descending(a[1].teachingArea,b[1].teachingArea) : null
            // })

        vis.radialNodeData = vis.pie(Object.entries(vis.Nodes2))

        console.log(vis.radialNodeData)
        // vis.radialNodeData.forEach((d)=>{
        //     console.log(d.data[1].name,d.data[1].teachingArea)
        // })
        vis.anglesCenter = 2 * Math.PI / vis.listCenters.length; //radians NOT Degrees

        vis.pie2 = d3.pie()
            .value(function (d) {
                // console.log(d);
                return d[1];
            }).sort((a,b)=>{return d3.descending(a,b)})
        vis.areaDonutDataReady = vis.pie2(Object.entries(vis.areaDonutData))

        console.log(vis.areaDonutDataReady)

        vis.areaDonutAngles=[]

        vis.areaDonutDataReady.forEach((d,i)=>{
            // console.log(d)
            vis.areaDonutAngles[d.data[0]]={ "startAngle": d.startAngle, "endAngle": d.endAngle}
        })



        vis.facultyAngleScale = d3.scaleLinear()
            .range([-2*Math.PI/5+.07, -12*Math.PI/5+.07])
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
                d.coords = vis.toCartesian(vis.radiusAreas*1.02,d.theta)
            } else if (d.data[1].lvl === 1) {
                d.theta = vis.facultyAngleScale(i)
                d.centerAngle = d.startAngle + ((d.endAngle - d.startAngle) / 2)
                d.coords = vis.toCartesian(vis.radiusFaculty*1.2,d.theta)
            } else if (d.data[1].lvl ===2) {
                d.theta = vis.centerAngleScale(i)
                d.centerAngle = d.startAngle + ((d.endAngle - d.startAngle) / 2)
                d.coords = vis.toCartesian(vis.radiusCenters*1.1, d.theta)
            } else {
                console.log("error")
            }
        })

        vis.drawNodes()




    }

    drawNodes(){

        let vis = this;

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
            .attr("translate", function(d){if (d.lvl===1){return "rotate (6.18577158148688)"}})
            .attr("stroke-width", function(d){
                if(d.data[1].lvl === 0){ return "px"; }
                else if(d.data[1].lvl === 2){ return "0px"; }
                else{ return "0px"; }
            })
            .attr("fill", function(d){
                if(d.data[1].lvl === 0){ return "black"; }
                else if(d.data[1].lvl === 2){ return "#93a1ad"; }
                else{ return vis.colorAreas(d.data[1].teachingArea) }
            })
            .on("mouseover", function(event,d){
                // vis.showModal(d)
                vis.setTitle(true,d)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', function(d){
                        if (d.data[1].lvl === 2){ return "#A51C30"; }
                        else if (d.data[1].lvl === 1) { return "black"; }
                    })

            })
            .on("mouseout", function(event,d){
                d3.select(this)
                    .attr('stroke-width', '0px')
            })
            // .on("click", function(event,d){vis.showModal(d)})

        nodes.merge(nodesEnter)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })

        // vis.addCenterLabels()


        /////// LINKS

        // vis.diagonal = function link(d) {
        //     // console.log("diagonal",d)
        //     return "M" + d.source.y + "," + d.source.x
        //         + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
        //         + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
        //         + " " + d.target.y + "," + d.target.x;
        // };
        //
        // let links = vis.svg
        //     .selectAll(".link")
        //     .data(vis.Links, d=>d.id)
        //
        // links.exit().remove();
        //
        // let linksEnter = links.enter()
        //     .append("path", "g")
        //     .attr("class", "link")
        //     .attr("id", li => li.id)
        //     .attr("stroke", function(li){
        //         // console.log(li)
        //         if(li.target.lvl === 0){ return vis.colorAreas(li.target.name); }
        //         else{ return vis.colorCenters(li.target.name); }
        //     });
        //
        // links.merge(linksEnter)
        //     .attr("d", function(link,i){
        //         vis.calculateCurve(link,i)
        //
        //
        //
        //     })
    }

    // addCenterLabels(){
    //     let vis = this;
    //
    //     vis.labels = vis.svg
    //         .selectAll('.centerCircleLabels')
    //         .attr("class", "centerCircleLabels")
    //         .attr("font-family", "sans-serif")
    //         .attr("font-size", 12)
    //         .attr("fill", "white")
    //         .attr("stroke-width", 0.3)
    //         .attr("stroke", "black")
    //         .data(vis.radialNodeData)
    //
    //
    //
    // }

    drawAreaDonut(){
        let vis = this;


        vis.areaArcs =  vis.svg
            .selectAll('whatever')
            .data(vis.areaDonutDataReady)

// Build the department donut chart: Basically, each part of the pie is a path that we build using the arc function.

        vis.areaArcs
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(vis.arcInnerRadius)         // This is the size of the donut hole
                .outerRadius(vis.radiusAreas)
                .cornerRadius(2)
                .padAngle(0.03)
            )
            .attr('fill', function (d) {
                return (vis.colorAreas(d.data[0]))
            })
            .attr("stroke", "black")
            .attr("stroke-width", "0px")
            .style("opacity",1)
            .on("mouseover", function(event,d){
                // vis.showModal(d)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', "black")
            })
            .on("mouseout", function(event,d){
                d3.select(this)
                    .attr('stroke-width', '0px')
            })
            .append("svg:title")
            .text(d => d.data[0])


        vis.areaArcs.exit().remove();

    }

    setTitle(hover,d){
        let vis = this;



        // vis.centerDiv
        //     .append("text")
        //     .text("SEAS FACULTY")
        //     .attr("class", "main")
        //     .attr("position", "top")



        // vis.centerDiv
        //     .append("text")
        //     .text("SEAS FACULTY")
        //     .attr("color", "black")
        //     .attr("font-size", "2em")
        //     .attr("z-index", 100000)
        //     .attr("dy", "-2em")
        //     .attr("text-anchor", "middle")
        //
        // vis.centerDiv
        //     .append("text")
        //     .text("are involved in")
        //     .attr("color", "black")
        //     .attr("font-size", "1.5em")
        //     .attr("z-index", 100000)
        //     .attr("dy", "-1em")
        //     .attr("text-anchor", "middle")

        vis.centerDiv.selectAll(".defaultText").remove()
        vis.centerDiv.selectAll(".hoverText").remove()

        if (hover){

            vis.centerDiv
                .append("text")
                .text(d.startAngle)
                .attr("color", "black")
                .attr("font-size", "2em")
                .attr("z-index", 100000)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .attr("class", "hoverText")
            vis.centerDiv
                .append("text")
                .text(d.endAngle)
                .attr("color", "black")
                .attr("font-size", "2em")
                .attr("z-index", 100000)
                .attr("dy", "2em")
                .attr("text-anchor", "middle")
                .attr("class", "hoverText")

        } else {



            vis.centerDiv
                .append("text")
                .text(vis.centerCount + " CENTERS  ")
                .attr("color", "black")
                .attr("font-size", "2em")
                .attr("z-index", 100000)
                .attr("dy", "1em")
                .attr("text-anchor", "middle")
                .attr("class", "defaultText")


            vis.centerDiv
                .append("text")
                .text(" & ")
                .attr("color", "black")
                .attr("font-size", "1em")
                .attr("z-index", 100000)
                .attr("dy", "3.5em")
                .attr("text-anchor", "middle")
                .attr("class", "defaultText")

            vis.centerDiv
                .append("text")
                .text(vis.areaCount + " DEPARTMENTS")
                .attr("color", "black")
                .attr("font-size", "2em")
                .attr("z-index", 100000)
                .attr("dy", "3em")
                .attr("text-anchor", "middle")
                .attr("class", "defaultText")
        }


    }

    toCartesian(radial, theta) {
        var x = radial * Math.cos(theta);
        var y = radial * Math.sin(theta);
        // console.log(radial, theta, x, y)
        return [x,y];
    }

    calculateCurve(link,i){
        // console.log(link)
    }


}