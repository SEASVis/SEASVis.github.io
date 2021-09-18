/* * * * * * * * * * * * * *
*      class wordBarVis        *
* * * * * * * * * * * * * */


class wordBarVis {
    constructor(parentElement){
        this.parentElement = parentElement;

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 60, right: 55, bottom: 80, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Most Popular Words')
            .attr('transform', `translate(${vis.width / 2}, -45)`)
            .attr('text-anchor', 'middle')
            .attr("font-size", 14);

        // add title
        vis.subTitleTop = vis.svg.append('g')
            .attr('class', 'subtitle subtitle-top')
            .append('text')
            .text('All 11 Papers')
            .attr('transform', `translate(${vis.width / 2}, -25)`)
            .attr('text-anchor', 'middle');

        vis.subTitleBottom = vis.svg.append('g')
            .attr('class', 'subtitle subtitle-bottom')
            .append('text')
            .text('From John Harvard and Sally Yale')
            .attr('transform', `translate(${vis.width / 2}, -12)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // set up the initial axis (at the start)
        vis.yAxis = d3.axisLeft()
            .scale(vis.y).ticks(3);

        vis.yGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.xGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(" + 0 + "," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        vis.svg.append("text")
            .attr("class", "axis-label")
            .text("Frequency in paper titles and abstracts")
            .attr("x", -35)
            .attr("y", vis.width + 30)
            .attr("transform", "rotate(270, -35, "+ (vis.width + 30) + ")");

    }

    wrangleData() {
        let vis = this;

        // a new list of words, now has to parse
        vis.plotLongString = wordBarLongString;
        vis.plotLongString = vis.plotLongString.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g,"");
        vis.plotLongString = vis.plotLongString.toLowerCase();


        let wordCount = vis.plotLongString.split(" ").reduce(function(map, word){
            map[word] = (map[word]||0)+1;
            return map;
        }, Object.create(null));


        let filteredWords = [];
        // from https://gist.github.com/sebleier/554280, for stop words
        let stopWords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
        for (const property in wordCount) {
            if ((property.length > 0) && (/[a-zA-Z]/).test(property[0]) && !stopWords.includes(property)) {
                filteredWords.push(property);
            }
        }

        // then to get the top 10
        // break ties with the longer word
        filteredWords = filteredWords.sort((a,b) => b.length - a.length).sort((a,b) => wordCount[b] - wordCount[a]);
        filteredWords = filteredWords.slice(0, 10);
        let displayData = [];
        filteredWords.forEach((wrd) => {
            let tempObj = {};
            tempObj.word = wrd;
            tempObj.wordCount = wordCount[wrd];
            displayData.push(tempObj);
        });

        vis.displayData = displayData;

        // specify domains of scales
        vis.x.domain(vis.displayData.map(d=> d["word"]));

        vis.y.domain([0,d3.max(vis.displayData, d=>d["wordCount"])]);

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // key is state, so that's where data comes in
        vis.rects = vis.svg.selectAll("rect").data(vis.displayData, (d) => d["word"]);

        // remove
        vis.rects.exit()
            .transition()
            .remove();

        vis.rects.enter().append("rect")
            .attr("width",vis.x.bandwidth())
            .attr("height", d=> vis.height - vis.y(d["wordCount"]))
            .attr("y", d=> vis.y(d["wordCount"]))
            .attr("opacity", 0.0)
            .merge(vis.rects)
            .transition()
            .duration(750)
            .attr("x", d=> vis.x(d["word"]))
            .attr("y", d=> vis.y(d["wordCount"]))
            .attr("width", vis.x.bandwidth())
            .attr("height", d=> vis.height - vis.y(d["wordCount"]))
            .attr("fill", function(d) {
                return wordBarColor; // this doesn't work when color is like white
                //return "purple";
            })
            .attr("class","bar")
            .attr('stroke-width', '1px')
            .attr('stroke', 'gray')
            .attr("opacity", 1.0);
        // update x-axis
        vis.svg.select(".x-axis")
            .transition()
            .duration(750)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 5)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45, 0, 4)")
            .style("text-anchor", "start");

        vis.svg.select(".y-axis")
            .transition()
            .duration(750)
            .call(vis.yAxis);

        vis.subTitleTop.text(wordBarSubTitleTop);
        vis.subTitleBottom.text(wordBarSubTitleBottom);

    }
}