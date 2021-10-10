// load data using promises
let promises = [
    d3.csv('data/Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Courses.csv'),
    d3.csv('data/Final Visualization Data_People.csv'),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {
    // log data
    let peopleData = dataArray[0];
    let coursesData = dataArray[1];
    let latestPeopleData = dataArray[2];

    // initialize the visualization here
    myVisResearchInterests = new visResearchInterests("faculty-interest-table", peopleData, coursesData, latestPeopleData);
}

// handle buttons, sorting, selecting etc. down here

// for the faculty heatmap table for research interests
selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
//let newFilterBack = false;
function filterChangeFacultyTable() {
    // filter matrix by these values
    selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
    //newFilterBack = (selectedFacultyAdjFilter == "All");
    myVisResearchInterests.wrangleData();
}
selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
function sortFacultyChangeFacultyTable() {
    // sort table, via the faculty
    selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
    myVisResearchInterests.wrangleData();
}
selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
function sortResearchChangeFacultyTable() {
    // sort table, via research interests
    selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
    myVisResearchInterests.wrangleData();
}
