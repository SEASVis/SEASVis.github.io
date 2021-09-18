/* * * * * * * * * * * * * *
*      class manyTableVis        *
* * * * * * * * * * * * * */

// TODO: maybe use an actual scale, instead of adjusting with scaling myself...
// TODO: maybe have something interesting happen on click

class manyTableVis {
    constructor(parentElement, peopleInfo, coursesInfo, latestPeopleInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.coursesInfo = coursesInfo;
        this.latestPeopleInfo = latestPeopleInfo;

        this.initVis();
    }


    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 60, bottom: 60, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // we seem to be narrowing who we include, so here it is
        vis.latestAllFaculty = vis.latestPeopleInfo.map((x) => x.Title);
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title)
            .filter((x) => vis.latestAllFaculty.includes(x));

        // I also want some big list of research areas... and teaching areas while we're at it
        let allResearchInterestsDup = vis.peopleInfo.map((x) => x["Research Interests"]).join("|").split("|");
        vis.allResearchInterests = [...new Set(allResearchInterestsDup)]
            .filter((x) => x.length > 0)
            .sort(function(a, b){return a.localeCompare(b)});

        let allTeachingAreasDup = vis.peopleInfo.map((x) => x["Teaching Areas"]).join("|").split("|");
        vis.allTeachingAreas = [...new Set(allTeachingAreasDup)]
            .filter((x) => x.length > 0)
            .sort(function(a, b){return a.localeCompare(b)});

        // add options to the select item for filtering
        let selectDiv = document.getElementById('faculty-table-filter-selector');
        vis.allTeachingAreas.forEach((teachingArea) => {
            let opt = document.createElement('option');
            opt.value = teachingArea;
            opt.innerHTML = "Filter: Teaching Area: " + teachingArea;
            selectDiv.appendChild(opt);
        });
        vis.allResearchInterests.forEach((r) => {
            let opt = document.createElement('option');
            opt.value = r;
            opt.innerHTML = "Filter: Research Interest: " + r;
            // just so that something is set
            if (r == vis.allResearchInterests[0]) {
                //opt.selected = true;
                //selectedFacultyTableFilter = r;
            }
            selectDiv.appendChild(opt);
        });

        // intrinsic properties of the adjacency matrix
        //vis.cellWidth = 2;
        vis.yShift = 100;
        vis.xShift = 240;
        vis.originalYShift = vis.yShift;
        vis.originalXShift = vis.xShift;

        vis.cellScalar = 0.95; //0.85;
        vis.cellPadding = 1;


        // I will define cellWidth later, dynamically

        // we may decide to filter this list for one reason or another, but for now use all
        vis.displayFaculty = vis.allFaculty;
        vis.displayResearchInterests = vis.allResearchInterests;

        // populate/update with relevant new info. Use to sort later
        vis.facultySortInfoDict = {};
        vis.researchInterestSortInfoDict = {};
        vis.allResearchInterests.forEach((r) => {
            // I may want more exciting sortable features, but this is a start
            vis.researchInterestSortInfoDict[r] = {};
            vis.researchInterestSortInfoDict[r].interestedFaculty = 0;
            vis.researchInterestSortInfoDict[r].researchInterest = r;
        });

        vis.basicRelationData();
        vis.createMatrixData();

        // decide whether or not to display text based on how many are here
        vis.displayLabelsThreshold = 50;
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'researchInterestsTooltip')
            .attr("opacity", 0.0);

        // actually create the squares (and labels)
        vis.wrangleData();

    }

    basicRelationData() {
        let vis = this;

        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterests': x["Research Interests"], 'teachingAreas': x["Teaching Areas"]};
        });

        vis.allInfoMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.allInfoMap[x["Title"]] = x;
        });

    }

    createMatrixData() {
        let vis = this;
        // this function will use some names of faculty (vis.displayFaculty), and some dataset, and creates data in the table

        let matrixLongList = [];

        vis.allResearchInterests.forEach((r) => {
            vis.researchInterestSortInfoDict[r].interestedFaculty = 0;
        });

        let xpos = 0;
        vis.displayFaculty.forEach((name) => {
            let facultyObj = {};
            facultyObj.name = name;
            facultyObj.researchInterests = [];
            let ypos = 0;
            let interestCounter = 0;
            vis.displayResearchInterests.forEach((r) => {
                let facultyResearchInterestObj = {};
                // keep track of the name
                facultyResearchInterestObj.name = name;
                facultyResearchInterestObj.researchInterest = r;
                facultyResearchInterestObj.isInterested = (vis.departmentMap[name].researchInterests.includes(r));
                if (facultyResearchInterestObj.isInterested) {
                    interestCounter = interestCounter + 1;
                    vis.researchInterestSortInfoDict[r].interestedFaculty = vis.researchInterestSortInfoDict[r].interestedFaculty + 1;
                }
                facultyResearchInterestObj.xpos = xpos;
                facultyResearchInterestObj.ypos = ypos;
                facultyResearchInterestObj.nameKey = name + ";" + r;
                facultyObj.researchInterests.push(facultyResearchInterestObj);
                matrixLongList.push(facultyResearchInterestObj);

                ypos = ypos+1;
            });

            // save this info so you can sort using it, later
            facultyObj.researchInterests = vis.departmentMap[name].researchInterests;
            facultyObj.teachingAreas = vis.departmentMap[name].teachingAreas;
            facultyObj.numResearchInterests = interestCounter;

            vis.facultySortInfoDict[name] = facultyObj;

            xpos = xpos+1;
        });

        vis.matrixLongList = matrixLongList;
    }

    sortAndFilterValues() {
        let vis = this;

        // filter FIRST

        // filtering the faculty
        if (vis.allResearchInterests.includes(selectedFacultyTableFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].researchInterests.includes(selectedFacultyTableFilter));
            vis.displayFaculty = filteredFaculty;
            vis.xShift = 240;
            vis.cellScalar = 0.85;
        } else if (vis.allTeachingAreas.includes(selectedFacultyTableFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].teachingAreas.includes(selectedFacultyTableFilter));
            vis.displayFaculty = filteredFaculty;
            vis.xShift = 240;
            vis.cellScalar = 0.85;
        }
        else if (selectedFacultyTableFilter == "All") {
            vis.displayFaculty = vis.allFaculty;
            vis.xShift = 50;
            vis.cellScalar = 0.6;
        }

        // once you've filtered the faculty, filter out research areas that are unnecessary
        let allRelevantResearchInterestStr = vis.displayFaculty.map((name) => vis.departmentMap[name].researchInterests).join("|");
        let relevantResearchInterests = vis.allResearchInterests.filter((r) => allRelevantResearchInterestStr.includes(r));
        vis.displayResearchInterests = relevantResearchInterests;

        // just so the data is still fresh
        vis.createMatrixData();

        // THEN sort

        // sorting of faculty
        let stringFacultyInclusionSorts = ["name", "teachingAreas"];
        if (stringFacultyInclusionSorts.includes(selectedFacultyTableFacultySort)) {
            // compare strings
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[a][selectedFacultyTableFacultySort].localeCompare(vis.facultySortInfoDict[b][selectedFacultyTableFacultySort])});
        }
        else {
            // compare numbers (counts)
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[b][selectedFacultyTableFacultySort] - vis.facultySortInfoDict[a][selectedFacultyTableFacultySort]});
        }

        // sorting of research areas
        let stringResearchInclusionSorts = ["researchInterest"];
        if (stringResearchInclusionSorts.includes(selectedFacultyTableResearchSort)) {
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort].localeCompare(vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort])});
        }
        else {
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort] - vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort]});
        }

        // update the cell widths so it scales, and maybe update whether or not text is shown

        //let tempScaleShift = vis.cellScalar * d3.min([((vis.width - vis.xShift) / vis.displayFaculty.length), ((vis.height - vis.yShift) / vis.displayResearchInterests.length)]);
        if (vis.displayFaculty.length == vis.allFaculty.length) {
            //tempScaleShift = vis.cellScalar * d3.min([((vis.width) / vis.displayFaculty.length), ((vis.height) / vis.displayResearchInterests.length)]);
            vis.xShift = -0.8 * vis.margin.left;
            //vis.yShift = -0.8 * vis.margin.top;
        } else {
            vis.xShift = vis.originalXShift;
            vis.yShift = vis.originalYShift;

        }
        let tempScaleShift = vis.cellScalar * d3.min([((vis.width - vis.xShift) / vis.displayFaculty.length), ((vis.height - vis.yShift) / vis.displayResearchInterests.length)]);

        vis.cellWidth = d3.max([tempScaleShift,5]); // can I just increase the max?
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);

    }

    wrangleData() {
        let vis = this;

        vis.sortAndFilterValues();
        vis.createMatrixData();

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        let trans = d3.transition()
            .duration(800);


        vis.tooltip
            .style("opacity", 0)
            .style("left", 0)
            .style("top", 0)
            .html(``);



        // rows are for research interests
        let rowLabels = vis.svg
            .selectAll(".matrix-row-labels")
            .data(vis.displayResearchInterests);

        rowLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        rowLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-row-labels")
            .merge(rowLabels)
            .transition(trans) // ENTER + UPDATE
            .attr("text-anchor","end")
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.yShift)
            .attr("x", vis.xShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("fill", function(d) {
                if (d == selectedFacultyTableFilter) {
                    return "black";
                } else {
                    return "#5d5d5d";
                }
            })
            .text(d =>d);

        // column labels are for the faculty

        let columnLabels = vis.svg
            .selectAll(".matrix-column-labels")
            .data(vis.displayFaculty);

        columnLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        columnLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-column-labels")
            .merge(columnLabels)
            .transition(trans) // ENTER + UPDATE
            .attr("text-anchor","start")
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift)
            .attr("y", vis.yShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("transform", (d,i) => "rotate(270," + ((vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift) +  "," + (vis.yShift - 5) + ")")
            .text((d) => d);

        let relationSquares = vis.svg
            .selectAll(".matrix-relation-squares")
            .data(vis.matrixLongList, (d) => d.nameKey);

        relationSquares.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        relationSquares
            .enter() // ENTER
            .append("rect")
            .attr("class","matrix-relation-squares")
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .on('mouseover', function(event, d){

                // highlight this square
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black');
                // update tooltip
                vis.tooltip
                    .style("opacity", 1)
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                        <h4 style="text-align: center"><b>Column: </b>${d.name}</h4>
                        <h4 style="text-align: center"><b>Row: </b> ${d.researchInterest}</h4>
                        <p><b>Teaching Area:</b> ${vis.departmentMap[d.name].teachingAreas}
                        <br>
                        <b>Research Interests:</b> ${vis.departmentMap[d.name].researchInterests}
                        <br>
                        <b>Email:</b> ${vis.allInfoMap[d.name]["Email"]}
                        <br>
                        <b>Phone:</b> ${vis.allInfoMap[d.name]["Phone"]}
                        <br>
                        <b>Website:</b> ${vis.allInfoMap[d.name]["Website Link"]}
                        </p>
                     </div>`);

                vis.tooltip
                    .style("left", (event.pageX - $("#researchInterestsTooltip").width()/2) + "px")

                    .style("top", (event.pageY - $("#researchInterestsTooltip").height() - 5) + "px")
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
            .merge(relationSquares) // ENTER + UPDATE
            .transition(trans)
            .attr("fill", function(d) {
                if (d.isInterested) {
                    return "#ed1b34"; // SEAS red //"#a51c30"; // harvard crimson. used to be purple here
                } else {
                    return "gray";
                }
            })
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean || d.isInterested){
                    return 1.0;
                }
                else {
                    return 0.5;
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            //.attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

    }




}