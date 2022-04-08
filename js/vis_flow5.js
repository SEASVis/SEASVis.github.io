/* * * * * * * * * * * * * *
*      class visFlow     *
* * * * * * * * * * * * * */

class visFlow {

    constructor(parentElement, dataPeople){
        this.parentElement = parentElement;
        this.dataPeople = dataPeople;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width+vis.margin.left+vis.margin.right)
            .attr("height", 3300)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("text")
            .attr("x", vis.width/2)
            .attr("y", vis.height/2)
            .attr("text-anchor", "middle")
            .attr("id", "noFacultyMessage")
            .attr("class", "textMessage")
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text("No faculty listed, please change your filters.");

        document.addEventListener('scroll', function() {
            vis.updateVis()
        });

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
        vis.listFacultySchools = [];
        vis.listFacultyCentersInitiatives = [];

        vis.dataPeople.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');
            let researchInterests = faculty['Research Interests'].split('|');

            if(teachingAreas.length === 1 && teachingAreas[0] === ""){return;}
            if(researchInterests.length === 1 && researchInterests[0] === ""){return;}

            vis.filteredData.push(faculty);
            vis.listFaculty.push(title);
        });

        vis.filteredData.forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');
            let schools = faculty['School Affiliations'].split('|');
            let centersInitiatives = faculty['Center/Initiative Affiliations'].split('|');

            vis.Nodes.push({
                "lvl": 1,
                "name": title,
                "school": 1
            })

            teachingAreas.forEach(function(area){
                if(!vis.listAreas.includes(area)){
                    vis.listAreas.push(area);
                    vis.Nodes.push({
                        "lvl": 0,
                        "name": area,
                        "school": 1
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": area,
                    "lvl": 0
                })
            })

            schools.forEach(function(school){
                if(schools[0] === ""){return;}

                if(!vis.listFacultySchools.includes(school)){
                    vis.listFacultySchools.push(school);
                    vis.Nodes.push({
                        "lvl": 2,
                        "name": school,
                        "school": 0
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": school,
                    "lvl": 1
                })
            })

            centersInitiatives.forEach(function(center){
                if(centersInitiatives[0] === ""){return;}

                if(!vis.listFacultyCentersInitiatives.includes(center)){
                    vis.listFacultyCentersInitiatives.push(center);
                    vis.Nodes.push({
                        "lvl": 2,
                        "name": center,
                        "school": 1
                    })
                }

                vis.Links.push({
                    "source": title,
                    "target": center,
                    "lvl": 1
                })
            })
        });
        console.log(vis.listFacultySchools)

        // let countSchool = 0;
        // vis.dataCenters.forEach(function(row, index){
        //     let title = row['Title'];
        //     let center = row['Center'];
        //
        //     if(!vis.listFaculty.includes(title)){return;}
        //
        //     if(!vis.listCenters.includes(center)) {
        //         vis.listCenters.push(center);
        //
        //         if(countSchool < 7){
        //             vis.Nodes.push({
        //                 "lvl": 2,
        //                 "name": center,
        //                 "school": 0
        //             })
        //         } else {
        //             vis.Nodes.push({
        //                 "lvl": 2,
        //                 "name": center,
        //                 "school": 1
        //             })
        //         }
        //         countSchool += 1;
        //     }
        //
        //     vis.Links.push({
        //         "source": title,
        //         "target": center,
        //         "lvl": 1
        //     })
        // });

        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl && a.lvl === 0){
                return a.name.localeCompare(b.name);
            } else if (a.lvl === b.lvl && a.lvl === 1){
                let splitA = a.name.split(" ");
                let splitB = b.name.split(" ");
                let lastA = splitA[splitA.length - 1];
                let lastB = splitB[splitB.length - 1];

                if (lastA < lastB) return -1;
                if (lastA > lastB) return 1;
                return 0;
            } else{
                return a.lvl - b.lvl;
            }
        });

        vis.listAreas.sort(function(a,b){ return a.localeCompare(b) });
        vis.listFaculty.sort(function(a,b){
            let splitA = a.split(" ");
            let splitB = b.split(" ");
            let lastA = splitA[splitA.length - 1];
            let lastB = splitB[splitB.length - 1];

            if (lastA < lastB) return -1;
            if (lastA > lastB) return 1;
            return 0;
        })

        vis.listFacultySchools.sort(function(a,b){ return a.localeCompare(b) });
        vis.listFacultyCentersInitiatives.sort(function(a,b){ return a.localeCompare(b) });
        vis.listCenters = vis.listFacultySchools.concat(vis.listFacultyCentersInitiatives);

        vis.areaCount = vis.listAreas.length;
        vis.facultyCount = vis.listFaculty.length;
        vis.centerCount = vis.listCenters.length;

        vis.Nodes.forEach(function (d, i) {
            d.id = "n" + i;
        });
        vis.Links.forEach(function (d) {
            d.source = vis.Nodes.filter(obj => {return obj.name === d.source})[0];
            d.target = vis.Nodes.filter(obj => {return obj.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.allNodes = vis.Nodes;
        vis.allLinks = vis.Links;

        vis.updateVis();
    }

    filterData(val, lvl){
        let vis = this;

        vis.Nodes = vis.allNodes;
        vis.Links = vis.allLinks;

        let selectedNodes = [];
        let selectedLinks = [];

        if(lvl === 0){
            let area0 = vis.Nodes.filter(obj => {return obj.name === val.name})[0]
            selectedNodes.push(area0);

            let areaFaculty = [];
            vis.Links.forEach(function(d){
                if(d.target.id === area0.id){
                    if(!selectedNodes.includes(d.source)){
                        selectedNodes.push(d.source);
                        areaFaculty.push(d.source);
                    }
                    selectedLinks.push(d);
                }
            })

            vis.Links.forEach(function(d){
                if(d.lvl === 1){
                    if(areaFaculty.includes(d.source)){
                        if(!selectedNodes.includes(d.target)){
                            selectedNodes.push(d.target)
                        }
                        selectedLinks.push(d);
                    }
                }
            })

            vis.Nodes = selectedNodes;
            vis.Links = selectedLinks;
        }

        if(lvl === 1){
            selectedNodes.push(val);

            vis.Links.forEach(function(d){
                if(d.source.id === val.id){
                    if(!selectedNodes.includes(d.target)){
                        selectedNodes.push(d.target)
                    }
                    selectedLinks.push(d)
                }
            })

            vis.Nodes = selectedNodes;
            vis.Links = selectedLinks;
        }

        if(lvl === 2){
            selectedNodes.push(val);

            let centerFaculty = [];
            vis.Links.forEach(function(d){
                if(d.target.id === val.id){
                    if(!selectedNodes.includes(d.source)){
                        selectedNodes.push(d.source)
                        centerFaculty.push(d.source);
                    }
                    selectedLinks.push(d);
                }
            })

            vis.Links.forEach(function(d){
                if(d.lvl === 0){
                    if(centerFaculty.includes(d.source)){
                        if(!selectedNodes.includes(d.target)){
                            selectedNodes.push(d.target)
                        }
                        selectedLinks.push(d)
                    }
                }
            })

            vis.Nodes = selectedNodes;
            vis.Links = selectedLinks;
        }

        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl && a.lvl === 0){
                return a.name.localeCompare(b.name);
            } else if (a.lvl === b.lvl && a.lvl === 1){
                let splitA = a.name.split(" ");
                let splitB = b.name.split(" ");
                let lastA = splitA[splitA.length - 1];
                let lastB = splitB[splitB.length - 1];

                if (lastA < lastB) return -1;
                if (lastA > lastB) return 1;
                return 0;
            } else{
                return a.lvl - b.lvl;
            }
        });

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        if(selectedColorPalette){
            vis.colors = ["#ed1b34", "#01D9DC", "#41A23D", "#FCB315", "#0D5AAF", "#FFDE2D", "#B7E5EA", "#B379E8"]
        }else{
            vis.colors = ["#ed1b34", "#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca"]
        }
        vis.colorAreas = d3.scaleOrdinal().domain(vis.listAreas).range(vis.colors)

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        let count = [];
        vis.Nodes.forEach(function (d) {
            count[d.lvl] = 0;
        });
        vis.lvlCount = 3;
        let countNodesAreas = vis.Nodes.filter((obj) => obj.lvl === 0).length;
        let countNodesFaculty = vis.Nodes.filter((obj) => obj.lvl === 1).length;
        let countNodesCenters = vis.Nodes.filter((obj) => obj.lvl === 2).length;

        vis.boxWidth = 160;
        vis.boxWidthArea = 240;
        vis.boxWidthCenter = 380;
        vis.gap = {width: (vis.width - (vis.boxWidthArea + vis.boxWidth + vis.boxWidthCenter)) / (vis.lvlCount-1), height: 3};
        vis.gapHeightFaculty = vis.gap.height;
        vis.offsetHeightFaculty = 0;

        vis.boxHeight = 20;
        vis.boxHeightArea = (vis.height - countNodesAreas*vis.gap.height) / countNodesAreas;

        if (countNodesFaculty*(vis.boxHeight+vis.gapHeightFaculty) < vis.height){
            vis.gapHeightFaculty = (vis.height - countNodesFaculty*vis.boxHeight) / countNodesFaculty;
            vis.offsetHeightFaculty = vis.gapHeightFaculty/2;
        }

        // let listSchools = [
        //     "Harvard Business School",
        //     "Harvard Graduate School of Design",
        //     "Harvard Kennedy School of Government",
        //     "Harvard Law School",
        //     "Harvard Medical School",
        //     "Harvard T.H. Chan School of Public Health",
        //     "Institute for Applied Computational Science (IACS)"
        // ]
        let countSelectedSchools = 0;
        vis.Nodes.forEach(function(d){
            if(vis.listFacultySchools.includes(d.name)){
                countSelectedSchools += 1;
            }
        })

        if (countNodesCenters === countSelectedSchools || countSelectedSchools === 0){
            vis.boxHeightCenter = (vis.height - (countNodesCenters)*vis.gap.height) / (countNodesCenters);
            vis.schoolOffset = 0;
        } else {
            vis.boxHeightCenter = (vis.height - (countNodesCenters+1)*vis.gap.height) / (countNodesCenters+1);
            vis.schoolOffset = vis.boxHeightCenter;
        }

        vis.schoolCount = 0;
        vis.Nodes.forEach(function (d, i) {
            if(d.lvl === 0) {
                d.x = 60;
                d.y = (vis.boxHeightArea + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                count[d.lvl] += 1;
            } else if(d.lvl === 2){
                d.x = vis.boxWidthArea + vis.boxWidth + d.lvl*vis.gap.width - 60;

                if(countSelectedSchools === 0){
                    d.y = (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                    vis.schoolCount = vis.schoolCount + 1;
                } else {
                    if(vis.schoolCount < countSelectedSchools){
                        d.y = (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                        vis.schoolCount = vis.schoolCount + 1;
                    }
                    else{
                        d.y = vis.schoolOffset + (vis.boxHeightCenter + vis.gap.height) * count[d.lvl] +$(window).scrollTop();
                    }
                }

                count[d.lvl] += 1;
            } else { //(d.lvl === 1)
                d.x = vis.width/2 - vis.boxWidth/2;
                d.y = (vis.boxHeight + vis.gapHeightFaculty) * count[d.lvl] + vis.offsetHeightFaculty;
                count[d.lvl] += 1;
            }
        });

        let nodes = vis.svg.selectAll(".node").data(vis.Nodes, d=>d.id)
        nodes.exit().remove();

        let listSelectedCenters = vis.Nodes.filter((d) => d.lvl === 2).map(function(d){return d.name});
        let nodesEnter = nodes.enter().append("rect")
            .attr("class", "node")
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.lvl === 0){ return vis.boxWidthArea; }
                if(d.lvl === 2){ return vis.boxWidthCenter; }
                else{ return vis.boxWidth; }
            })
            .attr("height", function(d) {
                if(d.lvl === 0){ return vis.boxHeightArea; }
                if(d.lvl === 2){ return vis.boxHeightCenter; }
                else{ return vis.boxHeight; }
            })
            .attr("fill-opacity", d => d.lvl === 1 ? 0 : 0.8)
            .attr("stroke-width", d => d.lvl=== 1 ? 1 : 0)
            .attr("stroke", d => d.lvl === 1 ? "#ccc": "")
            .on("click", function () {
                let element = document.getElementById("reset-btn");
                element.removeAttribute("hidden");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                vis.filterData(d3.select(this).datum(), d3.select(this).datum().lvl);
            })
            

        nodes.merge(nodesEnter)
            .attr("fill", function(d){
                if(d.lvl === 0){ return vis.colorAreas(d.name); }
                else if(d.lvl === 2){ return "#efefef"; }
                else{ return "white"; }
            })
            .attr("x", function (d) { return d.x; })
            .transition()
            .duration(1000)
            .attr("y", function (d) { return d.y; })
            .attr("height", function(d) {
                if(d.lvl === 0){ return vis.boxHeightArea; }
                if(d.lvl === 2){ return vis.boxHeightCenter; }
                else{ return vis.boxHeight; }
            })

        let labels = vis.svg.selectAll(".label").data(vis.Nodes, d=>d.name)
        labels.exit().remove();

        let labelsEnter = labels.enter().append("text")
            .attr("class", "label")
            .style("font-size", "12px")
            .text(function (d) {
                return d.name;
                // if(d.name !== "Environmental Science & Engineering" && d.name !== "Materials Science & Mechanical Engineering"){
                //     return d.name;
                // }
            });

        labels.merge(labelsEnter)
            .attr("x", function (d) { return d.x + 7; })
            .transition()
            .duration(1000)
            .attr("y", function (d) {
                if(d.lvl === 0){
                    return d.y + vis.boxHeightArea/2+3;
                }else if(d.lvl === 2){
                    return d.y + vis.boxHeightCenter/2+3;
                }else{
                    return d.y + vis.boxHeight-5;
                }
            })

        // let offset_wrap = 7
        // vis.nodes_ESE = vis.Nodes.filter(obj => {
        //     return obj.name === "Environmental Science & Engineering"
        // })
        // if(vis.nodes_ESE.length > 0){
        //
        //     let ESE1 = vis.nodes_ESE[0]
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", ESE1.x + 7 )
        //         .attr("y", ESE1.y + vis.boxHeightArea/2+3 - offset_wrap)
        //         .style("font-size", "12px")
        //         .text("Environmental Science");
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", ESE1.x + 7 )
        //         .attr("y", ESE1.y + vis.boxHeightArea/2+3 + offset_wrap)
        //         .style("font-size", "12px")
        //         .text("& Engineering");
        // }
        //
        // vis.nodes_MSME = vis.Nodes.filter(obj => {
        //     return obj.name === "Materials Science & Mechanical Engineering"
        // })
        // if(vis.nodes_MSME.length > 0){
        //     let MSME1 = vis.nodes_MSME[0]
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", MSME1.x + 7 )
        //         .attr("y", MSME1.y + vis.boxHeightArea/2+3 - offset_wrap)
        //         .style("font-size", "12px")
        //         .text("Materials Science");
        //     vis.svg.append("text")
        //         .attr("class", "label")
        //         .attr("x", MSME1.x + 7 )
        //         .attr("y", MSME1.y + vis.boxHeightArea/2+3 + offset_wrap)
        //         .style("font-size", "12px")
        //         .text("& Mechanical Engineering");
        // }

        let links = vis.svg.selectAll(".link").data(vis.Links, d=>d.id)
        links.exit().remove();

        let linksEnter = links.enter().append("path", "g")
            .attr("class", "link")
            .attr("id", li => li.id);

        links.merge(linksEnter)
            .attr("stroke", function(li){
                if(li.target.lvl === 0){ return vis.colorAreas(li.target.name); }
                else{ return "#a5a5a5"; }
            })
            .transition()
            .duration(1000)
            .attr("d", function (li) {
                let oTarget;
                let oSource;

                if(li.target.lvl === 0){
                    oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeightArea,
                        y: li.target.x
                    };
                    oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight,
                        y: li.source.x
                    };

                    if (oSource.y < oTarget.y) {
                        oSource.y += vis.boxWidth;
                    } else {
                        oTarget.y += vis.boxWidthArea;
                    }
                } else{
                    oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeightCenter,
                        y: li.target.x
                    };
                    oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight,
                        y: li.source.x
                    };

                    if (oSource.y < oTarget.y) {
                        oSource.y += vis.boxWidth;
                    } else {
                        oTarget.y += vis.boxWidthCenter;
                    }
                }

                return vis.diagonal({
                    source: oSource,
                    target: oTarget
                });
            })

        // vis.svg.append("text")
        //     .attr("x", function(){
        //         let gap = (vis.width - 2*vis.boxWidthArea - 2*vis.boxWidth - vis.boxHeightCenter) / 4;
        //         return vis.boxWidthArea + vis.boxWidth + 2*gap;
        //     })
        //     .attr("y", function(){
        //         return (vis.boxHeightCenter + vis.gap.height) - 10;
        //     })
        //     .attr("text-anchor", "middle")
        //     .attr("class", "textMessage")
        //     .style("font-size", "16px")
        //     .style("font-weight", "bold")
        //     .text("Click on any node to highlight the connections!");
    }
}
