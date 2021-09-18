let wordBarLongString = ""; // this will be modified with words, if we do new things with the bar graph
let wordBarSubTitleTop = "";
let wordBarSubTitleBottom = "";
let wordBarColor = ""; // send over the color of the selected box
let selectedFacultyAdjFilter = "";
let selectedFacultyTableFilter = "";
let selectedFacultyNetworkViz=0;

// load data using promises
let promises = [
    d3.csv("data/faculty_coauthor_matrix.csv"),
    d3.csv('data/per_paper_vals_v1.csv'),
    d3.csv('data/Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Courses.csv'),
    d3.csv('data/Visualization Data_News.csv'),
    d3.csv('data/Visualization Data_Programs.csv'),
    d3.csv('data/Final Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Centers.csv')
    // please add additional data AFTER these, so that people's indexing isn't messed up...
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('Check out the data', dataArray);
    let facultyCoauthorMatrix = dataArray[0];
    let perPaperVals = dataArray[1];
    let peopleData = dataArray[2]; // this is outdated (info is ok, but too many faculty)
    let coursesData = dataArray[3];
    let newsData = dataArray[4];
    let programsData = dataArray[5];
    let latestPeopleData = dataArray[6];  // this is latest list of faculty (as of 11/21)
    let centers = dataArray[7];

    // initialize the visualizations here
    myWordBarVis = new wordBarVis("word-frequency-chart");
    myFacultyAdjVis = new adjMatrixVis("faculty-adj-matrix", peopleData, perPaperVals, latestPeopleData);
    myFacultyManyTableVis = new manyTableVis("faculty-interest-table", peopleData, coursesData, latestPeopleData);
    myFacultyDotsVis = new groupDotsVis("faculty-dots", peopleData, coursesData, latestPeopleData, nodeData);
    myRelationshipVis = new RelationshipVis("relationshipDiv", latestPeopleData, centers);
    myNetworkVis = new NetworkGraph("network-graph", nodeData, myFacultyDotsVis.allInfoMap);
    myNetworkBarVis = new NetworkBarGraph("network-counts", nodeData.links);
    myMapVis = new MapVis("faculty-map", nodeData.nodes, latestPeopleData, [42.378784,-71.116824])
    myChordVis = new ChordVis("location-chord", nodeData)
}

// handle buttons, sorting, selecting etc. down here

// for the faculty adjacency matrix
selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
function sortChangeFacultyAdj() {
    // update matrix once we've changed sorted values
    selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
    myFacultyAdjVis.wrangleData();
}

selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
let newFilterBack = false;
function filterChangeFacultyAdj() {
    // filter matrix by these values
    selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
    newFilterBack = (selectedFacultyAdjFilter == "All");
    myFacultyAdjVis.wrangleData();
}

// for the faculty heatmap table for research interests

selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
//let newFilterBack = false;
function filterChangeFacultyTable() {
    // filter matrix by these values
    selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
    //newFilterBack = (selectedFacultyAdjFilter == "All");
    myFacultyManyTableVis.wrangleData();
}
selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
function sortFacultyChangeFacultyTable() {
    // sort table, via the faculty
    selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
    myFacultyManyTableVis.wrangleData();
}

selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
function sortResearchChangeFacultyTable() {
    // sort table, via research interests
    selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
    myFacultyManyTableVis.wrangleData();
}

// for the group faculty dots
selectedFacultyDotGrouping = $('#faculty-dots-group-selector').val();

function groupFacultyDotsSelector() {
    selectedFacultyDotGrouping = $('#faculty-dots-group-selector').val();
    myFacultyDotsVis.wrangleData();

}

// for the network visualization
// from https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array
function populateDropDown(i) {
    var select = document.getElementById(i);
    var options = nodeData.nodes.map(d=>d.name)
    var ids = nodeData.nodes.map(d=>d.id)

    for(var i = 0; i < options.length; i++) {
        var opt = options[i];
        var id = ids[i]
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = id;
        select.appendChild(el);
    }

}

populateDropDown("network-selector");

function networkTableSelector() {
    selectedFacultyNetworkViz = $("#network-selector").val();
    $(".table").empty();
    myNetworkVis.updateVis();
    if (selectedFacultyNetworkViz>0) {
        $("#network-table").append('<table style="width: auto;"> <tr> <td>Title</td> <td id="network-title" class="table" ></td> </tr>'+
            '<tr> <td>Research Interests</td><td id="network-research-interests" class="table" ></td> </tr>'+
            '<tr><td>Teaching Areas</td> <td id="network-teaching-areas" class="table" ></td> </tr>'+
            '<tr><td>Location</td><td id="network-location" class="table" ></td></tr> </table>');
        let tableData = nodeData.nodes.find(x => x.id == selectedFacultyNetworkViz);
        $("#network-title").text(tableData.primaryTitle);
        $("#network-research-interests").text(tableData.researchInterests);
        $("#network-teaching-areas").text(tableData.teachingArea);
        $("#network-location").text(tableData.location)
        $('#network-pic').prepend('<a href="http://seasdrupalstg.prod.acquia-sites.com/node/'
            +selectedFacultyNetworkViz.toString()+'" target="_blank">'+
            '<img id="faculty-image" src='+tableData.image +' title="Click to go to my card" width=200 height=300/>' +
            '</a>')
    }
}

// from https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

/*get array of faculty names for autocomplete*/
var faculty = nodeData.nodes.map(d=>d.name)

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), faculty);

function zoomMap() {
    /* stop search input form from default refreshing*/
    $("#map-form").submit(function(e) {
        e.preventDefault();
    });

    let myFaculty = document.getElementById('myInput').value;
    if (myFaculty) {
        let myMapView = nodeData.nodes.find(obj => {
            return obj.name == myFaculty
        })
        let myCoordinates = myMapView.coordinates
        myMapVis.map.setView(myCoordinates, 20);
        myMapVis.updateVis();

        myChordVis.svg.selectAll("path.chord")
            .transition()
            .style("stroke-opacity", 0.7)
            .style("fill-opacity", 0.7);

        let myLocation = myMapView.location;
        let myIndex = myChordVis.locationArray.indexOf(myLocation);
        myChordVis.svg.selectAll("path.chord")
            .filter(function(d) { return d.source.index != myIndex && d.target.index != myIndex; })
            .transition()
            .style("stroke-opacity", 0.02)
            .style("fill-opacity", 0.02);
    }
    else {
        myMapVis.map.setView([42.378784,-71.116824],13);
        myMapVis.wrangleData()
        myChordVis.svg.selectAll("path.chord")
            .transition()
            .style("stroke-opacity", 0.7)
            .style("fill-opacity", 0.7);
    }
}

function hideClicker() {
    d3.select("#network-clicker")
        .style("visibility", "hidden");
}