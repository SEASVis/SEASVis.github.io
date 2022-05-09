let wordBarLongString = ""; // this will be modified with words, if we do new things with the bar graph
let wordBarSubTitleTop = "";
let wordBarSubTitleBottom = "";
let wordBarColor = ""; // send over the color of the selected box
let selectedFacultyAdjFilter = "";
let selectedFacultyTableFilterAA = "";
let selectedFacultyTableFilterRI = "";

// load data using promises
let promises = [
    d3.csv('data/per_paper_vals_v1.csv'),
    d3.csv('data/Visualization Data_People.csv'),
    d3.csv('data/Final_Visualization_Data_People.csv')
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {
    // log data
    let perPaperVals = dataArray[0];
    let peopleData = dataArray[1]; // this is outdated (info is ok, but too many faculty)
    let latestPeopleData = dataArray[2];  // this is latest list of faculty (as of 11/21)

    // initialize the visualization here
    myVisCoauthors = new visCoauthors("faculty-adj-matrix", peopleData, perPaperVals, latestPeopleData);
}

// handle buttons, sorting, selecting etc. down here

// for the faculty adjacency matrix
selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
function sortChangeFacultyAdj() {
    // update matrix once we've changed sorted values
    selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
    myVisCoauthors.wrangleData();
}
selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
let newFilterBack = false;
function filterChangeFacultyAdj() {
    // filter matrix by these values
    selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
    newFilterBack = (selectedFacultyAdjFilter == "All");
    myVisCoauthors.wrangleData();
}
