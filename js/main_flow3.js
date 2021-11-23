// load data using promises
let promises = [
    d3.csv('data/Final Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Centers.csv')
];
Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {
    // log data
    let latestPeopleData = dataArray[0];
    let centers = dataArray[1];

    // initialize the visualization here
    myVisFlow = new visFlow("relationshipDiv", latestPeopleData, centers);
}

selectedArea = $('#area-filter-selector').val();
function filterArea() {
    selectedArea = $('#area-filter-selector').val();
    myVisFlow.filterData();
}
selectedCenter = $('#center-filter-selector').val();
function filterCenter() {
    selectedCenter = $('#center-filter-selector').val();
    myVisFlow.filterData();
}