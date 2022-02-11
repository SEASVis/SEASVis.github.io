/* * * * * * * * * * * * * *
*      class visFlow2     *
* * * * * * * * * * * * * */

class visFlow2 {

    constructor(parentElement, data_faculty, data_mapAreasInterests, data_areas, data_interests, data_schools, data_centers){
        this.parentElement = parentElement;

        this.data_faculty = data_faculty;
        this.data_mapAreasInterests = data_mapAreasInterests;
        this.data_areas = data_areas;
        this.data_interests = data_interests;
        this.data_schools = data_schools;
        this.data_centers = data_centers;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 5, right: 5, bottom: 5, left: 5};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top)
            .style("fill", "white")
            .on("click", function () {
                vis.reset();
            });

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.count_mapAreasInterests = {};
        vis.data_mapAreasInterests.forEach(x => vis.count_mapAreasInterests[x.Area] = 1 + (vis.count_mapAreasInterests[x.Area] || 0))
        vis.count_interests = Object.values(vis.count_mapAreasInterests).reduce((a, b) => a + b)

        vis.list_faculty = vis.data_faculty.map(x => x['Title']);
        vis.count_faculty = vis.list_faculty.length;
        vis.halfCount_faculty = Math.ceil(vis.list_faculty.length / 2);
        vis.nodes_faculty1 = vis.list_faculty.splice(0, vis.halfCount_faculty)
            .map(x => ({'name': x}));
        vis.nodes_faculty2 = vis.list_faculty.splice(-vis.halfCount_faculty)
            .map(x => ({'name': x}));

        vis.nodes_areas1 = [...new Set(vis.data_areas.map(x => x['Area']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));
        vis.nodes_areas1.push({'name': 'Science, Technology, Innovation & Public Policy'})
        vis.nodes_areas2 = [...new Set(vis.data_areas.map(x => x['Area']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));
        vis.nodes_areas2.push({'name': 'Science, Technology, Innovation & Public Policy'})
        vis.count_areas = vis.nodes_areas1.length;

        vis.nodes_interest1 = [...new Set(vis.data_interests.map(x => x['Interest']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));
        vis.nodes_interest2 = [...new Set(vis.data_interests.map(x => x['Interest']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));

        vis.nodes_schools = [...new Set(vis.data_schools.map(x => x['School']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));
        vis.count_schools = vis.nodes_schools.length;

        vis.nodes_centers = [...new Set(vis.data_centers.map(x => x['Center']))]
            .sort(function(a,b){ return a.localeCompare(b); })
            .map(x => ({'name': x}));
        vis.count_centers = vis.nodes_centers.length;

        vis.links_areasFaculty1 = [];
        vis.links_interestsFaculty1 = [];
        vis.links_schoolsFaculty1 = [];
        vis.links_centersFaculty1 = [];
        vis.links_areasFaculty2 = [];
        vis.links_interestsFaculty2 = [];
        vis.links_schoolsFaculty2 = [];
        vis.links_centersFaculty2 = [];

        vis.data_areas.forEach(function(row){
            let title = row['Title'];
            let area = row['Area']

            if(vis.nodes_faculty1.map(x => x['name']).includes(title)){
                vis.links_areasFaculty1.push({
                    "source": title,
                    "target": area,
                })
            } else{
                vis.links_areasFaculty2.push({
                    "source": title,
                    "target": area,
                })
            }
        });

        vis.data_interests.forEach(function(row){
            let title = row['Title'];
            let interest = row['Interest']

            if(vis.nodes_faculty1.map(x => x['name']).includes(title)){
                vis.links_interestsFaculty1.push({
                    "source": title,
                    "target": interest,
                })
            } else{
                vis.links_interestsFaculty2.push({
                    "source": title,
                    "target": interest,
                })
            }
        });

        vis.data_schools.forEach(function(row){
            let title = row['Title'];
            let school = row['School']

            if(vis.nodes_faculty1.map(x => x['name']).includes(title)){
                vis.links_schoolsFaculty1.push({
                    "source": title,
                    "target": school,
                })
            } else {
                vis.links_schoolsFaculty2.push({
                    "source": title,
                    "target": school,
                })
            }
        });

        vis.data_centers.forEach(function(row){
            let title = row['Title'];
            let center = row['Center']

            if(vis.nodes_faculty1.map(x => x['name']).includes(title)){
                vis.links_centersFaculty1.push({
                    "source": title,
                    "target": center,
                })
            } else {
                vis.links_centersFaculty2.push({
                    "source": title,
                    "target": center,
                })
            }
        });

        vis.listColors_areas = ["#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca", "#ed1b34"]
        vis.listColors_interests = ["#005f61", "#929e1b", "#c28502", "#306298", "#e0bc00", "#3bb8c8", "#9d54b2", "#ae0e21"]
        vis.listColors_schools = ["#808080", "#696969"]
        vis.listColors_centers = ["#808080", "#696969"]
        vis.colors_areas = d3.scaleOrdinal().domain(vis.nodes_areas1.map(x=>x.name)).range(vis.listColors_areas)
        vis.colors_interests= d3.scaleOrdinal().domain(vis.nodes_areas1.map(x=>x.name)).range(vis.listColors_interests)
        vis.colors_schools = d3.scaleOrdinal().domain(vis.nodes_schools.map(x=>x.name)).range(vis.listColors_schools)
        vis.colors_centers = d3.scaleOrdinal().domain(vis.nodes_centers.map(x=>x.name)).range(vis.listColors_centers)

        //vis.updateVis();
        vis.updateVis_InterestsBoth([
            'Applied Mathematics',
            'Applied Physics',
            'Bioengineering',
            'Computer Science',
            'Electrical Engineering',
            'Environmental Science & Engineering',
            'Materials Science & Mechanical Engineering',
            'Science, Technology, Innovation & Public Policy']);
    }

    updateVis(){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        vis.count_lvl = 5;

        vis.boxWidth_faculty = 130;
        vis.boxWidth_areas = 200;
        vis.boxWidth_schools = 325;
        vis.boxWidth_centers = 325;

        vis.gap = {
            width: (vis.width - (2*vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers)) / (vis.count_lvl-1),
            height: 0.5
        };

        vis.boxHeight_faculty = 12;
        vis.boxHeight_areas = (vis.height - vis.count_areas*vis.gap.height) / vis.count_areas;

        vis.gap_schoolsCenters = 12;
        vis.count_schoolsCenters = vis.count_schools + vis.count_centers;
        vis.boxHeight_schoolsCenters = (vis.height - (vis.count_schoolsCenters*vis.gap.height +vis.gap_schoolsCenters))
            / vis.count_schoolsCenters;
        vis.offset_centers = (vis.boxHeight_schoolsCenters + vis.gap.height)*vis.count_schools + vis.gap_schoolsCenters;

        if(vis.height < 800){
            vis.offset_faculty1 = 0;
            vis.offset_faculty2 = 0;
        }else{
            vis.offset_faculty1 = (vis.height - (vis.halfCount_faculty * (vis.boxHeight_faculty+vis.gap.height))) / 2;
            vis.offset_faculty2 = (vis.height - ((vis.count_faculty - vis.halfCount_faculty) * (vis.boxHeight_faculty+vis.gap.height))) / 2;
        }

        vis.count_id = 0;

        vis.nodes_areas1.forEach(function(d,i){
            d.x = 0;
            d.y = (vis.boxHeight_areas + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_faculty1.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.gap.width;
            d.y = vis.offset_faculty1 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_schools.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_centers.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_centers + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_faculty2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + vis.boxWidth_centers + 3*vis.gap.width;
            d.y = vis.offset_faculty2 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_areas2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width;
            d.y = (vis.boxHeight_areas + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        })

        vis.links_areasFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_areas1.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_schoolsFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_schoolsFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_areasFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_areas2.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.svg.append("g")
            .attr("class", "nodes_areas1");
        let node_area1 = vis.svg.select(".nodes_areas1")
            .selectAll("g")
            .data(vis.nodes_areas1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_areas)
            .attr("height", vis.boxHeight_areas)
            .attr("fill", function(d){ return vis.colors_areas(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_areas/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty1");
        let node_faculty1 = vis.svg.select(".nodes_faculty1")
            .selectAll("g")
            .data(vis.nodes_faculty1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 1);
            });
        node_faculty1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_schools");
        let node_school = vis.svg.select(".nodes_schools")
            .selectAll("g")
            .data(vis.nodes_schools)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_school.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_schools(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_school(d3.select(this).datum());
            });
        node_school.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_centers");
        let node_center = vis.svg.select(".nodes_centers")
            .selectAll("g")
            .data(vis.nodes_centers)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_center.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_centers(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_center(d3.select(this).datum());
            });
        node_center.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty2");
        let node_faculty2 = vis.svg.select(".nodes_faculty2")
            .selectAll("g")
            .data(vis.nodes_faculty2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 2);
            });
        node_faculty2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_areas2");
        let node_area2 = vis.svg.select(".nodes_areas2")
            .selectAll("g")
            .data(vis.nodes_areas2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_areas)
            .attr("height", vis.boxHeight_areas)
            .attr("fill", function(d){ return vis.colors_areas(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_areas/2+3; })
            .text(function (d) { return d.name; });

        vis.links_areasFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_areas,
                        y: li.target.x + vis.boxWidth_areas
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_areas(li.target.name); });
        });

        vis.links_schoolsFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_schoolsFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_areasFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_areas,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_areas(li.target.name); });
        });
    }

    updateVis_Interests1(list_selectedAreas){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        vis.count_lvl = 5;

        vis.count_onAreas = list_selectedAreas.length;
        vis.count_offAreas = vis.count_areas - vis.count_onAreas;
        vis.count_onInterests = 0;
        list_selectedAreas.forEach(x => vis.count_onInterests = vis.count_onInterests + vis.count_mapAreasInterests[x])
        vis.count_schoolsCenters = vis.count_schools + vis.count_centers;

        vis.boxWidth_faculty = 140;
        vis.boxWidth_areas = 210;
        vis.boxWidth_interests = 200;
        vis.boxWidth_schools = 270;
        vis.boxWidth_centers = 270;

        vis.boxHeight_faculty = 11;
        vis.boxHeight_areas = 22;
        vis.boxHeight_interests = 11;
        vis.boxHeight_schoolsCenters = 11;

        vis.gap = {
            width: (vis.width - (2*vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers)) / (vis.count_lvl-1),
            height: 0.3
        };
        vis.gap_onAreas = 11;
        vis.gap_onAreas_bottom = 3;
        vis.gap_schoolsCenters = 11;

        vis.totalHeight_onAreas = 0;
        list_selectedAreas.forEach(function(x){
            let temp_height = 0;
            temp_height += vis.count_mapAreasInterests[x]*(vis.boxHeight_interests + vis.gap.height);
            temp_height += vis.gap_onAreas*2+vis.gap_onAreas_bottom;

            vis.totalHeight_onAreas += temp_height;
        })

        vis.offset_faculty1 = (vis.height - (vis.halfCount_faculty * (vis.boxHeight_faculty+vis.gap.height))) /2;
        vis.offset_faculty2 = (vis.height - ((vis.count_faculty - vis.halfCount_faculty) * (vis.boxHeight_faculty+vis.gap.height))) /2;
        vis.offset_areas = (vis.height - (vis.boxHeight_areas+vis.gap.height)*vis.count_areas) /2;
        vis.offset_areasInterests = (vis.height - vis.totalHeight_onAreas - vis.count_offAreas*(vis.boxHeight_areas+vis.gap.height))/2;
        vis.offset_schools = (vis.height - ((vis.boxHeight_schoolsCenters+vis.gap.height)*(vis.count_schools+vis.count_centers) + vis.gap_schoolsCenters)) /2;
        vis.offset_centers = vis.offset_schools + (vis.boxHeight_schoolsCenters+vis.gap.height)*vis.count_schools + vis.gap_schoolsCenters;

        vis.nodes_areasInterests1 = []
        vis.listOffset_areasInterests = [0]
        vis.count_offset = 0;

        vis.count_id = 0;
        vis.nodes_areas1.forEach(function(d){
            if(list_selectedAreas.includes(d.name)){
                vis.nodes_areasInterests1.push({
                    "name": d.name,
                    "x" : 0,
                    "y" : vis.offset_areasInterests + vis.listOffset_areasInterests[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": false
                })

                vis.count_id += 1;

                let tempCount_interest = 0;
                vis.data_mapAreasInterests.filter(x => x.Area === d.name).forEach(function(d){
                    vis.nodes_areasInterests1.push({
                        "name": d.Interest,
                        "x" : 0+10,
                        "y" : vis.offset_areasInterests +
                            vis.listOffset_areasInterests[vis.count_offset]+
                            2*vis.gap_onAreas +
                            (vis.boxHeight_interests + vis.gap.height)*tempCount_interest,
                        "id" : "n" + vis.count_id,
                        "Area": d.Area,
                        "isArea": false,
                        "hasLinks": true
                    })
                    tempCount_interest += 1;
                    vis.count_id += 1;
                })

                vis.listOffset_areasInterests.push(vis.listOffset_areasInterests[vis.count_offset]+
                    vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                    + vis.gap_onAreas*2+vis.gap_onAreas_bottom);
                vis.count_offset += 1;
            }else{
                vis.nodes_areasInterests1.push({
                    "name": d.name,
                    "x" : 0,
                    "y" : vis.offset_areasInterests +vis.listOffset_areasInterests[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": true
                })

                vis.count_id += 1;
                vis.listOffset_areasInterests.push(vis.listOffset_areasInterests[vis.count_offset]+
                    vis.boxHeight_areas+vis.gap.height);
                vis.count_offset += 1;
            }
        });
        vis.nodes_areas1 = vis.nodes_areasInterests1;

        vis.nodes_faculty1.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.gap.width;
            d.y = vis.offset_faculty1 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_schools.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_schools + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_centers.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_centers + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_faculty2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + vis.boxWidth_centers + 3*vis.gap.width;
            d.y = vis.offset_faculty2 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_areas2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width;
            d.y = vis.offset_areas + (vis.boxHeight_areas + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        })

        vis.svg.append("g")
            .attr("class", "nodes_areas1");
        let node_area1 = vis.svg.select(".nodes_areas1")
            .selectAll("g")
            .data(vis.nodes_areas1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.isArea === true){
                    return vis.boxWidth_areas;
                }else{
                    return vis.boxWidth_interests;
                }
            })
            .attr("height", function(d) {
                if(d.isArea === true && d.hasLinks === true){
                    return vis.boxHeight_areas;
                }else if(d.isArea === true && d.hasLinks === false){
                    return vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                        + vis.gap_onAreas*2+vis.gap_onAreas_bottom;
                }else{
                    return vis.boxHeight_interests;
                }
            })
            .attr("fill", function(d){
                if(d.isArea === true){
                    return vis.colors_areas(d.Area);
                }else{
                    return vis.colors_interests(d.Area)
                }
            })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) {
                if (d.isArea === true && d.hasLinks === true) {
                    return d.y + vis.boxHeight_areas/2+3;
                }else if(d.isArea === true && d.hasLinks === false){
                    return d.y + vis.gap_onAreas + 3
                }else{
                    return d.y + vis.boxHeight_interests/2+3;
                }
            })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty1");
        let node_faculty1 = vis.svg.select(".nodes_faculty1")
            .selectAll("g")
            .data(vis.nodes_faculty1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 1);
            });
        node_faculty1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_schools");
        let node_school = vis.svg.select(".nodes_schools")
            .selectAll("g")
            .data(vis.nodes_schools)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_school.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_schools(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_school(d3.select(this).datum());
            });
        node_school.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_centers");
        let node_center = vis.svg.select(".nodes_centers")
            .selectAll("g")
            .data(vis.nodes_centers)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_center.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_centers(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_center(d3.select(this).datum());
            });
        node_center.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty2");
        let node_faculty2 = vis.svg.select(".nodes_faculty2")
            .selectAll("g")
            .data(vis.nodes_faculty2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 2);
            });
        node_faculty2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_areas2");
        let node_area2 = vis.svg.select(".nodes_areas2")
            .selectAll("g")
            .data(vis.nodes_areas2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_areas)
            .attr("height", vis.boxHeight_areas)
            .attr("fill", function(d){ return vis.colors_areas(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_areas/2+3; })
            .text(function (d) { return d.name; });

        vis.list_faculty1 = vis.nodes_faculty1.map(x => x.name);
        vis.tempLinks_areasFaculty1 = vis.data_areas.filter(x => vis.list_faculty1.includes(x.Title)
            & vis.nodes_areasInterests1.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Area))
            .map(x => ({
                'source': vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests1.filter(y => {return y.name === x.Area})[0],
                'id': "l" +
                    vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests1.filter(y => {return y.name === x.Area})[0].id,
                'isArea': true}))
        vis.tempLinks_interestFaculty1 = vis.data_interests.filter(x => vis.list_faculty1.includes(x.Title)
            & vis.nodes_areasInterests1.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Interest))
            .map(x => ({
                'source': vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests1.filter(y => {return y.name === x.Interest})[0],
                'id': "l" +
                    vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests1.filter(y => {return y.name === x.Interest})[0].id,
                'isArea': false}))
        vis.links_areasInterestsFaculty1 = vis.tempLinks_areasFaculty1.concat(vis.tempLinks_interestFaculty1)
        vis.links_areasFaculty1 = vis.links_areasInterestsFaculty1;

        vis.links_schoolsFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_schoolsFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_areasFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_areas2.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_areasFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget;
                    let oSource;
                    if(li.isArea === true){
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_areas,
                            y: li.target.x + vis.boxWidth_areas
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x
                        };
                    }else{
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_interests,
                            y: li.target.x + vis.boxWidth_interests
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x
                        };
                    }
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){
                    if(li.isArea === true){
                        return vis.colors_areas(li.target.name);
                    }else{
                        let temp_area = vis.data_mapAreasInterests.filter(y => {return y.Interest === li.target.name})[0].Area;
                        return vis.colors_interests(temp_area);

                    }
                });
        });

        vis.links_schoolsFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_schoolsFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_areasFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_areas,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_areas(li.target.name); });
        });
    }

    updateVis_Interests2(list_selectedAreas){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        vis.count_lvl = 5;

        vis.count_onAreas = list_selectedAreas.length;
        vis.count_offAreas = vis.count_areas - vis.count_onAreas;
        vis.count_onInterests = 0;
        list_selectedAreas.forEach(x => vis.count_onInterests = vis.count_onInterests + vis.count_mapAreasInterests[x])
        vis.count_schoolsCenters = vis.count_schools + vis.count_centers;

        vis.boxWidth_faculty = 140;
        vis.boxWidth_areas = 210;
        vis.boxWidth_interests = 200;
        vis.boxWidth_schools = 270;
        vis.boxWidth_centers = 270;

        vis.boxHeight_faculty = 11;
        vis.boxHeight_areas = 22;
        vis.boxHeight_interests = 11;
        vis.boxHeight_schoolsCenters = 11;

        vis.gap = {
            width: (vis.width - (2*vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers)) / (vis.count_lvl-1),
            height: 0.3
        };
        vis.gap_onAreas = 11;
        vis.gap_onAreas_bottom = 3;
        vis.gap_schoolsCenters = 11;

        vis.totalHeight_onAreas = 0;
        list_selectedAreas.forEach(function(x){
            let temp_height = 0;
            temp_height += vis.count_mapAreasInterests[x]*(vis.boxHeight_interests + vis.gap.height);
            temp_height += vis.gap_onAreas*2+vis.gap_onAreas_bottom;

            vis.totalHeight_onAreas += temp_height;
        })

        vis.offset_faculty1 = (vis.height - (vis.halfCount_faculty * (vis.boxHeight_faculty+vis.gap.height))) /2;
        vis.offset_faculty2 = (vis.height - ((vis.count_faculty - vis.halfCount_faculty) * (vis.boxHeight_faculty+vis.gap.height))) /2;
        vis.offset_areas = (vis.height - (vis.boxHeight_areas+vis.gap.height)*vis.count_areas) /2;
        vis.offset_areasInterests = (vis.height - vis.totalHeight_onAreas - vis.count_offAreas*(vis.boxHeight_areas+vis.gap.height))/2;
        vis.offset_schools = (vis.height - ((vis.boxHeight_schoolsCenters+vis.gap.height)*(vis.count_schools+vis.count_centers) + vis.gap_schoolsCenters)) /2;
        vis.offset_centers = vis.offset_schools + (vis.boxHeight_schoolsCenters+vis.gap.height)*vis.count_schools + vis.gap_schoolsCenters;

        vis.nodes_areasInterests2 = []
        vis.listOffset_areasInterests = [0]
        vis.count_offset = 0;

        vis.count_id = 0;
        vis.nodes_areas2.forEach(function(d){
            if(list_selectedAreas.includes(d.name)){
                vis.nodes_areasInterests2.push({
                    "name": d.name,
                    "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width,
                    "y" : vis.offset_areasInterests + vis.listOffset_areasInterests[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": false
                })

                vis.count_id += 1;

                let tempCount_interest = 0;
                vis.data_mapAreasInterests.filter(x => x.Area === d.name).forEach(function(d){
                    vis.nodes_areasInterests2.push({
                        "name": d.Interest,
                        "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width + 10,
                        "y" : vis.offset_areasInterests +
                            vis.listOffset_areasInterests[vis.count_offset]+
                            2*vis.gap_onAreas +
                            (vis.boxHeight_interests + vis.gap.height)*tempCount_interest,
                        "id" : "n" + vis.count_id,
                        "Area": d.Area,
                        "isArea": false,
                        "hasLinks": true
                    })
                    tempCount_interest += 1;
                    vis.count_id += 1;
                })

                vis.listOffset_areasInterests.push(vis.listOffset_areasInterests[vis.count_offset]+
                    vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                    + vis.gap_onAreas*2+vis.gap_onAreas_bottom);
                vis.count_offset += 1;
            }else{
                vis.nodes_areasInterests2.push({
                    "name": d.name,
                    "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width,
                    "y" : vis.offset_areasInterests +vis.listOffset_areasInterests[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": true
                })

                vis.count_id += 1;
                vis.listOffset_areasInterests.push(vis.listOffset_areasInterests[vis.count_offset]+
                    vis.boxHeight_areas+vis.gap.height);
                vis.count_offset += 1;
            }
        });
        vis.nodes_areas2 = vis.nodes_areasInterests2;

        vis.nodes_faculty1.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.gap.width;
            d.y = vis.offset_faculty1 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_schools.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_schools + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_centers.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_centers + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_faculty2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + vis.boxWidth_centers + 3*vis.gap.width;
            d.y = vis.offset_faculty2 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_areas1.forEach(function(d,i){
            d.x = 0;
            d.y = vis.offset_areas + (vis.boxHeight_areas + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        })

        vis.svg.append("g")
            .attr("class", "nodes_areas2");
        let node_area2 = vis.svg.select(".nodes_areas2")
            .selectAll("g")
            .data(vis.nodes_areas2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.isArea === true){
                    return vis.boxWidth_areas;
                }else{
                    return vis.boxWidth_interests;
                }
            })
            .attr("height", function(d) {
                if(d.isArea === true && d.hasLinks === true){
                    return vis.boxHeight_areas;
                }else if(d.isArea === true && d.hasLinks === false){
                    return vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                        + vis.gap_onAreas*2+vis.gap_onAreas_bottom;
                }else{
                    return vis.boxHeight_interests;
                }
            })
            .attr("fill", function(d){
                if(d.isArea === true){
                    return vis.colors_areas(d.Area);
                }else{
                    return vis.colors_interests(d.Area)
                }
            })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) {
                if (d.isArea === true && d.hasLinks === true) {
                    return d.y + vis.boxHeight_areas/2+3;
                }else if(d.isArea === true && d.hasLinks === false){
                    return d.y + vis.gap_onAreas + 3
                }else{
                    return d.y + vis.boxHeight_interests/2+3;
                }
            })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty1");
        let node_faculty1 = vis.svg.select(".nodes_faculty1")
            .selectAll("g")
            .data(vis.nodes_faculty1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 1);
            });
        node_faculty1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_schools");
        let node_school = vis.svg.select(".nodes_schools")
            .selectAll("g")
            .data(vis.nodes_schools)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_school.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_schools(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_school(d3.select(this).datum());
            });
        node_school.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_centers");
        let node_center = vis.svg.select(".nodes_centers")
            .selectAll("g")
            .data(vis.nodes_centers)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_center.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_centers(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_center(d3.select(this).datum());
            });
        node_center.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty2");
        let node_faculty2 = vis.svg.select(".nodes_faculty2")
            .selectAll("g")
            .data(vis.nodes_faculty2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 2);
            });
        node_faculty2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_areas1");
        let node_area1 = vis.svg.select(".nodes_areas1")
            .selectAll("g")
            .data(vis.nodes_areas1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_areas)
            .attr("height", vis.boxHeight_areas)
            .attr("fill", function(d){ return vis.colors_areas(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_area(d3.select(this).datum());
            });
        node_area1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) { return d.y + vis.boxHeight_areas/2+3; })
            .text(function (d) { return d.name; });

        vis.list_faculty2 = vis.nodes_faculty2.map(x => x.name);
        vis.tempLinks_areasFaculty2 = vis.data_areas.filter(x => vis.list_faculty2.includes(x.Title)
            & vis.nodes_areasInterests2.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Area))
            .map(x => ({
                'source': vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests2.filter(y => {return y.name === x.Area})[0],
                'id': "l" +
                    vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests2.filter(y => {return y.name === x.Area})[0].id,
                'isArea': true}))
        vis.tempLinks_interestFaculty2 = vis.data_interests.filter(x => vis.list_faculty2.includes(x.Title)
            & vis.nodes_areasInterests2.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Interest))
            .map(x => ({
                'source': vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests2.filter(y => {return y.name === x.Interest})[0],
                'id': "l" +
                    vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests2.filter(y => {return y.name === x.Interest})[0].id,
                'isArea': false}))
        vis.links_areasInterestsFaculty2 = vis.tempLinks_areasFaculty2.concat(vis.tempLinks_interestFaculty2)
        vis.links_areasFaculty2 = vis.links_areasInterestsFaculty2;

        vis.links_schoolsFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_schoolsFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_areasFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_areas1.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_areasFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget;
                    let oSource;
                    if(li.isArea === true){
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_areas,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x + vis.boxWidth_faculty
                        };
                    }else{
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_interests,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x + vis.boxWidth_faculty
                        };
                    }
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){
                    if(li.isArea === true){
                        return vis.colors_areas(li.target.name);
                    }else{
                        let temp_area = vis.data_mapAreasInterests.filter(y => {return y.Interest === li.target.name})[0].Area;
                        return vis.colors_interests(temp_area);
                    }
                });
        });

        vis.links_schoolsFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_schoolsFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_areasFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_areas,
                        y: li.target.x + vis.boxWidth_areas
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_areas(li.target.name); });
        });
    }

    updateVis_InterestsBoth(list_selectedAreas){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };

        vis.count_lvl = 5;

        vis.count_onAreas = list_selectedAreas.length;
        vis.count_offAreas = vis.count_areas - vis.count_onAreas;
        vis.count_onInterests = 0;
        list_selectedAreas.forEach(x => vis.count_onInterests = vis.count_onInterests + vis.count_mapAreasInterests[x])
        vis.count_schoolsCenters = vis.count_schools + vis.count_centers;

        vis.boxWidth_faculty = 160;
        vis.boxWidth_areas = 240;
        vis.boxWidth_interests = 230;
        vis.boxWidth_schools = 300;
        vis.boxWidth_centers = 300;

        vis.gap = {
            width: (vis.width - (2*vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers)) / (vis.count_lvl-1),
            height: 0.3
        };
        vis.gap_onAreas = 7;
        vis.gap_onAreas_bottom = 1;
        vis.gap_schoolsCenters = 11;

        // vis.boxHeight_faculty = 11;
        vis.boxHeight_faculty = (vis.height - 10 - vis.halfCount_faculty*vis.gap.height) / vis.halfCount_faculty;
        vis.boxHeight_areas = 22;
        vis.count_totalAreasInterests = vis.count_areas + vis.count_interests
        vis.boxHeight_interests = (vis.height - vis.count_interests*(vis.gap.height) - vis.count_areas*(vis.gap_onAreas*2+vis.gap_onAreas_bottom)) / vis.count_interests
        vis.boxHeight_schoolsCenters = vis.boxHeight_faculty + 5;

        vis.totalHeight_onAreas = 0;
        list_selectedAreas.forEach(function(x){
            let temp_height = 0;
            temp_height += vis.count_mapAreasInterests[x]*(vis.boxHeight_interests + vis.gap.height);
            temp_height += vis.gap_onAreas*2+vis.gap_onAreas_bottom;

            vis.totalHeight_onAreas += temp_height;
        })

        vis.offset_faculty1 = (vis.height - (vis.halfCount_faculty * (vis.boxHeight_faculty+vis.gap.height))) /2;
        vis.offset_faculty2 = (vis.height - ((vis.count_faculty - vis.halfCount_faculty) * (vis.boxHeight_faculty+vis.gap.height))) /2;
        // vis.offset_areas = (vis.height - (vis.boxHeight_areas+vis.gap.height)*vis.count_areas) /2;
        vis.offset_areas = 0
        // vis.offset_areasInterests = (vis.height - vis.totalHeight_onAreas - vis.count_offAreas*(vis.boxHeight_areas+vis.gap.height))/2;
        vis.offset_areasInterests = 0
        vis.offset_schools = (vis.height - ((vis.boxHeight_schoolsCenters+vis.gap.height)*(vis.count_schools+vis.count_centers) + vis.gap_schoolsCenters)+20) /2;
        vis.offset_centers = vis.offset_schools + (vis.boxHeight_schoolsCenters+vis.gap.height)*vis.count_schools + vis.gap_schoolsCenters;

        vis.nodes_areasInterests1 = []
        vis.listOffset_areasInterests1 = [0]
        vis.count_offset = 0;

        vis.count_id = 0;
        vis.nodes_areas1.forEach(function(d){
            if(list_selectedAreas.includes(d.name)){
                vis.nodes_areasInterests1.push({
                    "name": d.name,
                    "x" : 0,
                    "y" : vis.offset_areasInterests + vis.listOffset_areasInterests1[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": false
                })

                vis.count_id += 1;

                let tempCount_interest = 0;
                vis.data_mapAreasInterests.filter(x => x.Area === d.name).forEach(function(d){
                    vis.nodes_areasInterests1.push({
                        "name": d.Interest,
                        "x" : 10,
                        "y" : vis.offset_areasInterests +
                            vis.listOffset_areasInterests1[vis.count_offset]+
                            2*vis.gap_onAreas +
                            (vis.boxHeight_interests + vis.gap.height)*tempCount_interest,
                        "id" : "n" + vis.count_id,
                        "Area": d.Area,
                        "isArea": false,
                        "hasLinks": true
                    })
                    tempCount_interest += 1;
                    vis.count_id += 1;
                })

                vis.listOffset_areasInterests1.push(vis.listOffset_areasInterests1[vis.count_offset]+
                    vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                    + vis.gap_onAreas*2+vis.gap_onAreas_bottom);
                vis.count_offset += 1;
            }else{
                vis.nodes_areasInterests1.push({
                    "name": d.name,
                    "x" : 0,
                    "y" : vis.offset_areasInterests +vis.listOffset_areasInterests1[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": true
                })

                vis.count_id += 1;
                vis.listOffset_areasInterests1.push(vis.listOffset_areasInterests1[vis.count_offset]+
                    vis.boxHeight_areas+vis.gap.height);
                vis.count_offset += 1;
            }
        });
        vis.nodes_areas1 = vis.nodes_areasInterests1;

        vis.nodes_faculty1.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.gap.width;
            d.y = vis.offset_faculty1 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_schools.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_schools + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_centers.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + 2*vis.gap.width;
            d.y = vis.offset_centers + (vis.boxHeight_schoolsCenters + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_faculty2.forEach(function(d,i){
            d.x = vis.boxWidth_areas + vis.boxWidth_faculty + vis.boxWidth_centers + 3*vis.gap.width;
            d.y = vis.offset_faculty2 + (vis.boxHeight_faculty + vis.gap.height) * i;
            d.id = "n" + vis.count_id;
            vis.count_id += 1;
        });

        vis.nodes_areasInterests2 = []
        vis.listOffset_areasInterests2 = [0]
        vis.count_offset = 0;

        vis.nodes_areas2.forEach(function(d){
            if(list_selectedAreas.includes(d.name)){
                vis.nodes_areasInterests2.push({
                    "name": d.name,
                    "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width,
                    "y" : vis.offset_areasInterests + vis.listOffset_areasInterests2[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": false
                })

                vis.count_id += 1;

                let tempCount_interest = 0;
                vis.data_mapAreasInterests.filter(x => x.Area === d.name).forEach(function(d){
                    vis.nodes_areasInterests2.push({
                        "name": d.Interest,
                        "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width + 10,
                        "y" : vis.offset_areasInterests +
                            vis.listOffset_areasInterests2[vis.count_offset]+
                            2*vis.gap_onAreas +
                            (vis.boxHeight_interests + vis.gap.height)*tempCount_interest,
                        "id" : "n" + vis.count_id,
                        "Area": d.Area,
                        "isArea": false,
                        "hasLinks": true
                    })
                    tempCount_interest += 1;
                    vis.count_id += 1;
                })

                vis.listOffset_areasInterests2.push(vis.listOffset_areasInterests2[vis.count_offset]+
                    vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                    + vis.gap_onAreas*2+vis.gap_onAreas_bottom);
                vis.count_offset += 1;
            }else{
                vis.nodes_areasInterests2.push({
                    "name": d.name,
                    "x" : vis.boxWidth_areas + 2*vis.boxWidth_faculty + vis.boxWidth_centers + 4*vis.gap.width,
                    "y" : vis.offset_areasInterests +vis.listOffset_areasInterests2[vis.count_offset],
                    "id" : "n" + vis.count_id,
                    "Area": d.name,
                    "isArea": true,
                    "hasLinks": true
                })

                vis.count_id += 1;
                vis.listOffset_areasInterests2.push(vis.listOffset_areasInterests2[vis.count_offset]+
                    vis.boxHeight_areas+vis.gap.height);
                vis.count_offset += 1;
            }
        });
        vis.nodes_areas2 = vis.nodes_areasInterests2;

        vis.svg.append("g")
            .attr("class", "nodes_areas1");
        let node_area1 = vis.svg.select(".nodes_areas1")
            .selectAll("g")
            .data(vis.nodes_areas1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.isArea === true){
                    return vis.boxWidth_areas;
                }else{
                    return vis.boxWidth_interests;
                }
            })
            .attr("height", function(d) {
                if(d.isArea === true && d.hasLinks === true){
                    return vis.boxHeight_areas;
                }else if(d.isArea === true && d.hasLinks === false){
                    return vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                        + vis.gap_onAreas*2+vis.gap_onAreas_bottom;
                }else{
                    return vis.boxHeight_interests;
                }
            })
            .attr("fill", function(d){
                if(d.isArea === true){
                    return vis.colors_areas(d.Area);
                }else{
                    return vis.colors_interests(d.Area)
                }
            })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function (d) {
                if(d3.select(this).datum().isArea === true){
                    vis.click_mainArea(d3.select(this).datum());
                }else{
                    vis.click_area(d3.select(this).datum());
                }
            });
        node_area1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) {
                if (d.isArea === true && d.hasLinks === true) {
                    return d.y + vis.boxHeight_areas/2+3;
                }else if(d.isArea === true && d.hasLinks === false){
                    return d.y + vis.gap_onAreas + 3
                }else{
                    return d.y + vis.boxHeight_interests/2+3;
                }
            })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty1");
        let node_faculty1 = vis.svg.select(".nodes_faculty1")
            .selectAll("g")
            .data(vis.nodes_faculty1)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty1.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 1);
            });
        node_faculty1.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_schools");
        let node_school = vis.svg.select(".nodes_schools")
            .selectAll("g")
            .data(vis.nodes_schools)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_school.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_schools(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_school(d3.select(this).datum());
            });
        node_school.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_centers");
        let node_center = vis.svg.select(".nodes_centers")
            .selectAll("g")
            .data(vis.nodes_centers)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_center.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_centers)
            .attr("height", vis.boxHeight_schoolsCenters)
            .attr("fill", function(d){ return vis.colors_centers(d.name); })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_center(d3.select(this).datum());
            });
        node_center.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) { return d.y + vis.boxHeight_schoolsCenters/2+3; })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_faculty2");
        let node_faculty2 = vis.svg.select(".nodes_faculty2")
            .selectAll("g")
            .data(vis.nodes_faculty2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_faculty2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth_faculty)
            .attr("height", vis.boxHeight_faculty)
            .attr("fill", "#ed1b34")
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                vis.click_faculty(d3.select(this).datum(), 2);
            });
        node_faculty2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) { return d.y + vis.boxHeight_faculty-3; })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.svg.append("g")
            .attr("class", "nodes_areas2");
        let node_area2 = vis.svg.select(".nodes_areas2")
            .selectAll("g")
            .data(vis.nodes_areas2)
            .enter()
            .append("g")
            .attr("class", "unit");
        node_area2.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", function(d) {
                if(d.isArea === true){
                    return vis.boxWidth_areas;
                }else{
                    return vis.boxWidth_interests;
                }
            })
            .attr("height", function(d) {
                if(d.isArea === true && d.hasLinks === true){
                    return vis.boxHeight_areas;
                }else if(d.isArea === true && d.hasLinks === false){
                    return vis.count_mapAreasInterests[d.name]*(vis.boxHeight_interests + vis.gap.height)
                        + vis.gap_onAreas*2+vis.gap_onAreas_bottom;
                }else{
                    return vis.boxHeight_interests;
                }
            })
            .attr("fill", function(d){
                if(d.isArea === true){
                    return vis.colors_areas(d.Area);
                }else{
                    return vis.colors_interests(d.Area)
                }
            })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("click", function () {
                if(d3.select(this).datum().isArea === true){
                    vis.click_mainArea(d3.select(this).datum());
                }else{
                    vis.click_area(d3.select(this).datum());
                }
            });
        node_area2.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 7; })
            .attr("y", function (d) {
                if (d.isArea === true && d.hasLinks === true) {
                    return d.y + vis.boxHeight_areas/2+3;
                }else if(d.isArea === true && d.hasLinks === false){
                    return d.y + vis.gap_onAreas + 3
                }else{
                    return d.y + vis.boxHeight_interests/2+3;
                }
            })
            .style("font-size", "9px")
            .text(function (d) { return d.name; });

        vis.list_faculty1 = vis.nodes_faculty1.map(x => x.name);
        vis.tempLinks_areasFaculty1 = vis.data_areas.filter(x => vis.list_faculty1.includes(x.Title)
            & vis.nodes_areasInterests1.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Area))
            .map(x => ({
                'source': vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests1.filter(y => {return y.name === x.Area})[0],
                'id': "l" +
                    vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests1.filter(y => {return y.name === x.Area})[0].id,
                'isArea': true}))
        vis.tempLinks_interestFaculty1 = vis.data_interests.filter(x => vis.list_faculty1.includes(x.Title)
            & vis.nodes_areasInterests1.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Interest))
            .map(x => ({
                'source': vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests1.filter(y => {return y.name === x.Interest})[0],
                'id': "l" +
                    vis.nodes_faculty1.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests1.filter(y => {return y.name === x.Interest})[0].id,
                'isArea': false}))
        vis.links_areasInterestsFaculty1 = vis.tempLinks_areasFaculty1.concat(vis.tempLinks_interestFaculty1)
        vis.links_areasFaculty1 = vis.links_areasInterestsFaculty1;

        vis.links_schoolsFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty1.forEach(function(d){
            d.source = vis.nodes_faculty1.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_schoolsFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_schools.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.links_centersFaculty2.forEach(function(d){
            d.source = vis.nodes_faculty2.filter(x => {return x.name === d.source})[0];
            d.target = vis.nodes_centers.filter(x => {return x.name === d.target})[0];
            d.id = "l" + d.source.id + d.target.id;
        });

        vis.list_faculty2 = vis.nodes_faculty2.map(x => x.name);
        vis.tempLinks_areasFaculty2 = vis.data_areas.filter(x => vis.list_faculty2.includes(x.Title)
            & vis.nodes_areasInterests2.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Area))
            .map(x => ({
                'source': vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests2.filter(y => {return y.name === x.Area})[0],
                'id': "l" +
                    vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests2.filter(y => {return y.name === x.Area})[0].id,
                'isArea': true}))
        vis.tempLinks_interestFaculty2 = vis.data_interests.filter(x => vis.list_faculty2.includes(x.Title)
            & vis.nodes_areasInterests2.filter(x => (x.hasLinks === true)).map(x => x.name).includes(x.Interest))
            .map(x => ({
                'source': vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0],
                'target': vis.nodes_areasInterests2.filter(y => {return y.name === x.Interest})[0],
                'id': "l" +
                    vis.nodes_faculty2.filter(y => {return y.name === x.Title})[0].id +
                    vis.nodes_areasInterests2.filter(y => {return y.name === x.Interest})[0].id,
                'isArea': false}))
        vis.links_areasInterestsFaculty2 = vis.tempLinks_areasFaculty2.concat(vis.tempLinks_interestFaculty2)
        vis.links_areasFaculty2 = vis.links_areasInterestsFaculty2;

        vis.links_areasFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget;
                    let oSource;
                    if(li.isArea === true){
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_areas,
                            y: li.target.x + vis.boxWidth_areas
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x
                        };
                    }else{
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_interests,
                            y: li.target.x + vis.boxWidth_interests
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x
                        };
                    }
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){
                    if(li.isArea === true){
                        return vis.colors_areas(li.target.name);
                    }else{
                        let temp_area = vis.data_mapAreasInterests.filter(y => {return y.Interest === li.target.name})[0].Area;
                        return vis.colors_interests(temp_area);

                    }
                });
        });

        vis.links_schoolsFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty1.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x + vis.boxWidth_faculty
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_schoolsFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_schools(li.target.name); });
        });

        vis.links_centersFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget = {
                        x: li.target.y + 0.5 * vis.boxHeight_schoolsCenters,
                        y: li.target.x + vis.boxWidth_centers
                    };
                    let oSource = {
                        x: li.source.y + 0.5 * vis.boxHeight_faculty,
                        y: li.source.x
                    };
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){ return vis.colors_centers(li.target.name); });
        });

        vis.links_areasFaculty2.forEach(function(li){
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget;
                    let oSource;
                    if(li.isArea === true){
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_areas,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x + vis.boxWidth_faculty
                        };
                    }else{
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeight_interests,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight_faculty,
                            y: li.source.x + vis.boxWidth_faculty
                        };
                    }
                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){
                    if(li.isArea === true){
                        return vis.colors_areas(li.target.name);
                    }else{
                        let temp_area = vis.data_mapAreasInterests.filter(y => {return y.Interest === li.target.name})[0].Area;
                        return vis.colors_interests(temp_area);
                    }
                });
        });

        vis.svg.append("text")
            .attr("x", function(){
                let gap = (vis.width - 2*vis.boxWidthArea - 2*vis.boxWidth - vis.boxHeightCenter) / 4;
                return vis.width/2;
            })
            .attr("y", function(){
                return vis.offset_schools - 10;
            })
            .attr("text-anchor", "middle")
            .attr("class", "textMessage")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Click on any node to highlight the connections!");
    }

    repress(active_nodes, active_links){
        let vis = this;

        vis.nodes_areas1.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })
        vis.nodes_faculty1.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })
        vis.nodes_schools.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })
        vis.nodes_centers.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })
        vis.nodes_faculty2.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })
        vis.nodes_areas2.forEach(function(d){
            if(!active_nodes.includes(d)){
                d3.select("#" + d.id).classed("repressNode", true);
            }else{
                d3.select("#" + d.id).classed("repressNode", false);
            }
        })

        vis.links_areasFaculty1.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
        vis.links_schoolsFaculty1.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
        vis.links_centersFaculty1.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
        vis.links_schoolsFaculty2.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
        vis.links_centersFaculty2.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
        vis.links_areasFaculty2.forEach(function(d){
            if(!active_links.includes(d)){
                d3.select("#" + d.id).classed("activeLink", false);
                d3.select("#" + d.id).classed("repressLink", true);
            }else{
                d3.select("#" + d.id).classed("activeLink", true);
                d3.select("#" + d.id).classed("repressLink", false);
            }
        })
    }

    click_area(val){
        let vis = this;

        let active_nodes = [];
        let active_links = [];

        let area1 = vis.nodes_areas1.filter(x => { return x.name === val.name})[0];
        active_nodes.push(area1);
        let area2 = vis.nodes_areas2.filter(x => { return x.name === val.name})[0];
        active_nodes.push(area2);

        let temp_area1 = vis.data_mapAreasInterests.filter(x=>x.Interest === val.name)[0].Area;
        let tempNode_area1 = vis.nodes_areas1.filter(x => x.name === temp_area1)[0];
        if(!active_nodes.includes(tempNode_area1)){
            active_nodes.push(tempNode_area1);
        }
        let temp_area2 = vis.data_mapAreasInterests.filter(x=>x.Interest === val.name)[0].Area;
        let tempNode_area2 = vis.nodes_areas2.filter(x => x.name === temp_area2)[0];
        if(!active_nodes.includes(tempNode_area2)){
            active_nodes.push(tempNode_area2);
        }

        vis.links_areasFaculty1.forEach(function(d){
            if(d.target.id === area1.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_areasFaculty2.forEach(function(d){
            if(d.target.id === area2.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_schoolsFaculty1.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }
            }
        })

        vis.links_centersFaculty1.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }
            }
        })

        vis.links_schoolsFaculty2.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }
            }
        })

        vis.links_centersFaculty2.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }
            }
        })

        vis.repress(active_nodes, active_links);
    }

    click_mainArea(val){
        let vis = this;

        let active_nodes = [];
        let active_links = [];

        let tempList_interests = vis.nodes_areas1.filter(x => x.Area === val.name && x.isArea === false);
        tempList_interests.forEach(function(val){
            let area1 = vis.nodes_areas1.filter(x => { return x.name === val.name})[0];
            active_nodes.push(area1);
            let area2 = vis.nodes_areas2.filter(x => { return x.name === val.name})[0];
            active_nodes.push(area2);

            let temp_area1 = vis.data_mapAreasInterests.filter(x=>x.Interest === val.name)[0].Area;
            let tempNode_area1 = vis.nodes_areas1.filter(x => x.name === temp_area1)[0];
            if(!active_nodes.includes(tempNode_area1)){
                active_nodes.push(tempNode_area1);
            }
            let temp_area2 = vis.data_mapAreasInterests.filter(x=>x.Interest === val.name)[0].Area;
            let tempNode_area2 = vis.nodes_areas2.filter(x => x.name === temp_area2)[0];
            if(!active_nodes.includes(tempNode_area2)){
                active_nodes.push(tempNode_area2);
            }

            vis.links_areasFaculty1.forEach(function(d){
                if(d.target.id === area1.id){
                    active_links.push(d)
                    active_nodes.push(d.source)
                }
            })

            vis.links_areasFaculty2.forEach(function(d){
                if(d.target.id === area2.id){
                    active_links.push(d)
                    active_nodes.push(d.source)
                }
            })

            vis.links_schoolsFaculty1.forEach(function(d){
                if(active_nodes.includes(d.source)){
                    active_links.push(d)
                    if(!active_nodes.includes(d.target)) {
                        active_nodes.push(d.target)
                    }
                }
            })

            vis.links_centersFaculty1.forEach(function(d){
                if(active_nodes.includes(d.source)){
                    active_links.push(d)
                    if(!active_nodes.includes(d.target)) {
                        active_nodes.push(d.target)
                    }
                }
            })

            vis.links_schoolsFaculty2.forEach(function(d){
                if(active_nodes.includes(d.source)){
                    active_links.push(d)
                    if(!active_nodes.includes(d.target)) {
                        active_nodes.push(d.target)
                    }
                }
            })

            vis.links_centersFaculty2.forEach(function(d){
                if(active_nodes.includes(d.source)){
                    active_links.push(d)
                    if(!active_nodes.includes(d.target)) {
                        active_nodes.push(d.target)
                    }
                }
            })
        })

        vis.repress(active_nodes, active_links);
    }

    click_faculty(val, half){
        let vis = this;

        let active_nodes = [];
        let active_links = [];

        if(half === 1){
            let faculty = vis.nodes_faculty1.filter(x => { return x.name === val.name})[0];
            active_nodes.push(faculty);

            // let tempList_departments = vis.data_areas.filter(x => x.Title === faculty.name).map(x => x.Area)
            // tempList_departments.forEach(function(d){
            //     let tempNode_departments = vis.nodes_areas1.filter(x => x.name === d)[0].id;
            //     d3.select("#" + tempNode_departments).classed("departmentNode", true);
            // })

            vis.links_areasFaculty1.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)

                    let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                    let tempNode_area = vis.nodes_areas1.filter(x => x.name === temp_area)[0];
                    if(!active_nodes.includes(tempNode_area)){
                        active_nodes.push(tempNode_area);
                    }
                }
            })

            vis.links_schoolsFaculty1.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)
                }
            })

            vis.links_centersFaculty1.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)
                }
            })
        }else{
            let faculty = vis.nodes_faculty2.filter(x => { return x.name === val.name})[0];
            active_nodes.push(faculty);

            vis.links_areasFaculty2.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)
                }

                let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                let tempNode_area = vis.nodes_areas2.filter(x => x.name === temp_area)[0];
                if(!active_nodes.includes(tempNode_area)){
                    active_nodes.push(tempNode_area);
                }
            })

            vis.links_schoolsFaculty2.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)
                }
            })

            vis.links_centersFaculty2.forEach(function(d){
                if(d.source.id === faculty.id){
                    active_links.push(d)
                    active_nodes.push(d.target)
                }
            })
        }

        vis.repress(active_nodes, active_links);
    }

    click_school(val){
        let vis = this;

        let active_nodes = [];
        let active_links = [];

        let school = vis.nodes_schools.filter(x => { return x.name === val.name})[0];
        active_nodes.push(school);

        vis.links_schoolsFaculty1.forEach(function(d){
            if(d.target.id === school.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_schoolsFaculty2.forEach(function(d){
            if(d.target.id === school.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_areasFaculty1.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }

                let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                let tempNode_area = vis.nodes_areas1.filter(x => x.name === temp_area)[0];
                if(!active_nodes.includes(tempNode_area)){
                    active_nodes.push(tempNode_area);
                }
            }
        })

        vis.links_areasFaculty2.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }

                let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                let tempNode_area = vis.nodes_areas2.filter(x => x.name === temp_area)[0];
                if(!active_nodes.includes(tempNode_area)){
                    active_nodes.push(tempNode_area);
                }
            }
        })

        vis.repress(active_nodes, active_links);
    }

    click_center(val){
        let vis = this;

        let active_nodes = [];
        let active_links = [];

        let center = vis.nodes_centers.filter(x => { return x.name === val.name})[0];
        active_nodes.push(center);

        vis.links_centersFaculty1.forEach(function(d){
            if(d.target.id === center.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_centersFaculty2.forEach(function(d){
            if(d.target.id === center.id){
                active_links.push(d)
                active_nodes.push(d.source)
            }
        })

        vis.links_areasFaculty1.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }

                let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                let tempNode_area = vis.nodes_areas1.filter(x => x.name === temp_area)[0];
                if(!active_nodes.includes(tempNode_area)){
                    active_nodes.push(tempNode_area);
                }
            }
        })

        vis.links_areasFaculty2.forEach(function(d){
            if(active_nodes.includes(d.source)){
                active_links.push(d)
                if(!active_nodes.includes(d.target)) {
                    active_nodes.push(d.target)
                }

                let temp_area = vis.data_mapAreasInterests.filter(x=>x.Interest === d.target.name)[0].Area;
                let tempNode_area = vis.nodes_areas2.filter(x => x.name === temp_area)[0];
                if(!active_nodes.includes(tempNode_area)){
                    active_nodes.push(tempNode_area);
                }
            }
        })

        vis.repress(active_nodes, active_links);
    }

    reset(){
        let vis = this;

        vis.nodes_areas1.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })
        vis.nodes_faculty1.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })
        vis.nodes_schools.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })
        vis.nodes_centers.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })
        vis.nodes_faculty2.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })
        vis.nodes_areas2.forEach(function(d){ d3.select("#" + d.id).classed("repressNode", false); })

        vis.links_areasFaculty1.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
        vis.links_schoolsFaculty1.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
        vis.links_centersFaculty1.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
        vis.links_schoolsFaculty2.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
        vis.links_centersFaculty2.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
        vis.links_areasFaculty2.forEach(function(d){
            d3.select("#" + d.id).classed("activeLink", false);
            d3.select("#" + d.id).classed("repressLink", false);
        })
    }
}
