/* * * * * * * * * * * * * *
*      class groupDotsVis        *
* * * * * * * * * * * * * */

// https://bl.ocks.org/ocarneiro/42286298b683c490ff74cdbf3800241e

class groupDotsVis {
    constructor(parentElement, peopleInfo, coursesInfo, latestPeopleInfo, nodeInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.coursesInfo = coursesInfo;
        this.latestPeopleInfo = latestPeopleInfo;
        this.nodeInfo = nodeInfo;

        this.initVis();
    }


    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 80, bottom: 60, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        //vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.latestAllFaculty = vis.latestPeopleInfo.map((x) => x.Title);
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title).filter((x) => vis.latestAllFaculty.includes(x));

        // I also want some big list of research areas... and teaching areas while we're at it
        let allResearchInterestsDup = vis.peopleInfo.map((x) => x["Research Interests"]).join("|").split("|");
        vis.allResearchInterests = [...new Set(allResearchInterestsDup)].filter((x) => x.length > 0);

        let allTeachingAreasDup = vis.peopleInfo.map((x) => x["Teaching Areas"]).join("|").split("|");
        vis.allTeachingAreas = [...new Set(allTeachingAreasDup)].filter((x) => x.length > 0);


        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterests': x["Research Interests"], 'teachingAreas': x["Teaching Areas"]};
        });

        vis.allInfoMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.allInfoMap[x["Title"]] = x;
        });

        vis.officeMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.officeMap[x["Title"]] = x["Office"];
        });

        vis.picMap = {};
        vis.nodeInfo.nodes.forEach((node) => {
            vis.picMap[node.name] = node.image;
        });

        vis.color = d3.scaleOrdinal(d3.schemeCategory10);
        vis.departmentColors = {
            "Applied Mathematics": "#00aaad",
            "Applied Physics": "#cbdb2a",
            "Bioengineering": "#fcb315",
            "Computer Science": "#4e88c7",
            "Electrical Engineering": "#ffde2d",
            "Environmental Science & Engineering":  "#77ced9",
            "Materials Science & Mechanical Engineering": "#bb89ca",
            "Multiple": "Pink", // this is a bit of a cheat
            "Applied Computation": "Red" // this is a bit of a cheat
        };


        vis.circleRadius = 7;
        vis.displayFaculty = vis.allFaculty;

        vis.circleDiv = vis.svg.append("g").attr("class","nodes");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'groupTooltip')
            .attr("opacity", 0.0);

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;
        vis.killAll();


        // I will want to modify this, at some point
        vis.jsonData = [40, 3, 5, 10, 2, 1];
        vis.labels = ["Survey","Field Research", "Case Study",
            "Lab Experiment", "Secondary Data",
            "Content Analysis"
        ];

        // depending on how you group them, do different label procedures
        // (in general, map some feature to a nice list of labels)
        if (selectedFacultyDotGrouping == "teachingAreas") {
            function smartTeachingAreaMap(teachingAreaString) {
                if (teachingAreaString.includes("|")) {
                    return "Multiple";
                }
                else {
                    return teachingAreaString;
                }
            }
            vis.nodeLabels = vis.displayFaculty.map((x) => smartTeachingAreaMap(vis.departmentMap[x]["teachingAreas"]));
            vis.labels = [...new Set(vis.nodeLabels)];
        } else if (selectedFacultyDotGrouping == "officeBuilding") {
            // I want to display faculty office locations, but only for places with enough faculty there

            // I will filter this list for values with at least 4 people
            let interestingOfficeLocations = ["LISE","Hoffman","Pierce","Maxwell Dworkin",
                "Geo", "Mallinckrodt", "Northwest", "MCZ", "Cruft", "Lyman"];

            let locationCount = {};
            interestingOfficeLocations.forEach((loc) => {
                locationCount[loc] = 0;
            });

            vis.displayFaculty.forEach((name) => {
                let foundIt = false;
                for(let i = 0; i < interestingOfficeLocations.length; i++) {
                    if(vis.officeMap[name].includes(interestingOfficeLocations[i])) {
                        locationCount[interestingOfficeLocations[i]] = locationCount[interestingOfficeLocations[i]] + 1;
                        i += 2 * interestingOfficeLocations.length;
                        foundIt = true;
                    }
                }
            });

            // filter locations if too few people there
            let updatedInterestingOfficeLocations = interestingOfficeLocations.filter((loc) => locationCount[loc]>3);

            let locationLabels = [];
            vis.displayFaculty.forEach((name) => {
                let foundIt = false;
                let locStr = "";
                for(let i = 0; i < updatedInterestingOfficeLocations.length; i++) {
                    if(vis.officeMap[name].includes(updatedInterestingOfficeLocations[i])) {
                        foundIt = true;
                        locStr = updatedInterestingOfficeLocations[i];
                        // break out of for loop
                        i += 2 * updatedInterestingOfficeLocations.length;
                    }
                }
                if (foundIt == false) {
                    // anything not easily classified (or if there are too few faculty there) is here
                    locStr = "Miscellaneous";
                }

                if (locStr == "Geo") {
                    locStr = "Geological Museum";
                }
                locationLabels.push(locStr);
            });

            vis.nodeLabels = locationLabels;
            vis.labels = [...new Set(vis.nodeLabels)];
        }

        vis.groups = vis.labels.length;


        vis.groupIdMap = {};
        vis.groupInstanceCounter = {};
        vis.groupFirstIdMap = {};

        // now I go through machinery of making nodes, where there is one central node per each group that tugs everything else
        for(let i = 0; i<vis.groups; i++) {
            vis.groupIdMap[vis.labels[i]] = i;
            vis.groupInstanceCounter[vis.labels[i]] = 0;
        }

        let i = 0;
        let nodeObjects = [];
            vis.displayFaculty.forEach((name) => {
            let nodeObj = {};
            nodeObj.name = name;
            nodeObj.label = vis.nodeLabels[i];
            nodeObj.groupInstanceCount = vis.groupInstanceCounter[nodeObj.label];
            if (vis.groupInstanceCounter[nodeObj.label] == 0) {

                vis.groupInstanceCounter[nodeObj.label] = vis.groupInstanceCounter[nodeObj.label] + 1;
            }

            nodeObjects.push(nodeObj);
            i = i + 1;
        });

        i = 0;
        nodeObjects.sort((a,b) => a.groupInstanceCount - b.groupInstanceCount);
        let newNodeObjects = [];
        nodeObjects.forEach((nodeObj) => {
            nodeObj.id = i;
            if (nodeObj.groupInstanceCount == 0) {
                vis.groupFirstIdMap[nodeObj.label] = nodeObj.id;
            }
            nodeObj.group = vis.groupFirstIdMap[nodeObj.label];

            newNodeObjects.push(nodeObj);
            i = i + 1;
        });

        vis.nodes = newNodeObjects;
        // keep track of which were the first ids, so you know which one to display for labels/rectangles
        vis.groupFirstIds = vis.labels.map((l) => vis.groupFirstIdMap[l]);


        vis.range = vis.nodes.length;

        vis.data = {
            nodes:vis.nodes,
            links:vis.nodes.map(function(i) {
                return {
                    source: i.group, //vis.groupFirstIdMap[i.group],
                    target: i.id
                };
            })};

        // make objects for making a label
        vis.labelObjects = [];
        i = 0;
        vis.labels.forEach((label) => {
            let tempObj = {};
            tempObj.label = label;
            let objColor = "";
            if (selectedFacultyDotGrouping == "teachingAreas") {
                objColor = vis.departmentColors[label];
            }
            else {
                objColor = vis.color(vis.groupFirstIdMap[label]); // yeah, maybe
            }
            tempObj.color = objColor;
            tempObj.i = i;

            vis.labelObjects.push(tempObj);
            i += 1;
        });

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        let trans = d3.transition()
            .duration(800);

        vis.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.index })
                .distance(20)) // .distance(20))
            .force("collide",d3.forceCollide(vis.circleRadius + 2)) // originally just vis.circleRadius
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(vis.width / 2 - 100, vis.height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0));

        // circles
        let circles = vis.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(vis.data.nodes, (d) => d.name) // can I do a smooth transition?
            .enter().append("circle")
            .on('mouseover', function(event, d){
                // highlight this circle
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black');

                // update tooltip
                vis.tooltip
                    .style("opacity", 1)
                    //.style("left", event.pageX + 20 + "px")
                    //.style("top", (event.pageY - 100) + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 2px">
                        
                        <h2 style="text-align: center">${d.name}</h2>
                        <p><b>Teaching Area:</b> ${vis.allInfoMap[d.name]["Teaching Areas"]} 
                        <br>
                        <b>Research Interests:</b> ${vis.allInfoMap[d.name]["Research Interests"]}
                        <br>
                        <b>Office Location:</b> ${vis.allInfoMap[d.name]["Office"]}
                        <br>
                        <b>Email:</b> ${vis.allInfoMap[d.name]["Email"]}
                        <br>
                        <b>Phone:</b> ${vis.allInfoMap[d.name]["Phone"]}
                        <br>
                        <b>Website:</b> ${vis.allInfoMap[d.name]["Website Link"]}
                        </p>
                        <img src = "${vis.picMap[d.name]}" style="position: absolute; top: 10px; left:10px; ">
                     </div>`);

                vis.tooltip
                    .style("left", (event.pageX - $("#groupTooltip").width()/2) + "px")
                    .style("top", (event.pageY - $("#groupTooltip").height() - 2*vis.circleRadius) + "px")

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px');

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);

            })
            .attr("r", vis.circleRadius)
            .style("fill", function(d, i) {
                // for special colors
                if (selectedFacultyDotGrouping == "teachingAreas") {
                    return vis.departmentColors[d.label];
                }
                else {
                    return vis.color(d.group);
                }
            });

        // I believe this controls movement
        function ticked() {
            circles
                .attr("cx", function(d) {
                    //
                    return Math.max(vis.circleRadius, Math.min(vis.width - vis.circleRadius, d.x));
                })
                .attr("cy", function(d) {
                    //
                    return Math.max(vis.circleRadius, Math.min(vis.height - vis.circleRadius, d.y));
                });
                //.attr("cx", function(d) { return d.x; })
                //.attr("cy", function(d) { return d.y; });
        }

        vis.simulation.nodes(vis.data.nodes).on("tick", ticked);

        //ties the circles together
        vis.simulation.force("link").links(vis.data.links);

        // for the labels
        vis.labelCircles = vis.svg.selectAll(".label-circle").data(vis.labelObjects, (d) => d["label"]);

        // remove
        vis.labelCircles.exit()
            .transition()
            .remove();

        vis.labelCircles.enter().append("circle")
            .attr("r",vis.circleRadius)
            .attr("cx", (d,i) => vis.width)
            .merge(vis.labelCircles)
            .transition()
            .duration(750)
            .attr("cx", (d,i) => vis.width)
            .attr("cy", (d,i) => i * 2 * vis.circleRadius + 20)
            .attr("fill", function(d) {
                return d.color;
            })
            .attr("class","label-circle");

        // for the labels
        vis.labelCirclesText = vis.svg.selectAll(".label-circle-text").data(vis.labelObjects, (d) => d["label"]);

        // remove
        vis.labelCirclesText.exit()
            .transition()
            .remove();

        vis.labelCirclesText.enter().append("text")
            .attr("x", (d,i) => vis.width -  vis.circleRadius - 5)
            .merge(vis.labelCircles)
            .transition()
            .duration(750)
            .attr("x", (d,i) => vis.width -  vis.circleRadius - 5)
            .attr("y", (d,i) => i * 2 * vis.circleRadius + 20)
            .attr("class","label-circle-text")
            .attr("text-anchor", "end")
            .text((d) => d.label);

    }

    killAll() {
        let vis = this;
        vis.svg.selectAll("circle").data(new Array()).exit().remove();
        vis.svg.selectAll("text").data(new Array()).exit().remove();
    }
}