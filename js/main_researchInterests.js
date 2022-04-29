// load data using promises
let promises = [
    d3.csv('data/Final_Visualization_Data_People.csv')
    // d3.csv('https://seas.harvard.edu/viz/people')
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {
    // log data
    // console.log(dataArray)
    // let latestPeopleData = dataArray;

    // initialize the visualization here
    myVisResearchInterests = new visResearchInterests("faculty-interest-table", dataArray[0]);
}

// handle buttons, sorting, selecting etc. down here

// for the faculty heatmap table for research interests
let selectedFacultyTableFilterRI = $('#faculty-table-filter-research-selector').val();
let selectedFacultyTableFilterAA = $('#faculty-table-filter-academic-selector').val();
let selectedColorPalette = false;
var selectedSortTable = false;
//let newFilterBack = false;

function filterChangeFacultyTableAA() {
    // filter matrix by these values
    selectedFacultyTableFilterAA = $('#faculty-table-filter-academic-selector').val();
    //newFilterBack = (selectedFacultyAdjFilter == "All");
    myVisResearchInterests.wrangleData();
}

function filterChangeFacultyTableRI() {
    // filter matrix by these values
    selectedFacultyTableFilterRI = $('#faculty-table-filter-research-selector').val();
    //newFilterBack = (selectedFacultyAdjFilter == "All");
    myVisResearchInterests.wrangleData();
}

// selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
// function sortFacultyChangeFacultyTable() {
//     // sort table, via the faculty
//     selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
//     myVisResearchInterests.wrangleData();
// }
// selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
function sortTable() {
    // sort table, via research interests
    selectedSortTable =! selectedSortTable;
    // selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
    myVisResearchInterests.wrangleData();
}

function changeColorPalette(){
    selectedColorPalette = !selectedColorPalette;
    myVisResearchInterests.wrangleData();

}
