/* * * * * * * * * * * * * *
*      class visCoauthors        *
* * * * * * * * * * * * * */

class visCoauthors {

    constructor(parentElement, peopleInfo, perPaperInfo, latestPeopleInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.perPaperInfo = perPaperInfo;
        this.latestPeopleInfo = latestPeopleInfo;

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 5, bottom: 5, left: 5};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width/4}, ${vis.margin.top})`);

        vis.latestAllFaculty = vis.latestPeopleInfo.map((x) => x.Title);
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title).filter((x) => vis.latestAllFaculty.includes(x));

        // I also want some big list of research areas... and teaching areas while we're at it
        let allResearchInterestsDup = vis.peopleInfo.map((x) => x["Research Interests"]).join("|").split("|");
        vis.allResearchInterests = [...new Set(allResearchInterestsDup)]
            .filter((x) => x.length > 0)
            .sort(function(a, b){return a.localeCompare(b)});

        let allTeachingAreasDup = vis.peopleInfo.map((x) => x["Teaching Areas"]).join("|").split("|");
        vis.allTeachingAreas = [...new Set(allTeachingAreasDup)]
            .filter((x) => x.length > 0)
            .sort(function(a, b){return a.localeCompare(b)});

        //'faculty-table-filter-selector'
        let selectDiv = document.getElementById('faculty-adj-filter-selector');
        vis.allTeachingAreas.forEach((teachingArea) => {
            let opt = document.createElement('option');
            opt.value = teachingArea;
            opt.innerHTML = "Filter: Academic Area: " + teachingArea;
            selectDiv.appendChild(opt);
        });
        vis.allResearchInterests.forEach((r) => {
            let opt = document.createElement('option');
            opt.value = r;
            opt.innerHTML = "Filter: Research Interest: " + r;
            // just so that something is set
            if (r == vis.allResearchInterests[0]) {
                //opt.selected = true;
                //selectedFacultyAdjFilter = r;
            }
            selectDiv.appendChild(opt);
        });

        // intrinsic properties of the adjacency matrix
        vis.yShift = 0;
        vis.yOffsetBottom = 120;
        vis.xShift = 100;
        vis.originalYShift = vis.yShift;
        vis.originalXShift = vis.xShift;
        vis.columnHeight = vis.height - vis.yShift - vis.yOffsetBottom;
        vis.length = d3.min([vis.width - vis.xShift, vis.height - vis.yShift - vis.yOffsetBottom]);

        vis.cellScale = d3.scaleBand()
            .rangeRound([0, d3.min([vis.width - vis.xShift, vis.height - vis.yShift - vis.yOffsetBottom])])
            .paddingInner(0.1); // a value 0 to 1. Maybe make smaller?

        vis.cellScale.domain(d3.range(vis.allFaculty.length));

        // we may decide to filter this list for one reason or another, but for now use all
        vis.displayFaculty = vis.allFaculty;
        vis.displayPaperInfo = vis.perPaperInfo;

        // populate/update with relevant new info. Use to sort later
        vis.facultySortInfoDict = {};

        vis.basicRelationData();
        vis.createMatrixData();

        // decide whether or not to display text based on how many are here
        vis.displayLabelsThreshold = 40;
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);

        vis.colorBarWidth = 80;
        vis.colorBarHeight = 10;

        vis.oneAuthorLinearScale = d3.scaleLinear()
            .range([0, vis.colorBarWidth]);

        vis.oneAuthorAxis = d3.axisBottom()
            .scale(vis.oneAuthorLinearScale).ticks(3);

        vis.oneAuthorGroup = vis.svg.append("g")
            .attr("class", "axis one-author-axis")
            .attr("transform", "translate("+vis.length+", 15)")
            .call(vis.oneAuthorAxis);

        vis.oneAuthorColorScale = d3.scaleSequential()
            .domain([0, vis.colorBarWidth]).range(["lightblue","darkblue"]);

        vis.oneAuthorGroup.selectAll(".bars")
            .data(d3.range(vis.colorBarWidth), function(d) { return d; })
            .enter().append("rect")
            .attr("class", "bars")
            .attr("x", function(d, i) { return i; })
            .attr("y", -vis.colorBarHeight)
            .attr("height", vis.colorBarHeight)
            .attr("width", 1)
            .style("fill", function(d, i ) { return vis.oneAuthorColorScale(d); });

        vis.authorText = vis.svg.append("text")
            .text("Total Papers By One Person")
            .attr("class", "colorscale-label")
            .attr("x", vis.length)
            .attr("y", 0);


        // then for the coauthor stuff too
        vis.coauthorLinearScale = d3.scaleLinear()
            .range([0, vis.colorBarWidth]);

        vis.coauthorAxis = d3.axisBottom()
            .scale(vis.coauthorLinearScale).ticks(3);

        vis.coauthorGroup = vis.svg.append("g")
            .attr("class", "axis coauthor-axis")
            .attr("transform", "translate("+vis.length+", 65)")
            .call(vis.coauthorAxis);

        vis.coauthorColorScale = d3.scaleSequential()
            .domain([0, vis.colorBarWidth]).range(["pink","darkred"]);

        vis.coauthorGroup.selectAll(".bars")
            .data(d3.range(vis.colorBarWidth), function(d) { return d; })
            .enter().append("rect")
            .attr("class", "bars")
            .attr("x", function(d, i) { return i; })
            .attr("y", -vis.colorBarHeight)
            .attr("height", vis.colorBarHeight)
            .attr("width", 1)
            .style("fill", function(d, i ) { return vis.coauthorColorScale(d); });

        vis.coauthorText = vis.svg.append("text")
            .text("Papers By Two Faculty")
            .attr("class", "colorscale-label")
            .attr("x", vis.length)
            .attr("y", 50);

        // actually create the squares (and labels, maybe)
        vis.wrangleData()
        vis.updateVis();
    }

    basicRelationData() {
        // create n by n dictionary, mapping pairs to their papers
        let vis = this;

        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterest': x["Research Interests"], 'teachingArea': x["Teaching Areas"]};
        });

        vis.facultyPapersDict = {};
        vis.displayFaculty.forEach((name) => {
            vis.facultyPapersDict[name] = {};
            vis.displayFaculty.forEach((name2) => {
                // create a mapping where we store a list of common papers between the two authors
                // then, we can extract info (namely, the length of this list
                vis.facultyPapersDict[name][name2] = [];
            });
        });

        vis.displayPaperInfo.forEach((paper) => {
            vis.displayFaculty.forEach((name) => {
                // the fact that it's a string... might need to be changed at some point
                if(paper[name] == "1") {
                    vis.displayFaculty.forEach((name2) => {
                        // note that name and name2 could be the same, which is fine
                        if(paper[name2] == "1") {
                            // we will be most interested in the LENGTH of this list
                            // but we may want to display a list of abstracts, titles, etc.
                            vis.facultyPapersDict[name][name2].push(paper);
                        }
                    });
                }
            });
        });
    }

    createMatrixData() {
        let vis = this;
        // this function will use some names of faculty (vis.displayFaculty), and some dataset, and create an adjacency matrix to use

        // now create a list of objects, each object containing a list of objects, each of those objects with papers and names of two authors
        let facultyListOfLists = [];
        let matrixLongList = [];
        //let facultySortInfoDict = {};
        let allRelatedPapers = [];
        let xpos = 0;
        let paperLengths = [];
        let coauthorPaperLengths = [];
        vis.displayFaculty.forEach((name) => {

            let facultyObj = {};
            facultyObj.name = name;
            facultyObj.relations = [];
            let ypos = 0;
            let coauthorCounter = 0;
            vis.displayFaculty.forEach((name2) => {
                let facultyPairObj = {};
                facultyPairObj.name1 = name;
                facultyPairObj.name2 = name2;
                facultyPairObj.values = vis.facultyPapersDict[name][name2];
                facultyPairObj.valueLen = vis.facultyPapersDict[name][name2].length;
                if (facultyPairObj.valueLen > 0) {
                    coauthorCounter += 1;
                    // keep track of the amount of papers in these categories
                    if (name == name2) {
                        paperLengths.push(facultyPairObj.valueLen);
                    }
                    else {
                        coauthorPaperLengths.push(facultyPairObj.valueLen);
                    }
                }
                facultyPairObj.xpos = xpos;
                facultyPairObj.ypos = ypos;
                facultyPairObj.nameKey = name + ";" + name2;
                facultyObj.relations.push(facultyPairObj);
                matrixLongList.push(facultyPairObj);
                ypos = ypos+1;
            });
            facultyObj.researchInterest = vis.departmentMap[name].researchInterest;
            facultyObj.teachingArea = vis.departmentMap[name].teachingArea;
            facultyObj.numCoauthors = coauthorCounter;
            //facultyObj.numSoloPapers = vis.facultyPapersDict[name][name].length - coauthorPapers;
            facultyObj.numPapers = vis.facultyPapersDict[name][name].length;
            facultyListOfLists.push(facultyObj);
            vis.facultySortInfoDict[name] = facultyObj;
            xpos = xpos+1;
            // keep track of all papers from this filter
            vis.facultyPapersDict[name][name].forEach((paper) => {
                allRelatedPapers.push(paper);
            });
        });

        // update domains
        if (vis.oneAuthorLinearScale) {
            vis.maxPaperLen = d3.max(paperLengths);
            vis.oneAuthorLinearScale.domain([0, vis.maxPaperLen]);
            vis.oneAuthorColorScale.domain([0, vis.maxPaperLen]);
        }
        if (vis.coauthorLinearScale) {
            vis.maxCoauthorPaperLen = d3.max(coauthorPaperLengths);
            vis.coauthorLinearScale.domain([0, vis.maxCoauthorPaperLen]);
            vis.coauthorColorScale.domain([0, vis.maxCoauthorPaperLen]);
        }

        vis.matrixLongList = matrixLongList;
        vis.allRelatedPapers = allRelatedPapers;

        if (vis.displayFaculty.length == vis.allFaculty.length) {
            vis.yShift = 0; //-40
            vis.xShift = 90;
            // idea is to get it bigger, and plot it bigger
            vis.cellScale.rangeRound([0, d3.min([vis.width - vis.xShift, vis.height - vis.yShift - vis.yOffsetBottom])]);
        }
        else {
            vis.yShift = vis.originalYShift;
            vis.xShift = vis.originalXShift;
            vis.cellScale.rangeRound([0, d3.min([vis.width - vis.xShift, vis.height - vis.yShift - vis.yOffsetBottom])]);
        }
    }

    sortAndFilterValues() {
        let vis = this;

        // ok, it has a new value of selectedFacultyAdjSort

        // filter FIRST
        if (vis.allResearchInterests.includes(selectedFacultyAdjFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].researchInterest.includes(selectedFacultyAdjFilter));
            vis.displayFaculty = filteredFaculty;
        } else if (vis.allTeachingAreas.includes(selectedFacultyAdjFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].teachingArea.includes(selectedFacultyAdjFilter));
            vis.displayFaculty = filteredFaculty;
        }
        // this is the case where we JUST clicked on filtering back
        else if (newFilterBack) {
            vis.displayFaculty = vis.allFaculty;
            newFilterBack = false;
        }

        // THEN sort
        let strSortList = ["name", "teachingArea"];
        if (strSortList.includes(selectedFacultyAdjSort)) {
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[a][selectedFacultyAdjSort].localeCompare(vis.facultySortInfoDict[b][selectedFacultyAdjSort])});
        }
        else {
            // numerical sorting
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[b][selectedFacultyAdjSort] - vis.facultySortInfoDict[a][selectedFacultyAdjSort]});
        }

        // update the cell widths so it scales, and maybe update whether or not text is shown
        vis.cellScale.domain(d3.range(vis.displayFaculty.length));
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

        let relationSquares = vis.svg
            .selectAll(".matrix-relation-squares")
            .data(vis.matrixLongList, (d) => d.nameKey);

        relationSquares.exit() // EXIT
            .style("opacity", 0.0)
            .transition()
            .duration(800)
            .remove();

        relationSquares
            .enter() // ENTER
            .append("rect")
            .attr("class","matrix-relation-squares")
            .merge(relationSquares) // ENTER + UPDATE
            .transition()
            .duration(800)
            .attr("fill", function(d) {
                if (d.xpos < d.ypos +1) {
                    if (d.valueLen > 0) {
                        //return "purple";
                        if (d.name1 == d.name2) {
                            return vis.oneAuthorColorScale(d.valueLen);
                        }
                        else {
                            return vis.coauthorColorScale(d.valueLen);
                        }
                    } else {
                        return "#E8E8E8";
                    }
                } else {
                    return "white";
                }

            })
            .attr("opacity", function(d) {
                if (d.xpos < d.ypos +1) {
                    if (vis.displayLabelsBoolean || d.valueLen > 0) {
                        return 1.0;
                    } else {
                        return 0.5;
                    }
                }
                else {
                    return 0;
                }
            })
            .attr("x", (d,i) => vis.cellScale(d.xpos) + vis.xShift)
            .attr("y", (d,i) => vis.cellScale(d.ypos) + vis.yShift)
            .attr("width", vis.cellScale.bandwidth())
            .attr("height", vis.cellScale.bandwidth())
            .attr('stroke-width', '0px');

        let rowLabels = vis.svg
            .selectAll(".matrix-row-labels")
            .data(vis.displayFaculty);

        rowLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition()
            .duration(800)
            .remove();

        rowLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-row-labels")
            .merge(rowLabels)
            .transition()
            .duration(800) // ENTER + UPDATE
            .attr("text-anchor","end")
            .attr("y", (d,i) => vis.cellScale(i) + vis.yShift + vis.cellScale.bandwidth()/2 +3)
            .attr("x", vis.xShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .text(d => d);

        // same for column labels
        let columnLabels = vis.svg
            .selectAll(".matrix-column-labels")
            .data(vis.displayFaculty);

        columnLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition()
            .duration(800)
            .remove();

        columnLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-column-labels")
            .merge(columnLabels)
            .transition()
            .duration(800) // ENTER + UPDATE
            .attr("text-anchor","start")
            //.attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift)
            //.attr("x", (d,i) => vis.cellScale(i) + vis.xShift + vis.cellScale.bandwidth() -vis.yOffsetBottom)
            .attr("x", - (vis.columnHeight+5))
            .attr("y", (d,i) => vis.cellScale(i) + vis.xShift + vis.cellScale.bandwidth()/2 +3)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            //.attr("transform", (d,i) => "rotate(270," + ((vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift) +  "," + vis.yShift + ")")
            .attr("transform", (d,i) => "rotate(270)")
            .attr("text-anchor", "end")
            .text(d => d);

        // update axis of color labels
        vis.oneAuthorGroup
            .transition()
            .duration(800)
            .call(vis.oneAuthorAxis)
            .attr("opacity", () => {
                if (vis.maxPaperLen > 0) {
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            });

        vis.authorText
            .transition()
            .duration(800)
            .attr("opacity", () => {
            if (vis.maxPaperLen > 0) {
                return 1.0;
            }
            else {
                return 0.0;
            }
        });

        vis.coauthorGroup
            .transition()
            .duration(800)
            .call(vis.coauthorAxis)
            .attr("opacity", () => {
                if (vis.maxCoauthorPaperLen > 0) {
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            });

        vis.coauthorText
            .transition()
            .duration(800)
            .attr("opacity", () => {
            if (vis.maxCoauthorPaperLen > 0) {
                return 1.0;
            }
            else {
                return 0.0;
            }
        });
    }
}
