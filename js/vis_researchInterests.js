/* * * * * * * * * * * * * *
*      class visResearchInterests        *
* * * * * * * * * * * * * */

class visResearchInterests {
    constructor(parentElement, latestPeopleInfo){
        this.parentElement = parentElement;
        // this.peopleInfo = peopleInfo; //remove all instances and replace with latest People Info
        this.peopleInfo = latestPeopleInfo.sort((a,b)=>{
            let splitA = a.Title.split(" ");
            let splitB = b.Title.split(" ");
            let lastA = splitA[splitA.length - 1];
            let lastB = splitB[splitB.length - 1];

            if (lastA < lastB) return -1;
            if (lastA > lastB) return 1;
            });
        // })


        console.log(this.peopleInfo)


        // this.peopleInfo.forEach(x=>console.log(x))

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 5, bottom: 0, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width/6}, ${vis.margin.top})`)
            // .attr('transform', 'rotate(45deg)');

        // color palette and color blind option
        vis.areaList = ["Applied Mathematics", "Applied Physics", "Bioengineering", "Computer Science", "Electrical Engineering",
            "Environmental Science & Engineering", "Material Science & Mechanical Engineering"]
        // vis.colors= {'Applied Mathematics':'#00aaad',"Applied Physics":"#cbdb2a","Bioengineering":"#fcb315","Computer Science":"#4e88c7",
        //     "Electrical Engineering":"#ffde2d","Environmental Science & Engineering":"#77ced9", "Material Science & Mechanical Engineering":"#bb89ca"}
        vis.colors= ['#00aaad',"#cbdb2a","#fcb315","#4e88c7","#ffde2d","#77ced9", "#bb89ca"]

        // vis.cbColors = {'Applied Mathematics':'#01D9DC',"Applied Physics":"#41A23D","Bioengineering":"#FCB315","Computer Science":"#0D5AAF",
        //     "Electrical Engineering":"#FFDE2D","Environmental Science & Engineering":"#B7E5EA", "Material Science & Mechanical Engineering":"#B379E8"}
        vis.cbColors = ['#01D9DC',"#41A23D","#FCB315","#0D5AAF", "#FFDE2D","#B7E5EA", "#B379E8"]

        vis.areaLoc = [{x: 20, y:-20},{x: 175+vis.areaList[2].length, y:-20},{x: 375+vis.areaList[3].length, y:-20},{x: 600, y:-20},{x: 800, y:-20},
            {x: 200, y:0},{x: 500, y:0},]

        vis.legendScale = d3.scaleOrdinal()
            .domain(vis.areaList)

        vis.rectSize = 12;

        vis.legend = vis.svg
            .append("g")
            .attr("class", "academic-legend")
        // we seem to be narrowing who we include, so here it is
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title);
        // vis.allFaculty = vis.peopleInfo.map((x) => x.Title)
        //     .filter((x) => vis.latestAllFaculty.includes(x));

        vis.noMatchMessage = vis.svg
            .append("g")
            .attr("class", "no-match-message")




        vis.teachingAreaInfo={}

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



        // intrinsic properties of the adjacency matrix
        //vis.cellWidth = 2;
        vis.yShift = 175;
        vis.xShift = 150;
        vis.originalYShift = vis.yShift;
        vis.originalXShift = vis.xShift;
        vis.ySquareShift = 10;

        // var maxScroll = d3.select("#"+vis.parentElement).node().scrollWidth



        vis.cellScalar =1; //0.85;
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
        vis.teachingAreaData();
        vis.createMatrixData();

        vis.createDropDownMenu()
        vis.createIntersectionMatrix()

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

    teachingAreaData(){
        let vis = this;

        vis.peopleInfo.forEach((x)=>{
            // console.log(x)
            let tas = x['Teaching Areas'].split("|")
            // console.log(tas, vis.areaList.includes(tas[0]))
            let ta = vis.areaList.includes(tas[0]) ? tas[0] : tas[1]
            vis.teachingAreaInfo[x.Title]=ta
        })
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

    createIntersectionMatrix(){
        let vis = this;

        vis.intersectionMatrixAA= [];
        vis.intersectionMatrixRI=[]

        vis.allTeachingAreas.forEach(x=>{

            // console.log(vis.departmentMap)

            vis.filteredTA =  vis.allFaculty.filter(name => { return vis.departmentMap[name].teachingAreas.includes(x);
            })
            // vis.numTA=vis.filteredTA.length
            vis.intersectionMatrixAA[x]={}

            vis.allResearchInterests.forEach(y=>{
                vis.filteredRI= vis.filteredTA.filter(name => vis.departmentMap[name].researchInterests.includes(y));
                // let thisCombo={}
                vis.intersectionMatrixAA[x][y]=vis.filteredRI.length != 0 ? false  : true;

            })
        })

        vis.allResearchInterests.forEach(x=>{

            // console.log(vis.departmentMap)

            vis.filteredRI =  vis.allFaculty.filter(name => { return vis.departmentMap[name].researchInterests.includes(x);
            })
            // vis.numTA=vis.filteredTA.length
            vis.intersectionMatrixRI[x]={}

            vis.allTeachingAreas.forEach(y=>{
                vis.filteredAA= vis.filteredRI.filter(name => vis.departmentMap[name].teachingAreas.includes(y));
                // let thisCombo={}
                vis.intersectionMatrixRI[x][y]=vis.filteredAA.length != 0 ? false  : true;

            })
        })

        console.log(vis.intersectionMatrixRI)
        console.log(vis.intersectionMatrixAA)



    }

    createDropDownMenu(){
        let vis = this;

        let selectDivRI = document.getElementById('faculty-table-filter-research-selector');
        let selectDivAA = document.getElementById('faculty-table-filter-academic-selector');



        vis.allTeachingAreas.forEach((teachingArea) => {
            let opt = document.createElement('option');
            opt.value = teachingArea;
            opt.innerHTML = teachingArea;
            opt.className = 'teachingMenuOption'
            selectDivAA.appendChild(opt);
        });
        vis.allResearchInterests.forEach((r) => {
            let opt = document.createElement('option');
            opt.value = r;
            opt.innerHTML = r;
            opt.className = 'researchMenuOption'
            // just so that something is set
            if (r == vis.allResearchInterests[0]) {
                //opt.selected = true;
                //selectedFacultyTableFilter = r;
            }
            selectDivRI.appendChild(opt);
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
            // console.log(name)
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

        // console.log(matrixLongList)

        vis.matrixLongList = matrixLongList;
    }

    updateMenuOptions(){
        let vis = this;
        console.log(selectedFacultyTableFilterAA,selectedFacultyTableFilterRI)

        if (selectedFacultyTableFilterAA != 'All'){
            Array.from(document.getElementsByClassName('researchMenuOption')).forEach(x=>{
                // console.log(x, x.value, options[x.value])
                x.disabled=vis.intersectionMatrixAA[selectedFacultyTableFilterAA][x.value]
            })

        } else if (selectedFacultyTableFilterRI != 'All') {
            Array.from(document.getElementsByClassName('teachingMenuOption')).forEach(x=>{
                // console.log(x, x.value, options[x.value])
                x.disabled=vis.intersectionMatrixRI[selectedFacultyTableFilterRI][x.value]
            })

        }else{
            Array.from(document.getElementsByClassName('researchMenuOption')).forEach(x=>{
                // console.log(x, x.value, options[x.value])
                x.disabled=false
            })
            Array.from(document.getElementsByClassName('teachingMenuOption')).forEach(x=>{
                // console.log(x, x.value, options[x.value])
                x.disabled=false
            })
        }
    }

    sortAndFilterValues() {
        let vis = this;
        vis.noMatch = false;
        vis.isAll = true;

        // filter FIRST

        // filtering the faculty
        if (selectedFacultyTableFilterRI != "All" & selectedFacultyTableFilterAA == "All") {
            vis.displayFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].researchInterests.includes(selectedFacultyTableFilterRI));
            // vis.displayFaculty = filteredFacultyRI;
            // vis.xShift = 240;
            vis.cellScalar = 0.7;
            vis.isAll=false;
        } else if (selectedFacultyTableFilterAA != "All" & selectedFacultyTableFilterRI == "All") {
            vis.displayFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].teachingAreas.includes(selectedFacultyTableFilterAA));
            // vis.displayFaculty = filteredFacultyAA;
            // vis.xShift = 240;
            vis.cellScalar = 0.7;
            vis.isAll = false;
        } else if (selectedFacultyTableFilterRI == "All" && selectedFacultyTableFilterAA == "All") {
            vis.displayFaculty = vis.allFaculty;
            // vis.xShift = 50;
            vis.cellScalar = 0.6;
        } else if (selectedFacultyTableFilterRI != "All" && selectedFacultyTableFilterAA != "All"){
            let filteredFacultyRI = vis.allFaculty.filter(name => vis.departmentMap[name].researchInterests.includes(selectedFacultyTableFilterRI));
            vis.displayFaculty = filteredFacultyRI.filter(name => vis.departmentMap[name].teachingAreas.includes(selectedFacultyTableFilterAA));
            if (vis.displayFaculty.length > 0){
                // vis.xshift=240;
                vis.cellScalar=0.6
            } else if (vis.displayFaculty==0){
                vis.displayFaculty=vis.allFaculty;
                vis.noMatch= true;
                // vis.xShift=50;
                vis.cellScalar=0.6;
            }
            vis.isAll=false;
        }


        vis.updateMenuOptions()


        // once you've filtered the faculty, filter out research areas that are unnecessary
        let allRelevantResearchInterestStr = vis.displayFaculty.map((name) => vis.departmentMap[name].researchInterests).join("|");
        let relevantResearchInterests = vis.allResearchInterests.filter((r) => allRelevantResearchInterestStr.includes(r));
        vis.displayResearchInterests = relevantResearchInterests;

        // just so the data is still fresh
        vis.createMatrixData();

        // THEN sort

        // sorting of faculty
        let stringFacultyInclusionSorts = ["name", "teachingAreas"];
        let stringResearchInclusionSorts = ["researchInterest"];
        let selectedFacultyTableFacultySort = ["name", "numResearchInterests"]
        let selectedFacultyTableResearchSort = ['researchInterest', 'interestedFaculty']
        if (!selectedSortTable) {
            // compare strings
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[a][selectedFacultyTableFacultySort[0]].localeCompare(vis.facultySortInfoDict[b][selectedFacultyTableFacultySort[0]])});
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort[0]].localeCompare(vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort[0]])});

        }
        else {
            // compare numbers (counts)
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[b][selectedFacultyTableFacultySort[1]] - vis.facultySortInfoDict[a][selectedFacultyTableFacultySort[1]]});
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort[1]] - vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort[1]]});
        }

        // sorting of research areas

        // if (stringResearchInclusionSorts.includes(selectedFacultyTableResearchSort)) {
        //    }
        // else {
        //
        // }

        // update the cell widths so it scales, and maybe update whether or not text is shown

        //let tempScaleShift = vis.cellScalar * d3.min([((vis.width - vis.xShift) / vis.displayFaculty.length), ((vis.height - vis.yShift) / vis.displayResearchInterests.length)]);
        if (vis.displayFaculty.length == vis.allFaculty.length) {
            //tempScaleShift = vis.cellScalar * d3.min([((vis.width) / vis.displayFaculty.length), ((vis.height) / vis.displayResearchInterests.length)]);
            vis.xShift = -1.2 * vis.margin.left;
            //vis.yShift = -0.8 * vis.margin.top;
        } else {
            vis.xShift = vis.originalXShift;
            vis.yShift = vis.originalYShift;

        }
        let tempScaleShift = vis.cellScalar * d3.min([((vis.width - vis.xShift) / vis.displayFaculty.length), ((vis.height - vis.yShift) / vis.displayResearchInterests.length)]);

        vis.cellWidth = d3.max([tempScaleShift,5]); // can I just increase the max?
        // console.log(vis.cellWidth)
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);
    }

    updateColors(){
        let vis = this;
        vis.facultyColors = selectedColorPalette==false? vis.colors : vis.cbColors;

        vis.legendScale
            .range(vis.facultyColors)

        vis.renderLegend();
    }

    renderLegend(){
        let vis = this;

//         var margin;
//         var line = 0;
//         var col = 0;
//         var line2 = 0;
//         var col2 = vis.rectSize;
//
        vis.legend.remove();
// //
// //
// // // Add one dot in the legend for each name.
//         var size = 20
//         vis.legend.selectAll("mydots")
//             .data(vis.areaList)
//             .enter()
//             .append("rect")
//             .attr("transform", function (d, i) {
//                 var y = line * 25 - 10;
//                 var x = col;
//                 col += d.length * 10 + 10;
//                 if (col > vis.width) {
//                     x = 0;
//                     col = d.length * 10 +10;
//                     line++;
//                     y = line * 25 -10;
//                 }
//                 return "translate(" + x + "," + y + ")";
//             })
//             // .attr("x", (d,i)=>{console.log(d.length); return vis.rectSize*i+d.length*3+50})
//             // .attr("y", 0) // 100 is where the first dot appears. 25 is the distance between dots
//             .attr("width", vis.rectSize)
//             .attr("height", size)
//             .style("fill", function(d){ return vis.legendScale(d)})
// //
// // // Add one dot in the legend for each name.
//         vis.legend.selectAll("mylabels")
//             .data(vis.areaList)
//             .enter()
//             .append("text")
//             .attr("transform", function (d, i) {
//                 var y = line2 * 25;
//                 var x = col2;
//                 col2 += d.length * 10 + 15;
//                 if (col2 > vis.width) {
//                     x = vis.rectSize;
//                     col2 = d.length * 10 +30;
//                     line2++;
//                     y = line2 * 25;
//                 }
//                 return "translate(" + x + "," + y + ")";
//             })
//             // .attr("x", vis.height/8)
//             // .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
//             // // .style("fill", function(d){ return vis.legendScale(d)})
//             .text(function(d){ return d})
//             .attr("text-anchor", "left")
//             .style("alignment-baseline", "middle")

        vis.legend
            .selectAll(".academic-legend")
            .data(vis.areaList)
            .enter()
            .append("rect")
            .attr("width", vis.rectSize)
            .attr("height", vis.rectSize)
            .attr("x", 120)
            .attr("y", (d,i)=>{100+i*(vis.rectSize)+5})
            .style("fill", d=>vis.legendScale(d))
            .attr("transform", (d,i) => `translate(${vis.areaLoc[i].x},${vis.areaLoc[i].y})`)
            .call(g => g.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", (d,i) => vis.legendScale[d])
            )
            .call(g => g.append("text")
                .attr("font-family", "Open Sans")
                .attr("font-size", 14)
                .attr("dy", "0.8em")
                .attr("dx", "1em")
                .attr("text-anchor", "start")
                .attr("class", "legend")
                .text(d => d))
    }

    wrangleData() {
        let vis = this;

        vis.sortAndFilterValues();
        // vis.updateMenuOptions();
        vis.createMatrixData();
        vis.updateColors();



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
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.yShift-vis.cellWidth/2)
            .attr("x", vis.xShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("font-weight", function(d) {
                if (d == selectedFacultyTableFilterRI) {
                    return "bold";
                } else {
                    return "normal";
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
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift+10)
            .attr("y", vis.yShift-vis.cellWidth/2)
            // .attr("stroke",5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("transform", (d,i) => "rotate(310," + ((vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift) +  "," + (vis.yShift+10) + ")")
            .text((d) => d);

        let facultySquares = vis.svg
            .selectAll(".faculty-column-labels")
            .data(vis.displayFaculty)

        facultySquares.exit()
            .style("opacity",0.0)
            .transition(trans)
            .remove();

        facultySquares
            .enter()
            .append("rect")
            .attr("class","faculty-column-labels")
            .merge(facultySquares)
            .attr("width",vis.cellWidth)
            .attr('height',5)
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i) + vis.xShift)
            .attr("y", vis.yShift-vis.ySquareShift)
            // .attr("stroke",5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("fill", (d)=>{return vis.teachingAreaInfo[d] ? vis.legendScale(vis.teachingAreaInfo[d]) : '#E8E8E8'})


        vis.renderLegend();

        // var margin;
        // var line = 0;
        // var col = 0;
        // var line2 = 0;
        // var col2 = vis.rectSize;

        vis.legend.remove();


        vis.legend = vis.svg
            .append("g")
            .selectAll("g")
            .data(vis.areaList, d=>d)
            .join("g")
            .attr("transform", (d,i) => `translate(${vis.areaLoc[i].x},${vis.areaLoc[i].y})`)
            .call(g => g.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", (d,i) => vis.legendScale(d))
            )
            .call(g => g.append("text")
                .attr("font-family", "Open Sans")
                .attr("font-size", 14)
                .attr("dy", "0.8em")
                .attr("dx", "1em")
                .attr("text-anchor", "start")
                .attr("class", "legend")
                .text(d => d))

        vis.noMatchMessage.remove();
        vis.noMatchMessage = vis.svg
            .append("g")
            .attr("class", "no-match-message")

        if (vis.noMatch){
            vis.noMatchMessage
                // .enter()
                .append("text")
                .text("No matching faculty at the intersection of " + selectedFacultyTableFilterAA + " and " + selectedFacultyTableFilterRI + ".")
                .attr('transform', `translate (${vis.width/6}, ${vis.margin.top*4})`)

        } else{
            vis.noMatchMessage.remove();
        }

        // vis.noMatchMessage.exit().remove()



        let relationSquares = vis.svg
            .selectAll(".matrix-relation-squares")
            .data(vis.matrixLongList, (d) => d.nameKey);

        relationSquares.exit() // EXIT
            .style("opacity",0.0)
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

                if (vis.isAll | vis.noMatch) {
                    vis.tooltip
                        .style("opacity", 1)
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                            <h4 style="text-align: center"><b>Column: </b>${d.name}</h4>
                            <h4 style="text-align: center"><b>Row: </b> ${d.researchInterest}</h4>
                            <p><b>Teaching Area:</b> ${vis.departmentMap[d.name].teachingAreas}
                            <br>
                            <b>Research Interests:</b> ${vis.departmentMap[d.name].researchInterests}

                            </p>
                         </div>`);

                    vis.tooltip
                        .style("left", (event.pageX - $("#researchInterestsTooltip").width() / 2) + "px")

                        .style("top", (event.pageY - $("#researchInterestsTooltip").height() - 5) + "px")
                }
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
                if (vis.noMatch){
                    return "#E8E8E8";
                } else {
                    if (d.isInterested) {
                        return "#ed1b34"; // SEAS red //"#a51c30"; // harvard crimson. used to be purple here
                    } else {
                        return "#E8E8E8";
                    }
            }})
            .attr("opacity", function(d) {
                if (vis.noMatch){
                    return 1.0;
                    // if (d.researchInterests.includes(selectedFacultyTableFilterRI || d.teachingAreas.includes(selectedFacultyTableFilterAA))){
                    //     return 1.0
                    // } else {
                    //     return 0.5
                    // }
                }
                else {
                    if (vis.displayLabelsBoolean || d.isInterested){
                        return 1.0;
                    }
                    else {
                        return 0.5;
                    }
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            //.attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

        // vis.svg.selectAll().attr('transform', `translate (${vis.width/6}, ${vis.margin.top}) rotate(45degrees)`)


    }
}
