// https://observablehq.com/@d3/arc-diagram@277
export default function define(runtime, observer) {
    const main = runtime.module();
    const fileAttachments = new Map([["faculty_collabs.json",new URL("./files/faculty_collabs.json",import.meta.url)]]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  
    main.variable(observer("viewof order")).define("viewof order", ["d3","html"], function(d3,html)
  {
    const options = [
      {name: "Order by name", value: (a, b) => d3.ascending(a.id, b.id)},
      {name: "Order by academic area", value: (a, b) => a.group - b.group || d3.ascending(a.id, b.id)},
      {name: "Order by number of collaborations", value: (a, b) => d3.sum(b.sourceLinks, l => 1) + d3.sum(b.targetLinks, l => 1) - d3.sum(a.sourceLinks, l => 1) - d3.sum(a.targetLinks, l => 1) || d3.ascending(a.id, b.id)},
      {name: "Order by number of joint publications", value: (a, b) => d3.sum(b.sourceLinks, l => l.value) + d3.sum(b.targetLinks, l => l.value) - d3.sum(a.sourceLinks, l => l.value) - d3.sum(a.targetLinks, l => l.value) || d3.ascending(a.id, b.id)}
    ];
    const form = html`<form style="display: flex; align-items: center; min-height: 33px;"><select name=i>${options.map(o => Object.assign(html`<option>`, {textContent: o.name}))}`;
    const timeout = setTimeout(() => {
      // form.i.selectedIndex = 1;
      form.dispatchEvent(new CustomEvent("input"));
    }, 2000);
    form.onchange = () => {
      form.dispatchEvent(new CustomEvent("input")); // Safari
    };
    form.oninput = (event) => {
      if (event.isTrusted) form.onchange = null, clearTimeout(timeout);
      form.value = options[form.i.selectedIndex].value;
    };
    form.value = options[form.i.selectedIndex].value;
    return form;
  }
  );
    main.variable().define("order", ["Generators", "viewof order"], (G, _) => G.input(_));
    main.variable(observer("chart"))
        .define("chart", ["d3","DOM","width","height","graph","margin","y","color","arc","step","viewof order","invalidation","data"], 
          function(d3,DOM,width,height,graph,margin,y,color,arc,step,$0,invalidation,data)
          {
            const svg = d3.select(DOM.svg(width, height));
          
            svg.append("style").text(`
          
            .hover path {
              stroke: #ccc;
            }
            
            .hover g text {
              fill: #ccc;
            }
            
            .hover g.primary text {
              fill: black;
              font-weight: bold;
            }
            
            .hover g.secondary text {
              fill: #333;
            }
            
            .hover path.primary {
              stroke: #333;
              stroke-opacity: 1;
            }
            .legend {
              fill: #000 !important ;
            }
            `);
            
            svg.append("rect")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("x", 0)
                  .attr("y", 0)
                  .style("fill", "white")
                  .style("fill-opacity", 0)
                  .on("click", function () {
                    reset();
                  });
            var areaList = ["Applied Mathematics", "Applied Physics", "Bioengineering", "Computer Science", "Electrical Engineering",
                            "Environmental Science & Engineering", "Material Science & Mechanical Engineering"]
            var colorList = ["#00aaad", "#cbdb2a","#fcb315","#4e88c7","#ffde2d","#77ced9","#bb89ca"]
            var areaLoc = [{x: 10, y:10},{x: 10, y:30},{x: 165, y:10},{x: 165, y:30},{x: 305, y:10},
                          {x: 305, y:30},{x: 470, y:10},]
            
            var selectedArea = "all"
            var arcData = {nodes: graph.nodes, links: graph.links}
            
            var arcNodeWrapper = svg.append("g")
              .attr("font-family", "sans-serif")
              .attr("font-size", 14)
            
            var interactionWrapper = svg
              .append("g")
              .attr("fill", "none")
              .attr("pointer-events", "all")

            var label;
            var circle;
            var path;
            var overlay;

           
            const legend = svg.append("g")
            .selectAll("g")
            .data(areaList, d=>d)
            .join("g")
              .attr("transform", (d,i) => `translate(${areaLoc[i].x},${areaLoc[i].y})`)
              .call(g => g.append("rect")
                  .attr("width", 12)
                  .attr("height", 12)
                  .attr("fill", (d,i) => colorList[i])
                  )
              .call(g => g.append("text")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 14)
                  .attr("dy", "0.8em")
                  .attr("dx", "1em")
                  .attr("text-anchor", "start")
                  .attr("class", "legend")
                  .text(d => d))
                  .call(g => g
                    .on("click", function(d,i){ 
                      selectedArea = selectedArea== i ? "all" : i
                      console.log("selected area: ", selectedArea);
                      updateGraph()
                      })
                    );

                updateGraph();

              function updateGraph(){
                 // add variables for arc diagram
              var nodeRadius = d3.scaleSqrt().range([3, 7]);
              var linkWidth = d3.scaleLinear().range([1.5, 2 * nodeRadius.range()[0]]); 
                nodeRadius.domain(d3.extent(graph.nodes, function (d) { return d.targetLinks.length; }));
                linkWidth.domain(d3.extent(graph.links, function (d) { return d.target.targetLinks.length; }));
              
                // update nodes based on selected area
              var filteredFaculty = graph.nodes.filter(d => selectedArea == "all" | d.group == selectedArea)
              var selectedFacultyName = filteredFaculty.map(d=> d.id)
              console.log("selectedFacultyName",selectedFacultyName)
              
              // add faculty nodes that have shared collaboratiion with the above  "filteredFaculty"
              filteredFaculty.map((d =>{
                var source = d.sourceLinks
                source.map((t =>{
                  if (!selectedFacultyName.includes(t.target.id)){
                    selectedFacultyName.push(t.target.id);
                  }
                }))
              }))

              // updated list of filtered faculty nodes, including faculty within the selected area & faculty who share collaboration 
              console.log("update", selectedFacultyName)

              // select these faculty nodes in the data
              arcData.nodes = graph.nodes.filter(d => selectedArea == "all" | selectedFacultyName.includes(d.id))
               
              // select collaboration with the selected area
              var updatedLink = []
              arcData.nodes.map(l => {
                var links = l.sourceLinks
                // include all the links for faculty within the selected area 
                if (l.group == selectedArea | selectedArea == "all"){
                  links.map((m => {
                    updatedLink.push(m)
                  }))
                } else {
                  // include only links between faculty in the selected area faculty  
                  links.map((m => {
                    if (m.target.group == selectedArea){
                      updatedLink.push(m)
                    }
                  }))
                }
              })
              arcData.links = updatedLink;

              // console.log("ArdData node: ", arcData.nodes);
              // console.log("ArdData link: ", arcData.links);

                var adaptiveHeight = (arcData.nodes.length - 1) * step + margin.top;
                y.range([margin.top, adaptiveHeight]);
                y.domain(arcData.nodes.sort($0.value).map(d => d.id));

                
                label = arcNodeWrapper
                    .selectAll("text")
                    .data(arcData.nodes, d=>d.id)

                label.enter()
                    .append("text")
                    .attr("transform", d => `translate(${margin.left},${d.y = y(d.id)})`)
                    .attr("fill", d => d3.lab(color(d.group)).darker(2))
                    .attr("text-anchor", "end")
                    .attr("dy", "0.4em")
                    .merge(label)
                    .transition()
                    .duration(600)
                    .attr("transform", d => `translate(${margin.left},${d.y = y(d.id)})`)
                        .attr("dy", "0.4em")
                        .text(d => { 
                            return d.id
                        })
                        
                  label.exit().remove()


                  const t = svg.transition()
                    .duration(750);

                  path = arcNodeWrapper
                    .selectAll("path")
                    .data(arcData.links, d=>d.source.id)

                  path.enter()
                    .append("path")
                    .attr("fill", "none")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke", d => {
                      return d.source.group === d.target.group ? color(d.source.group) : "#aaa"
                    })
                    .attr("stroke-width", d => {return linkWidth(1);})
                    .attr("d", arc)
                    .merge(path)
                    .transition(t)
                    .duration(750 + arcData.nodes.length * 20)
                    .attr("stroke-width", d => {return linkWidth(d.target.targetLinks.length);})
                    .attrTween("d", d => () => arc(d));

                  path.exit().remove() 

                
                  circle = arcNodeWrapper
                    .selectAll("circle")
                    .data(arcData.nodes, d=>d.id)

                  circle.enter()
                    .append("circle")
                    .attr("transform", d => `translate(${margin.left+10},${d.y = y(d.id)})`)
                    .attr("fill", d => color(d.group))
                    .attr("r", 2)
                    .merge(circle)
                    .transition()
                    .duration(600)
                    .attr("transform", d => `translate(${margin.left+10},${d.y = y(d.id)})`)
                    .attr("r", d => nodeRadius(d.targetLinks.length))
                        
                  circle.exit().remove()

                  circle.raise();

                  overlay = interactionWrapper
                    .selectAll("rect")
                    .data(arcData.nodes, d=>d.id)
                  overlay.enter()
                    .append("rect")
                    .merge(overlay)
                    .attr("width", margin.left + 40)
                    .attr("height", step)
                    .attr("y", d => y(d.id) - step / 2)
                    .on("click", d => {
                      svg.classed("hover", true);
                      label.classed("primary", n => n === d);
                      label.classed("secondary", n => n.sourceLinks.some(l => l.target === d) || n.targetLinks.some(l => l.source === d));
                      path.classed("primary", l => l.source === d || l.target === d).filter(".primary").raise();
                    })
                    

                    overlay.exit().remove();
                
              }
              function reset() {
                arcData.nodes.forEach(d => {
                  svg.classed("hover", false);
                  label.classed("primary", false);
                  label.classed("secondary", false);
                  path.classed("primary", false).order();
                })
              }
            
              $0.addEventListener("input", updateGraph);
              invalidation.then(() => $0.removeEventListener("input", updateGraph));
            
              return svg.node();
          }
        );
    main.variable().define("arc", ["margin", "y"], function(margin,y){return(
        function arc(d) {
          const y1 = d.source.y;
          const y2 = d.target.y;
          const r = Math.abs(y2 - y1) / 2;
          return `M${margin.left+10},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${margin.left+10},${y2}`;
        }
    
    )});

    main.variable().define("y", ["d3","graph","margin","height","width"], function(d3,graph,margin,height,width){return(
      d3.scalePoint(graph.nodes.map(d => d.id).sort((a,b)=> a.group - b.group || d3.ascending(a.id, b.id)), [margin.top, height - margin.bottom])
    )});
      
    main.variable().define("margin", function(){return(
        {top: 95, right: 20, bottom: 20, left: 220}
    )});
      
    main.variable().define("height", ["data","step","margin"], function(data,step,margin){return(
        (data.nodes.length - 1) * step + margin.left + margin.right
    )});
    
    main.variable().define("step", function(){return(
      20
    )});
    
    
    main.variable().define("color", ["d3","graph"], function(d3,graph){return(
      d3.scaleOrdinal(graph.nodes.map(d => d.group).sort(d3.ascending), ["#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca", "#ed1b34"])
    )});
      
    main.variable().define("graph", ["data"], function(data){
      const nodes = data.nodes.map(({id, group}) => ({
        id,
        sourceLinks: [],
        targetLinks: [],
        group
      }));
    
      const nodeById = new Map(nodes.map(d => [d.id, d]));
    
      const links = data.links.map(({source, target, value}) => ({
        source: nodeById.get(source),
        target: nodeById.get(target),
        value
      }));
    
      for (const link of links) {
        const {source, target, value} = link;
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      }
      return {nodes, links};
    }
  );
    main.variable().define("data", ["FileAttachment"], function(FileAttachment){return(
      FileAttachment("faculty_collabs.json").json()
  )});
    main.variable().define("d3", ["require"], function(require){return(
  require("d3@5")
  )});
    return main;
  }
  