// https://observablehq.com/@d3/arc-diagram@277
export default function define(runtime, observer) {
    const main = runtime.module();
    const fileAttachments = new Map([["faculty_collabs.json",new URL("./files/faculty_collabs.json",import.meta.url)]]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  
    main.variable(observer("viewof order")).define("viewof order", ["d3","html"], function(d3,html)
  {
    const options = [
      {name: "Order by academic area", value: (a, b) => a.group - b.group || d3.ascending(a.id, b.id)},
      {name: "Order by name", value: (a, b) => d3.ascending(a.id, b.id)},
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
    main.variable(observer("chart")).define("chart", ["d3","DOM","width","height","graph","margin","x","color","arc","step","viewof order","invalidation"], function(d3,DOM,width,height,graph,margin,x,color,arc,step,$0,invalidation)
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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
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
            console.log("selected area: ", selectedArea)
            update()
            })
          );
  
    // add variables for arc diagram
    var nodeRadius = d3.scaleSqrt().range([3, 7]);
    var linkWidth = d3.scaleLinear().range([1.5, 2 * nodeRadius.range()[0]]); 
    nodeRadius.domain(d3.extent(graph.nodes, function (d) { return d.targetLinks.length; }));
    linkWidth.domain(d3.extent(graph.links, function (d) { return d.target.targetLinks.length; }));
  
    const label = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(arcData.nodes)
        .join(
            enter => enter.append("g")
                .attr("transform", d => `translate(${d.x = x(d.id)},${height - margin.top - margin.bottom})`)
                .call(g => g.append("text")
                    .attr("x", -7)
                    .attr("dy", "0.9em")
                    .attr("fill", d => d3.lab(color(d.group)).darker(2))
                    .attr("transform", "rotate(-45)")
                    .text(d => { 
                        return d.id
                    }))
                .call(g => g.append("circle")
                    .attr("r", d => nodeRadius(d.targetLinks.length))
                    .attr("fill", d => color(d.group))),
            update => update
                .call(g => g.append("text")
                    .attr("x", -7)
                    .attr("dy", "0.9em")
                    .attr("fill", d => d3.lab(color(d.group)).darker(2))
                    .attr("transform", "rotate(-45)")
                    .text(d => d.id))
                .call(g => g.append("circle")
                    // .attr("r", 3)
                    .attr("r", d => nodeRadius(d.targetLinks.length))
                    .attr("fill", d => color(d.group))),
    
            exit => exit.remove()
        )
        
    var path = svg.append("g")
        .selectAll("path")
        .data(arcData.links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.6)
        .attr("stroke", d => {
            return d.source.group === d.target.group ? color(d.source.group) : "#aaa"
        })
        .attr("stroke-width", d => {return linkWidth(d.target.targetLinks.length);})
        .attr("d", arc)

    path.transition()
        .duration(500)
        .attr("d", arc);


    const overlay = svg.append("g")
        .attr("fill", "none")
        .attr("class", "overlay")
        .attr("pointer-events", "all")
        .attr("width", width)
         .attr("height", height - margin.top - margin.bottom)
      .selectAll("rect")
      .data(arcData.nodes)
      .join(
        enter => enter.append("rect")
            .attr("width", step)
            .attr("x", d => x(d.id) - step / 2)
            .attr("y", height - margin.bottom - margin.top)
          .attr("height", 100)
              .on("mouseover", d => {
                svg.classed("hover", true);
                label.classed("primary", n => n === d);
                label.classed("secondary", n => n.sourceLinks.some(l => l.target === d) || n.targetLinks.some(l => l.source === d));
                path.classed("primary", l => l.source === d || l.target === d).filter(".primary").raise();
              legend.classed("hover", false);
  
              }),
          update => update.attr("width", step)
          .attr("x", d => x(d.id) - step / 2)
          .attr("y", height - margin.bottom - margin.top)
          .attr("height", 100)
            .on("mouseover", d => {
              svg.classed("hover", true);
              label.classed("primary", n => n === d);
              label.classed("secondary", n => n.sourceLinks.some(l => l.target === d) || n.targetLinks.some(l => l.source === d));
              path.classed("primary", l => l.source === d || l.target === d).filter(".primary").raise();
              legend.selectAll("text").attr("fill", "black");
  
            }),
  
          exit => exit.remove()
      )
  
    function reset() {
      arcData.nodes.forEach(d => {
        svg.classed("hover", false);
        label.classed("primary", false);
        label.classed("secondary", false);
        path.classed("primary", false).order();
      })
    }
  
    function update() {
      arcData.nodes = graph.nodes.filter(d => selectedArea == "all" | d.group == selectedArea | (d.targetLinks.filter(l=> l.source.group == selectedArea).length > 0))
      arcData.links = graph.links.filter(d => selectedArea == "all" | d.source.group == selectedArea | d.target.group == selectedArea)
      
      var adaptiveWidth = ((arcData.nodes.length - 1) * step + margin.left) > (window.innerWidth - margin.left - margin.right) ? ((arcData.nodes.length - 1) * step + margin.left) : (window.innerWidth - margin.left - margin.right) 
      x.range([margin.left, adaptiveWidth])
      x.domain(arcData.nodes.sort($0.value).map(d => d.id));
  
    const t = svg.transition()
          .duration(750);
  
    label.transition(t)
          .delay((d, i) => i * 10)
          .attrTween("transform", d => {
            const i = d3.interpolateNumber(d.x, x(d.id));
            return t => i(t) ? `translate(${d.x = i(t)},${height - margin.top - margin.bottom})`: "translate(0,0)";
          });
  
    path.data(arcData.links, d=>d);
    path.transition()
        .duration(750)
        .attrTween("d", d=> () => selectedArea == "all" | d.target.group == selectedArea | d.source.group == selectedArea ? arc(d) : "")

      overlay.transition(t)
          .delay((d, i) => i * 20)
          .attr("x", d => x(d.id) - step / 2);
    }
  
    $0.addEventListener("input", update);
    invalidation.then(() => $0.removeEventListener("input", update));
  
    return svg.node();
  }
  );
    main.variable().define("arc", ["x","margin", "height"], function(x,margin,height){return(
      function arc(d) {
        const x1 = x(d.source.id);
        const x2 = x(d.target.id);
        const r = Math.abs(x2 - x1) / 2;
        return ['M', x1, height-margin.top-margin.bottom, 'A',
          (x1 - x2)/2, ',',
          (x1 - x2)/2, 0, 0, ',',
          x1 < x2 ? 1 : 0, x2, ',', height-margin.top-margin.bottom]
          .join(' ');
      }
  
  )});
    main.variable().define("x", ["d3","graph","margin","height","width"], function(d3,graph,margin,height,width){return(
     
    d3.scalePoint(graph.nodes.map(d => d.id).sort((a,b)=> a.group - b.group || d3.ascending(a.id, b.id)), [margin.left, width - margin.right])
  )});
    main.variable().define("margin", function(){return(
      {top: 10, right: 20, bottom: 150, left: 100}
    )});
    main.variable().define("width", ["data","step","margin"], function(data,step,margin){return(
      (data.nodes.length - 1) * step + margin.left + margin.right
    )});
    main.variable().define("height", ["data","step","margin"], function(data,step,margin){return(
      window.innerHeight
      )});
      main.variable().define("step", function(){return(
    20
    )});
  
    main.variable().define("color", ["d3","graph"], function(d3,graph){return(
  d3.scaleOrdinal(graph.nodes.map(d => d.group).sort(d3.ascending), ["#00aaad", "#cbdb2a", "#fcb315", "#4e88c7", "#ffde2d", "#77ced9", "#bb89ca", "#ed1b34"])
  )});
    main.variable().define("graph", ["data"], function(data)
  {
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
  