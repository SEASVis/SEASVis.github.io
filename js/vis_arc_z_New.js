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
            .attr("height", vis.height*3 + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.width / 6}, ${vis.margin.top})`)

        // .attr('transform', 'rotate(45deg)');

        vis.svg
            .append("rect")
            .attr("width", vis.width+50)
            .attr("height", vis.height*3)
            .attr("x", -300)
            .attr("y", -50)
            .style("fill", "white")
            .style("fill-opacity", 0)
            .on("click", function () {
                // console.log('clicked rect');
                vis.reset();
            });

        vis.nodes=vis.data.nodes
        vis.links=vis.data.links

        vis.transitionTime=2500
        vis.nodeY=0
        vis.nodeXP=5;
        vis.nodeX=0

        vis.colors= ['#00aaad',"#cbdb2a","#fcb315","#4e88c7","#ffde2d","#77ced9", "#bb89ca"]
        vis.cbColors = ['#01D9DC',"#41A23D","#FCB315","#0D5AAF", "#FFDE2D","#B7E5EA", "#B379E8"]


        vis.colorScaleNormal=d3.scaleOrdinal()
            .range(vis.colors)
            .domain([0,6])

        vis.colorScaleCB = d3.scaleOrdinal()
            .range(vis.cbColors)
            .domain([0,6])

        vis.tau = 2*Math.PI
        vis.spacing=18
        vis.margin=20

        // // Set each node's value to the sum of all incoming and outgoing link values
        vis.nodeValMin = 100000000
        vis.nodeValMax = 0;

        vis.arcWidthScale = d3.scalePow()
            .range([1,20])

        vis.circleRadiusScale = d3.scaleLinear()
            .range([3,10])

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
        vis.initToggle = true;

        vis.updateColors(false)


    }

    updateColors(value,sortMethod){
        let vis = this;

        vis.colorScale = value ? vis.colorScaleCB : vis.colorScaleNormal;
        vis.wrangleData(sortMethod)

    }

    wrangleData(sortMethod){
        let vis = this;


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
        vis.circleRadiusScale.domain([vis.nodeValMin, vis.nodeValMax])

        vis.thisSortMethod = !sortMethod ? 'alphabetical' : sortMethod

        vis.doSort(vis.thisSortMethod)



    }

    makeGradients(){
        let vis = this;
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
            .attr("offset", "10%")
            .style("stop-color", d=>d.sourceColor)//end in red
            .style("stop-opacity", 1)

        vis.gradients
            .append("stop")
            .attr("offset", "90%")
            .style("stop-color", d=>d.targetColor)//start in blue
            .style("stop-opacity", 1)
    }

    makeReverseGradients(){
        let vis = this;
        vis.gradientsR = vis.svg.append('defs').selectAll('linearGradient')
            .data(vis.links)
            .enter()
            .append('linearGradient')
            .attr('id', d=>'reverse-gradient-'+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+'-'+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ''))
            .attr("y1", "0%")
            .attr("y2", "0%")
            .attr("x1", "0%")
            .attr("x2", "100%")//since its a vertical linear gradient


        vis.gradientsR
            .append("stop")
            .attr("offset", "10%")
            .style("stop-color",d=>d.targetColor )//end in red
            .style("stop-opacity", 1)

        vis.gradientsR
            .append("stop")
            .attr("offset", "90%")
            .style("stop-color",d=>d.sourceColor )//start in blue
            .style("stop-opacity", 1)
    }

    updateVis(){
        let vis = this;

        console.log('update vis')

        vis.makeGradients()
        vis.makeReverseGradients()

        vis.trans = d3.transition()
            .duration(800);

        vis.toggleCircle=false
        vis.toggle2=false

        // DATA JOIN
        vis.path = vis.svg.selectAll("path")
            .data(vis.links);

        // UPDATE
        // vis.path
        //     .transition()
        //     .duration(1000)
        //     .ease(d3.easeLinear)
        //     .attr('fill', function(d){
        //         if (d.doT > d.doS){
        //             return "url(#gradient-" + d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
        //         } else{
        //             console.log('here')
        //             return "url(#reverse-gradient-" + d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
        //         }
        //     })

        // ENTER
        vis.path.enter()
            .append("path")
            .attr('id', d=>'path-'+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ''))
            .attr("transform", function(d,i){
                vis.indexD = vis.displayNodes.findIndex(f=>f.id==d.target)
                vis.indexC = vis.displayNodes.findIndex(f=>f.id==d.source)
                // console.log(d)
                d.y1 = vis.nodeDisplayY(vis.displayNodes[vis.indexC]);
                d.y2 = vis.nodeDisplayY(vis.displayNodes[vis.indexD]);

                return vis.arcTranslation(d);
            })
            .attr("d", function(d,i){
                d.thickness = vis.arcWidthScale(d.value);
                vis.arcBuilder.setRadii(d);
                return vis.arcBuilder();
            })
            .attr('fill', function(d){
                if (d.doT > d.doS){
                    return "url(#gradient-" + d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
                } else{
                    console.log('here')
                    return "url(#reverse-gradient-" + d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
                }
            })
            .attr("opacity", '0.5')
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
            .merge(vis.path)
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr('fill', function(d){
                if (d.doT > d.doS){
                    return "url(#gradient-" + d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
                } else{
                    return "url(#reverse-gradient-" + d.target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '') +"-"+d.source.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')+")"
                }
            })
            .call(vis.pathTween, vis.displayNodes, vis.arcBuilder,vis.arcTranslation)

        // DATA JOIN
        vis.circle = vis.svg.selectAll("circle")
            .data(vis.displayNodes)

        // vis.circle.exit() // EXIT
        //     .style("opacity", 0.0)
        //     .transition()
        //     .duration(2500)
        //     .ease(d3.easeLinear)
        //     .remove();

        // UPDATE
        vis.circle
            .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("cy", function(d,i) {
                return vis.nodeDisplayY(d);})
            .transition()
            .duration(1000)
            .attr("fill", function(d,i) {return vis.colorScale(d.group);})
        // ENTER
        vis.circle.enter()
            .append("circle")
            .attr('id',d=>'#circle-'+d.id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, ''))
            .attr("cx", vis.nodeX)
            .attr("cy", function(d,i) {return vis.nodeDisplayY(d);})
            .attr("r", function(d,i) {return vis.circleRadiusScale(d.value);})
            .attr("stroke", function(d,i) {return d3.rgb(vis.colorScale(d.group)).darker(1);})
            .attr("fill", function(d,i) {return vis.colorScale(d.group);})
            .on("mouseover", (event,d)=>{
                if (!vis.toggleCircle & !vis.toggle2){
                    // console.log(d)
                    vis.hoverCircle(event,d)
                }
            })
            .on("click",(event,d)=> {
                vis.toggleCircle = true
                if (vis.toggleCircle & !vis.toggle2){
                    vis.hoverCircle(event,d)
                }
            })
            .on("mouseout",(event,d)=> {
                if (!vis.toggleCircle & !vis.toggle2) {
                    vis.reset();
                }
            })

         vis.circle.exit().remove();



        // DATA JOIN
        vis.text = vis.svg.selectAll("text")
            .data(vis.displayNodes)
        // UPDATE
        vis.text.transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("y", function(d,i) {return vis.nodeDisplayY(d) ;})
            .attr("transform", function(d,i) { return vis.textTransform(d); });
        // ENTER
        vis.text.enter()
            .append("text")
            .attr('id',d=>{return 'label-'+d.id.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, '')})
            .attr("x", vis.nodeX )
            .attr("y", function(d,i) {return vis.nodeDisplayY(d) ;})
            .attr("transform", function(d,i) { return vis.textTransform(d); })
            .attr("font-size", "14px")
            .attr('text-anchor', 'end')
            .text(function(d,i) {return d.id;})
            .on('mouseover',(event,d)=>{
                vis.hoverCircle(event,d)
            })
            .on('mouseout',(event,d)=>{
                vis.reset()
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
                // console.log(text_d)
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

    pathTween(transition, nodeData,func,func2){
        let vis = this;
        transition.attrTween("d", function(d){
            // let vis = this;
            // console.log(nodeData)
            let indexE = nodeData.findIndex(f=>f.id===d.target)
            let indexF = nodeData.findIndex(f=> f.id===d.source)
            // console.log(indexE)
            var interpolateY1 = d3.interpolate(d.y1, nodeData[indexF].displayOrder*15+20);
            var interpolateY2 = d3.interpolate(d.y2, nodeData[indexE].displayOrder*15+20);
            return function(t){
                d.y1 = interpolateY1(t);
                d.y2 = interpolateY2(t);
                func.setRadii(d);
                return func();
            }
        })

        transition.attrTween("transform", function(d){
            let indexG = nodeData.findIndex(f=>f.id==d.target)
            let indexH = nodeData.findIndex(f=>f.id==d.source)
            var interpolateY1 = d3.interpolate(d.y1, nodeData[indexH].displayOrder*15+20);
            var interpolateY2 = d3.interpolate(d.y2,  nodeData[indexG].displayOrder*15+20);
            return function(t){
                d.y1 = interpolateY1(t);
                d.y2 = interpolateY2(t);
                return func2(d);
            };
        });

        // transition.attrTween("fill", function(d){
        //
        // })
    }

    arcTranslation(d){
        let vis = this;
        return "translate(" + 5 + "," + (d.y1 + d.y2)/2 + ") rotate(90)";
    }

    nodeDisplayY(node){
        let vis = this;
        return node.displayOrder * 15+20;
    }


    doSort(sortMethod){
        let vis = this;

        var nodeMap = [],
            sortFunction;

        let i;
        for(i=0; i<vis.nodes.length; i++){
            var node = $.extend({index:i}, vis.nodes[i]); // Shallow copy
            nodeMap.push(node);
        }

        if (sortMethod == 'academicArea') {
            // GROUP
            sortFunction = function (a, b) {
                return a.group - b.group || d3.ascending(a.id, b.id)
            };
        } else if (sortMethod == 'numCollab') {
            // FREQUENCY
            sortFunction = function (a, b) {
                return b.value - a.value;
            };
        } else if (sortMethod == 'alphabetical') {
            // ALPHABETICAL
            sortFunction = function (a, b) {
                return d3.ascending(a.id, b.id)
            };
        }



        vis.nodeMapSorted = nodeMap.sort(sortFunction);



        // console.log(nodeMapSorted)
        vis.nodeMapSorted.forEach((d,i)=>{
            // console.log(d)
            let indexG = vis.nodes.findIndex(f=>f.id==d.id)
            // console.log(d.displayOrder, vis.nodes[indexG].displayOrder)
            vis.nodes[indexG].displayOrder = i
        })

        vis.links.forEach((d,i)=>{
            let indexJ = vis.nodes[vis.nodes.findIndex(f=>f.id==d.source)].displayOrder
            let indexK = vis.nodes[vis.nodes.findIndex(f=>f.id==d.target)].displayOrder

            vis.links[i].doS = indexJ
            vis.links[i].doT = indexK
        })

        vis.displayNodes = vis.nodes
        vis.updateVis()
    }
}
