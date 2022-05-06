class visArc {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = Object.assign(data);

        // console.log(data, this.data)


        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 5, bottom: 0, left: 0};
        vis.width = $("#" + vis.parentElement).width() ;
        vis.height = $("#" + vis.parentElement).height();

        vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height*2 + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 6}, ${vis.margin.top})`)

        // .attr('transform', 'rotate(45deg)');

        vis.svg
            .append("rect")
            .attr("width", vis.width+50)
            .attr("height", vis.height*2)
            .attr("x", -300)
            .attr("y", -50)
            .style("fill", "white")
            .style("fill-opacity", 0)
            .on("click", function () {
                console.log('clicked rect');
                vis.reset();
            });
        vis.miserables = {
            nodes: [
                {nodeName: "Myriel", group: 1},
                {nodeName: "Napoleon", group: 1},
                {nodeName: "Mlle. Baptistine", group: 1},
                {nodeName: "Mme. Magloire", group: 1},
                {nodeName: "Countess de Lo", group: 1},
                {nodeName: "Geborand", group: 1},
                {nodeName: "Champtercier", group: 1},
                {nodeName: "Cravatte", group: 1},
                {nodeName: "Count", group: 1},
                {nodeName: "Old Man", group: 1},
                {nodeName: "Labarre", group: 2},
                {nodeName: "Valjean", group: 2},
                {nodeName: "Marguerite", group: 3},
                {nodeName: "Mme. de R", group: 2},
                {nodeName: "Isabeau", group: 2},
                {nodeName: "Gervais", group: 2},
                {nodeName: "Tholomyes", group: 3},
                {nodeName: "Listolier", group: 3},
                {nodeName: "Fameuil", group: 3},
                {nodeName: "Blacheville", group: 3},
                {nodeName: "Favourite", group: 3},
                {nodeName: "Dahlia", group: 3},
                {nodeName: "Zephine", group: 3},
                {nodeName: "Fantine", group: 3},
                {nodeName: "Mme. Thenardier", group: 4},
                {nodeName: "Thenardier", group: 4},
                {nodeName: "Cosette", group: 5},
                {nodeName: "Javert", group: 4},
                {nodeName: "Fauchelevent", group: 0},
                {nodeName: "Bamatabois", group: 2},
                {nodeName: "Perpetue", group: 3},
                {nodeName: "Simplice", group: 2},
                {nodeName: "Scaufflaire", group: 2},
                {nodeName: "Woman 1", group: 2},
                {nodeName: "Judge", group: 2},
                {nodeName: "Champmathieu", group: 2},
                {nodeName: "Brevet", group: 2},
                {nodeName: "Chenildieu", group: 2},
                {nodeName: "Cochepaille", group: 2},
                {nodeName: "Pontmercy", group: 4},
                {nodeName: "Boulatruelle", group: 6},
                {nodeName: "Eponine", group: 4},
                {nodeName: "Anzelma", group: 4},
                {nodeName: "Woman 2", group: 5},
                {nodeName: "Mother Innocent", group: 0},
                {nodeName: "Gribier", group: 0},
                {nodeName: "Jondrette", group: 7},
                {nodeName: "Mme. Burgon", group: 7},
                {nodeName: "Gavroche", group: 8},
                {nodeName: "Gillenormand", group: 5},
                {nodeName: "Magnon", group: 5},
                {nodeName: "Mlle. Gillenormand", group: 5},
                {nodeName: "Mme. Pontmercy", group: 5},
                {nodeName: "Mlle. Vaubois", group: 5},
                {nodeName: "Lt. Gillenormand", group: 5},
                {nodeName: "Marius", group: 8},
                {nodeName: "Baroness T", group: 5},
                {nodeName: "Mabeuf", group: 8},
                {nodeName: "Enjolras", group: 8},
                {nodeName: "Combeferre", group: 8},
                {nodeName: "Prouvaire", group: 8},
                {nodeName: "Feuilly", group: 8},
                {nodeName: "Courfeyrac", group: 8},
                {nodeName: "Bahorel", group: 8},
                {nodeName: "Bossuet", group: 8},
                {nodeName: "Joly", group: 8},
                {nodeName: "Grantaire", group: 8},
                {nodeName: "Mother Plutarch", group: 9},
                {nodeName: "Gueulemer", group: 4},
                {nodeName: "Babet", group: 4},
                {nodeName: "Claquesous", group: 4},
                {nodeName: "Montparnasse", group: 4},
                {nodeName: "Toussaint", group: 5},
                {nodeName: "Child 1", group: 10},
                {nodeName: "Child 2", group: 10},
                {nodeName: "Brujon", group: 4},
                {nodeName: "Mme. Hucheloup", group: 8}
            ],
            links: [
                {source: 1, target: 0, value: 1},
                {source: 2, target: 0, value: 8},
                {source: 3, target: 0, value: 10},
                {source: 3, target: 2, value: 6},
                {source: 4, target: 0, value: 1},
                {source: 5, target: 0, value: 1},
                {source: 6, target: 0, value: 1},
                {source: 7, target: 0, value: 1},
                {source: 8, target: 0, value: 2},
                {source: 9, target: 0, value: 1},
                {source: 11, target: 10, value: 1},
                {source: 11, target: 3, value: 3},
                {source: 11, target: 2, value: 3},
                {source: 11, target: 0, value: 5},
                {source: 12, target: 11, value: 1},
                {source: 13, target: 11, value: 1},
                {source: 14, target: 11, value: 1},
                {source: 15, target: 11, value: 1},
                {source: 17, target: 16, value: 4},
                {source: 18, target: 16, value: 4},
                {source: 18, target: 17, value: 4},
                {source: 19, target: 16, value: 4},
                {source: 19, target: 17, value: 4},
                {source: 19, target: 18, value: 4},
                {source: 20, target: 16, value: 3},
                {source: 20, target: 17, value: 3},
                {source: 20, target: 18, value: 3},
                {source: 20, target: 19, value: 4},
                {source: 21, target: 16, value: 3},
                {source: 21, target: 17, value: 3},
                {source: 21, target: 18, value: 3},
                {source: 21, target: 19, value: 3},
                {source: 21, target: 20, value: 5},
                {source: 22, target: 16, value: 3},
                {source: 22, target: 17, value: 3},
                {source: 22, target: 18, value: 3},
                {source: 22, target: 19, value: 3},
                {source: 22, target: 20, value: 4},
                {source: 22, target: 21, value: 4},
                {source: 23, target: 16, value: 3},
                {source: 23, target: 17, value: 3},
                {source: 23, target: 18, value: 3},
                {source: 23, target: 19, value: 3},
                {source: 23, target: 20, value: 4},
                {source: 23, target: 21, value: 4},
                {source: 23, target: 22, value: 4},
                {source: 23, target: 12, value: 2},
                {source: 23, target: 11, value: 9},
                {source: 24, target: 23, value: 2},
                {source: 24, target: 11, value: 7},
                {source: 25, target: 24, value: 13},
                {source: 25, target: 23, value: 1},
                {source: 25, target: 11, value: 12},
                {source: 26, target: 24, value: 4},
                {source: 26, target: 11, value: 31},
                {source: 26, target: 16, value: 1},
                {source: 26, target: 25, value: 1},
                {source: 27, target: 11, value: 17},
                {source: 27, target: 23, value: 5},
                {source: 27, target: 25, value: 5},
                {source: 27, target: 24, value: 1},
                {source: 27, target: 26, value: 1},
                {source: 28, target: 11, value: 8},
                {source: 28, target: 27, value: 1},
                {source: 29, target: 23, value: 1},
                {source: 29, target: 27, value: 1},
                {source: 29, target: 11, value: 2},
                {source: 30, target: 23, value: 1},
                {source: 31, target: 30, value: 2},
                {source: 31, target: 11, value: 3},
                {source: 31, target: 23, value: 2},
                {source: 31, target: 27, value: 1},
                {source: 32, target: 11, value: 1},
                {source: 33, target: 11, value: 2},
                {source: 33, target: 27, value: 1},
                {source: 34, target: 11, value: 3},
                {source: 34, target: 29, value: 2},
                {source: 35, target: 11, value: 3},
                {source: 35, target: 34, value: 3},
                {source: 35, target: 29, value: 2},
                {source: 36, target: 34, value: 2},
                {source: 36, target: 35, value: 2},
                {source: 36, target: 11, value: 2},
                {source: 36, target: 29, value: 1},
                {source: 37, target: 34, value: 2},
                {source: 37, target: 35, value: 2},
                {source: 37, target: 36, value: 2},
                {source: 37, target: 11, value: 2},
                {source: 37, target: 29, value: 1},
                {source: 38, target: 34, value: 2},
                {source: 38, target: 35, value: 2},
                {source: 38, target: 36, value: 2},
                {source: 38, target: 37, value: 2},
                {source: 38, target: 11, value: 2},
                {source: 38, target: 29, value: 1},
                {source: 39, target: 25, value: 1},
                {source: 40, target: 25, value: 1},
                {source: 41, target: 24, value: 2},
                {source: 41, target: 25, value: 3},
                {source: 42, target: 41, value: 2},
                {source: 42, target: 25, value: 2},
                {source: 42, target: 24, value: 1},
                {source: 43, target: 11, value: 3},
                {source: 43, target: 26, value: 1},
                {source: 43, target: 27, value: 1},
                {source: 44, target: 28, value: 3},
                {source: 44, target: 11, value: 1},
                {source: 45, target: 28, value: 2},
                {source: 47, target: 46, value: 1},
                {source: 48, target: 47, value: 2},
                {source: 48, target: 25, value: 1},
                {source: 48, target: 27, value: 1},
                {source: 48, target: 11, value: 1},
                {source: 49, target: 26, value: 3},
                {source: 49, target: 11, value: 2},
                {source: 50, target: 49, value: 1},
                {source: 50, target: 24, value: 1},
                {source: 51, target: 49, value: 9},
                {source: 51, target: 26, value: 2},
                {source: 51, target: 11, value: 2},
                {source: 52, target: 51, value: 1},
                {source: 52, target: 39, value: 1},
                {source: 53, target: 51, value: 1},
                {source: 54, target: 51, value: 2},
                {source: 54, target: 49, value: 1},
                {source: 54, target: 26, value: 1},
                {source: 55, target: 51, value: 6},
                {source: 55, target: 49, value: 12},
                {source: 55, target: 39, value: 1},
                {source: 55, target: 54, value: 1},
                {source: 55, target: 26, value: 21},
                {source: 55, target: 11, value: 19},
                {source: 55, target: 16, value: 1},
                {source: 55, target: 25, value: 2},
                {source: 55, target: 41, value: 5},
                {source: 55, target: 48, value: 4},
                {source: 56, target: 49, value: 1},
                {source: 56, target: 55, value: 1},
                {source: 57, target: 55, value: 1},
                {source: 57, target: 41, value: 1},
                {source: 57, target: 48, value: 1},
                {source: 58, target: 55, value: 7},
                {source: 58, target: 48, value: 7},
                {source: 58, target: 27, value: 6},
                {source: 58, target: 57, value: 1},
                {source: 58, target: 11, value: 4},
                {source: 59, target: 58, value: 15},
                {source: 59, target: 55, value: 5},
                {source: 59, target: 48, value: 6},
                {source: 59, target: 57, value: 2},
                {source: 60, target: 48, value: 1},
                {source: 60, target: 58, value: 4},
                {source: 60, target: 59, value: 2},
                {source: 61, target: 48, value: 2},
                {source: 61, target: 58, value: 6},
                {source: 61, target: 60, value: 2},
                {source: 61, target: 59, value: 5},
                {source: 61, target: 57, value: 1},
                {source: 61, target: 55, value: 1},
                {source: 62, target: 55, value: 9},
                {source: 62, target: 58, value: 17},
                {source: 62, target: 59, value: 13},
                {source: 62, target: 48, value: 7},
                {source: 62, target: 57, value: 2},
                {source: 62, target: 41, value: 1},
                {source: 62, target: 61, value: 6},
                {source: 62, target: 60, value: 3},
                {source: 63, target: 59, value: 5},
                {source: 63, target: 48, value: 5},
                {source: 63, target: 62, value: 6},
                {source: 63, target: 57, value: 2},
                {source: 63, target: 58, value: 4},
                {source: 63, target: 61, value: 3},
                {source: 63, target: 60, value: 2},
                {source: 63, target: 55, value: 1},
                {source: 64, target: 55, value: 5},
                {source: 64, target: 62, value: 12},
                {source: 64, target: 48, value: 5},
                {source: 64, target: 63, value: 4},
                {source: 64, target: 58, value: 10},
                {source: 64, target: 61, value: 6},
                {source: 64, target: 60, value: 2},
                {source: 64, target: 59, value: 9},
                {source: 64, target: 57, value: 1},
                {source: 64, target: 11, value: 1},
                {source: 65, target: 63, value: 5},
                {source: 65, target: 64, value: 7},
                {source: 65, target: 48, value: 3},
                {source: 65, target: 62, value: 5},
                {source: 65, target: 58, value: 5},
                {source: 65, target: 61, value: 5},
                {source: 65, target: 60, value: 2},
                {source: 65, target: 59, value: 5},
                {source: 65, target: 57, value: 1},
                {source: 65, target: 55, value: 2},
                {source: 66, target: 64, value: 3},
                {source: 66, target: 58, value: 3},
                {source: 66, target: 59, value: 1},
                {source: 66, target: 62, value: 2},
                {source: 66, target: 65, value: 2},
                {source: 66, target: 48, value: 1},
                {source: 66, target: 63, value: 1},
                {source: 66, target: 61, value: 1},
                {source: 66, target: 60, value: 1},
                {source: 67, target: 57, value: 3},
                {source: 68, target: 25, value: 5},
                {source: 68, target: 11, value: 1},
                {source: 68, target: 24, value: 1},
                {source: 68, target: 27, value: 1},
                {source: 68, target: 48, value: 1},
                {source: 68, target: 41, value: 1},
                {source: 69, target: 25, value: 6},
                {source: 69, target: 68, value: 6},
                {source: 69, target: 11, value: 1},
                {source: 69, target: 24, value: 1},
                {source: 69, target: 27, value: 2},
                {source: 69, target: 48, value: 1},
                {source: 69, target: 41, value: 1},
                {source: 70, target: 25, value: 4},
                {source: 70, target: 69, value: 4},
                {source: 70, target: 68, value: 4},
                {source: 70, target: 11, value: 1},
                {source: 70, target: 24, value: 1},
                {source: 70, target: 27, value: 1},
                {source: 70, target: 41, value: 1},
                {source: 70, target: 58, value: 1},
                {source: 71, target: 27, value: 1},
                {source: 71, target: 69, value: 2},
                {source: 71, target: 68, value: 2},
                {source: 71, target: 70, value: 2},
                {source: 71, target: 11, value: 1},
                {source: 71, target: 48, value: 1},
                {source: 71, target: 41, value: 1},
                {source: 71, target: 25, value: 1},
                {source: 72, target: 26, value: 2},
                {source: 72, target: 27, value: 1},
                {source: 72, target: 11, value: 1},
                {source: 73, target: 48, value: 2},
                {source: 74, target: 48, value: 2},
                {source: 74, target: 73, value: 3},
                {source: 75, target: 69, value: 3},
                {source: 75, target: 68, value: 3},
                {source: 75, target: 25, value: 3},
                {source: 75, target: 48, value: 1},
                {source: 75, target: 41, value: 1},
                {source: 75, target: 70, value: 1},
                {source: 75, target: 71, value: 1},
                {source: 76, target: 64, value: 1},
                {source: 76, target: 65, value: 1},
                {source: 76, target: 66, value: 1},
                {source: 76, target: 63, value: 1},
                {source: 76, target: 62, value: 1},
                {source: 76, target: 48, value: 1},
                {source: 76, target: 58, value: 1}
            ]
        };


        vis.nodes=vis.data.nodes
        vis.links=vis.data.links

        vis.transitionTime=2500
        vis.nodeY=0
        vis.nodeX=0

        vis.colors= ['#00aaad',"#cbdb2a","#fcb315","#4e88c7",
            "#ffde2d","#77ced9", "#bb89ca"]
        vis.cbColors = ['#dc013f',"#063104","#493d24","#a0ce56",
            "#3ad2a3","#dc16d9", "#873d07"]

        vis.colorScaleNormal=d3.scaleOrdinal()
            .range(vis.colors)
            .domain([0,vis.colors.length])

        vis.colorScaleCB = d3.scaleOrdinal()
            .range(vis.cbColors)
            .domain([0,vis.cbColors.length])



        // vis.colorScale=d3.scaleOrdinal(d3.schemeCategory10)


        vis.tau = 2*Math.PI
        vis.spacing=15
        vis.margin=20


        // // Set each node's value to the sum of all incoming and outgoing link values
        vis.nodeValMin = 100000000
        vis.nodeValMax = 0;

        vis.arcWidthScale = d3.scalePow()
            .range([0.5,100])

        vis.arcBuilder = d3.arc()
            .startAngle(vis.tau/4)
            .endAngle(-vis.tau/4)
        // .cornerRadius(1)

        vis.arcBuilder.setRadii = function(d){
            vis.arcHeight = 0.5 * Math.abs(d.y2-d.y1);
            this
                .innerRadius(vis.arcHeight - d.thickness/2)
                .outerRadius(vis.arcHeight + d.thickness/2);
        };


        vis.wrangleData()

    }

    sortData(){
        let vis = this;
        console.log(selectedSortMethod)

    }

    wrangleData(){
        let vis = this;

        console.log('wrangle data')
        vis.updateColors()

        vis.nodes.forEach((d,i)=>{
            d["value"] = 0;
            d["displayOrder"] = i;
            d['matches']=[]
        })

        vis.links.forEach((d,i)=>{
            vis.indexA = vis.nodes.findIndex(f=>f.id==d.source)
            vis.indexB = vis.nodes.findIndex(f=>f.id==d.target)
            vis.nodes[vis.indexA].value += d.value;
            vis.nodes[vis.indexB].value += d.value;
            // console.log(d.source, vis.indexA, vis.colors(vis.nodes[vis.indexA].group),d.target, vis.indexB,vis.colors(vis.nodes[vis.indexB].group))
            d['sourceColor']=vis.colorScale(vis.nodes[vis.indexA].group)
            d['targetColor']=vis.colorScale(vis.nodes[vis.indexB].group)
            vis.nodes[vis.indexA].matches.push(d.target)
            vis.nodes[vis.indexB].matches.push(d.source)
        })
        vis.nodes.forEach((d,i)=>{
            vis.nodeValMin = Math.min(vis.nodeValMin, d.value);
            vis.nodeValMax = Math.max(vis.nodeValMax, d.value);
        })

        vis.arcWidthScale.domain([vis.nodeValMin, vis.nodeValMax])



        vis.makeGradients()
        vis.updateVis()


    }

    makeGradients(){
        let vis = this;
        console.log('make gradients')
        vis.gradients = vis.svg.append('defs').selectAll('linearGradient')
            .data(vis.links)
            .enter()
            .append('linearGradient')
            .attr('id', d=>'gradient-'+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+'-'+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ''))
            .attr("y1", "0%")
            .attr("y2", "0%")
            .attr("x1", "0%")
            .attr("x2", "100%")//since its a vertical linear gradient

        vis.gradients
            .append("stop")
            .attr("offset", "0%")
            .style("stop-color", d=>d.sourceColor)//end in red
            .style("stop-opacity", 1)

        vis.gradients
            .append("stop")
            .attr("offset", "100%")
            .style("stop-color", d=>d.targetColor)//start in blue
            .style("stop-opacity", 1)
    }

    updateColors(){
        let vis = this;
        console.log('update colors')
        vis.colorScale = selectedColorPalette ? vis.colorScaleCB : vis.colorScaleNormal;


    }

    updateVis(){
        let vis = this;

        console.log('update vis')
        console.log(vis.nodes)


        vis.trans = d3.transition()
            .duration(800);

        vis.toggleCircle=false
        vis.toggle2=false

        // DATA JOIN
        vis.path = vis.svg.selectAll("path")
            .data(vis.links);
        // UPDATE
        vis.path.exit() // EXIT
            .style("opacity", 0.0)
            .transition(vis.trans)
            .remove();

        vis.path.exit().transition()
            .duration(vis.transitionTime)
            .call(vis.pathTween, null)
            .remove();

        // ENTER
        vis.path.enter()
            .append("path")
            .attr("transform", function(d,i){
                // console.log(d)
                vis.indexC = vis.nodes.findIndex(f=>f.id==d.target)
                vis.indexD = vis.nodes.findIndex(f=>f.id==d.source)
                // console.log(vis.indexC)
                d.y1 = vis.nodeDisplayY(vis.nodes[vis.indexC]);
                d.y2 = vis.nodeDisplayY(vis.nodes[vis.indexD]);
                return vis.arcTranslation(d);
            })
            .attr("d", function(d,i){
                d.thickness = vis.arcWidthScale(d.value);
                vis.arcBuilder.setRadii(d);
                return vis.arcBuilder();
            })
            .attr("opacity", '0.5')
            .attr('fill', function(d){return "url(#gradient-" + d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"})
            .on("mouseover", (event,d)=>{
                if (!vis.toggle2 & !vis.toggleCircle) {
                    vis.hoverPath(event,d)
                }
            })
            .on("click",(event,d)=>{
                vis.toggle2 = true;
                if (vis.toggle2){
                    vis.hoverPath(event,d)
                } else {
                    vis.reset()
                }
            })
            .on("mouseout",(event,d)=>{
                if (!vis.toggle2 & !vis.toggleCircle) {
                    vis.reset();
                }
            })



        // DATA JOIN
        vis.circle = vis.svg.selectAll("circle")
            .data(vis.nodes)

        vis.circle.exit() // EXIT
            .style("opacity", 0.0)
            .transition(vis.trans)
            .remove();

        // UPDATE
        vis.circle.transition()
            .duration(vis.transitionTime)
            .attr("cy", function(d,i) {
                return vis.nodeDisplayY(d);});
        // ENTER
        vis.circle.enter()
            .append("circle")
            .attr('id',d=>'#circle-'+d.id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ''))
            .attr("cx", vis.nodeX)
            .attr("cy", function(d,i) {return vis.nodeDisplayY(d);})
            .attr("r", function(d,i) {return vis.mapRange(d.value, vis.nodeValMin, vis.nodeValMax, 2.5, 13);})
            .attr("fill", function(d,i) {return vis.colorScale(d.group);})
            .attr("stroke", function(d,i) {return d3.rgb(vis.colorScale(d.group)).darker(1);})
            .on("mouseover", (event,d)=>{
                if (!vis.toggleCircle & !vis.toggle2){
                    vis.hoverCircle(event,d)
                }
            })
            .on("click",(event,d)=> {
                vis.toggleCircle = true
                if (vis.toggleCircle & !vis.toggle2){
                    vis.hoverCircle(event,d)
                }
            })
            .on("mouseout",(event,d)=>{
                if (!vis.toggleCircle & !vis.toggle2){
                    vis.reset();
                }
            })

         vis.circle.exit().remove();



        // DATA JOIN
        vis.text = vis.svg.selectAll("text")
            .data(vis.nodes)
        // UPDATE
        vis.text.transition()
            .duration(vis.transitionTime)
            .attr("y", function(d,i) {return vis.nodeDisplayY(d) ;})
            .attr("transform", function(d,i) { return vis.textTransform(d); });
        // ENTER
        vis.text.enter()
            .append("text")
            .attr('id',d=>{return 'label-'+d.id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')})
            .attr("x", vis.nodeX )
            .attr("y", function(d,i) {return vis.nodeDisplayY(d) ;})
            .attr("transform", function(d,i) { return vis.textTransform(d); })
            .attr("font-size", "10px")
            .attr('text-anchor', 'end')
            .text(function(d,i) {return d.id;})
            .on('mouseover',(event,d)=>{
                vis.hoverCircle(event,d)
                // d3.selectAll('text').attr('opacity', '0.2')
                // d3.select(event.currentTarget)
                //     .attr('opacity', '1')
            })
            .on('mouseout',(event,d)=>{
                vis.reset()
                // d3.select(event.currentTarget)
                //     .attr('font-weight', 'normal')
            })

         vis.text.exit().remove();

}

    hoverCircle(event,d){
        let vis = this;

        vis.svg.selectAll('circle')
            .attr('opacity', function (node_d) {
                return node_d.matches.includes(d.id) || node_d.id == d.id ? '1' : '0.2'
            })

        vis.svg.selectAll('text')
            .attr('opacity', function (text_d) {
                console.log(text_d)
                return text_d.matches.includes(d.id) || text_d.id == d.id ? '1' : '0.2'
            })

        vis.svg.selectAll('path')
            // .attr('fill', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? `${vis.colors(d.group)}` : '#b8b8b8';})
            .attr('opacity', function (link_d) {
                return link_d.source === d.id || link_d.target === d.id ? 1 : 0.1;
            })

    }

    hoverPath(event,d){
        let vis = this;

        d3.selectAll('path').attr('opacity', '0.2')

        d3.select(event.currentTarget).attr('opacity', '1').raise()

        d3.selectAll('circle')
            // .attr('fill', function (node_d) { return node_d.id === d.source || node_d.id === d.target ? `${vis.colors(node_d.group)}` : '#b8b8b8';})
            .attr('opacity', function (node_d) {
                return node_d.id === d.source || node_d.id === d.target ? 1 : 0.2;
            })
            .attr('stroke', function (node_d) {
                return node_d.id === d.source || node_d.id === d.target ? 'black' : 'none';
            })
            .raise()

        vis.svg.selectAll('text').attr('opacity',0.2)
        d3.select('#label-'+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')).attr('opacity',1)
        d3.select('#label-'+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')).attr('opacity','1')
    }

    reset(){
        let vis = this;
        vis.toggleCircle=false;
        vis.toggle2=false;
        d3.selectAll('text').attr('opacity','1')
        d3.selectAll('path').attr('opacity', '0.5')
        d3.selectAll('circle')
            .attr("fill", function(d,i) {return vis.colorScale(d.group);})
            .attr('opacity', 1)
            .attr('stroke', function (node_d) { return d3.rgb(vis.colorScale(node_d.group)).darker(1);})
            .attr('stroke-width',1)
    }

    textTransform(node){
        let vis = this;
        return ("translate(" + (vis.nodeX -20 ) + " " + 2 + ")");
    }

    pathTween(transition, dummy){
        let vis = this;
        transition.attrTween("d", function(d){

            console.log(d)
            let indexC = vis.nodes.findIndex(f=>f.id==d.target)
            let indexD = vis.nodes.findIndex(f=>f.id==d.source)
            console.log(vis.nodes[indexC])
            // var interpolateY1 = d3.interpolate(d.y1, vis.nodeDisplayY(vis.nodes[indexC]));
            // var interpolateY2 = d3.interpolate(d.y2, vis.nodeDisplayY(vis.nodes[indexD]));
            // return function(t){
            //     d.y1 = interpolateY1(t);
            //     d.y2 = interpolateY2(t);
            //     vis.arcBuilder.setRadii(d);
            //     return vis.arcBuilder();
            // };
        });

        transition.attrTween("transform", function(d){
            let indexE = vis.nodes.findIndex(f=>f.id==d.target)
            let indexF = vis.nodes.findIndex(f=>f.id==d.source)
            // var interpolateY1 = d3.interpolate(d.y1, vis.nodeDisplayY(vis.nodes[indexE]));
            // var interpolateY2 = d3.interpolate(d.y2, vis.nodeDisplayY(vis.nodes[indexF]));
            // return function(t){
            //     d.y1 = interpolateY1(t);
            //     d.y2 = interpolateY2(t);
            //     return vis.arcTranslation(d);
            // };
        });
    }

    arcTranslation(d){
        let vis = this;
        return "translate(" + vis.nodeX + "," + (d.y1 + d.y2)/2 + ") rotate(90)";
    }

    nodeDisplayY(node){
        let vis = this;
        // console.log(node.displayOrder * vis.spacing + vis.margin)
        return node.displayOrder * vis.spacing + vis.margin;
    }

    mapRange(value, inMin, inMax, outMin, outMax){
        let inVal = Math.min(Math.max(value, inMin), inMax);
        return outMin + (outMax-outMin)*((inVal - inMin)/(inMax-inMin));
    }

    doSort(sortMethod){
        var nodeMap = [],
            sortFunction;

        for(i=0; i<vis.nodes.length; i++){
            var node = $.extend({index:i}, vis.nodes[i]); // Shallow copy
            nodeMap.push(node);
        }

        if (sortMethod == 'alphabetical'){
            // GROUP
            sortFunction = function(a, b){
                return b.group - a.group;
            };
        }
        else if (sortMethod == 'academicArea'){
            // FREQUENCY
            sortFunction = function(a, b){
                return b.value - a.value;
            };
        }
        else if(sortMethod == 'numCollab'){
            // ALPHABETICAL
            sortFunction = function(a, b){
                return a.nodeName.localeCompare(b.nodeName)
            };
        }

        nodeMap.sort(sortFunction);
        for(i=0; i<nodeMap.length; i++){
            vis.nodes[nodeMap[i].index].displayOrder = i;
        }
    }
}



// var i,
//     width = 960,
//     height = 500,
//     transitionTime = 2500,
//     spacing = 11,
//     margin = 20,
//     nodeY = 380,
//     nodes = miserables.nodes,
//     links = miserables.links,
//     colors = d3.scale.category20(),
//     τ = 2 * Math.PI; // http://tauday.com/tau-manifesto
//
// var svg = d3.select("#arc-vis-bin").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//
// function mapRange(value, inMin, inMax, outMin, outMax){
//     var inVal = Math.min(Math.max(value, inMin), inMax);
//     return outMin + (outMax-outMin)*((inVal - inMin)/(inMax-inMin));
// }
//
// // Set each node's value to the sum of all incoming and outgoing link values
// var nodeValMin = 100000000,
//     nodeValMax = 0;
// for(i=0; i<nodes.length; i++){
//     nodes[i].value = 0;
//     nodes[i].displayOrder = i;
// }
// for(i=0; i<links.length; i++){
//     var link = links[i];
//     value = link.value;
//     nodes[link.source].value += link.value;
//     nodes[link.target].value += link.value;
// }
// for(i=0; i<nodes.length; i++){
//     nodeValMin = Math.min(nodeValMin, nodes[i].value);
//     nodeValMax = Math.max(nodeValMax, nodes[i].value);
// }
//
// var arcBuilder = d3.svg.arc()
//     .startAngle(-τ/4)
//     .endAngle(τ/4);
// arcBuilder.setRadii = function(d){
//     var arcHeight = 0.5 * Math.abs(d.x2-d.x1);
//     this
//         .innerRadius(arcHeight - d.thickness/2)
//         .outerRadius(arcHeight + d.thickness/2);
// };
// function arcTranslation(d){
//     return "translate(" + (d.x1 + d.x2)/2 + "," + nodeY + ")";
// }
// function nodeDisplayX(node){
//     return node.displayOrder * spacing + margin;
// }
//
// var path;
//
// function update(){
//     // DATA JOIN
//     path = svg.selectAll("path")
//         .data(links);
//     // UPDATE
//     path.transition()
//         .duration(transitionTime)
//         .call(pathTween, null);
//     // ENTER
//     path.enter()
//         .append("path")
//         .attr("transform", function(d,i){
//             d.x1 = nodeDisplayX(nodes[d.target]);
//             d.x2 = nodeDisplayX(nodes[d.source]);
//             return arcTranslation(d);
//         })
//         .attr("d", function(d,i){
//             d.thickness = 1 + d.value;
//             arcBuilder.setRadii(d);
//             return arcBuilder();
//         });
//
//     // DATA JOIN
//     var circle = svg.selectAll("circle")
//         .data(nodes);
//     // UPDATE
//     circle.transition()
//         .duration(transitionTime)
//         .attr("cx", function(d,i) {return nodeDisplayX(d);});
//     // ENTER
//     circle.enter()
//         .append("circle")
//         .attr("cy", nodeY)
//         .attr("cx", function(d,i) {return nodeDisplayX(d);})
//         .attr("r", function(d,i) {return mapRange(d.value, nodeValMin, nodeValMax, 2.5, 13);})
//         .attr("fill", function(d,i) {return colors(d.group);})
//         .attr("stroke", function(d,i) {return d3.rgb(colors(d.group)).darker(1);});
//
//     function textTransform(node){
//         return ("rotate(90 " + (nodeDisplayX(node) - 5) + " " + (nodeY + 12) + ")");
//     }
//     // DATA JOIN
//     var text = svg.selectAll("text")
//         .data(nodes);
//     // UPDATE
//     text.transition()
//         .duration(transitionTime)
//         .attr("x", function(d,i) {return nodeDisplayX(d) - 5;})
//         .attr("transform", function(d,i) { return textTransform(d); });
//     // ENTER
//     text.enter()
//         .append("text")
//         .attr("y", nodeY + 12)
//         .attr("x", function(d,i) {return nodeDisplayX(d) - 5;})
//         .attr("transform", function(d,i) { return textTransform(d); })
//         .attr("font-size", "10px")
//         .text(function(d,i) {return d.nodeName;});
// }
//
// doSort(0);
// update();
//
// function pathTween(transition, dummy){
//     transition.attrTween("d", function(d){
//         var interpolateX1 = d3.interpolate(d.x1, nodeDisplayX(nodes[d.target]));
//         var interpolateX2 = d3.interpolate(d.x2, nodeDisplayX(nodes[d.source]));
//         return function(t){
//             d.x1 = interpolateX1(t);
//             d.x2 = interpolateX2(t);
//             arcBuilder.setRadii(d);
//             return arcBuilder();
//         };
//     });
//
//     transition.attrTween("transform", function(d){
//         var interpolateX1 = d3.interpolate(d.x1, nodeDisplayX(nodes[d.target]));
//         var interpolateX2 = d3.interpolate(d.x2, nodeDisplayX(nodes[d.source]));
//         return function(t){
//             d.x1 = interpolateX1(t);
//             d.x2 = interpolateX2(t);
//             return arcTranslation(d);
//         };
//     });
// }
//
// d3.select("#selectSort").on("change", function() {
//     doSort(this.selectedIndex);
//     update();
// });
//
// function doSort(sortMethod){
//     var nodeMap = [],
//         sortFunciton;
//
//     for(i=0; i<nodes.length; i++){
//         var node = $.extend({index:i}, nodes[i]); // Shallow copy
//         nodeMap.push(node);
//     }
//
//     if (sortMethod == 0){
//         // GROUP
//         sortFunction = function(a, b){
//             return b.group - a.group;
//         };
//     }
//     else if (sortMethod == 1){
//         // FREQUENCY
//         sortFunction = function(a, b){
//             return b.value - a.value;
//         };
//     }
//     else if(sortMethod == 2){
//         // ALPHABETICAL
//         sortFunction = function(a, b){
//             return a.nodeName.localeCompare(b.nodeName)
//         };
//     }
//
//     nodeMap.sort(sortFunction);
//     for(i=0; i<nodeMap.length; i++){
//         nodes[nodeMap[i].index].displayOrder = i;
//     }
// }
