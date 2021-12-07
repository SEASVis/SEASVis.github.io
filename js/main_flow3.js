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

let allArea = false;
selectedArea = $('#area-filter-selector').val();
function filterArea() {
    selectedArea = $('#area-filter-selector').val();

    if(selectedArea.length > 1 && selectedArea[0] === "Include All" && allArea === false){
        let values = $('#area-filter-selector').val();
        values.shift();
        $('#area-filter-selector').selectpicker('deselectAll');
        $('#area-filter-selector').selectpicker('val', values);
        $('#area-filter-selector').selectpicker('refresh');

        allArea = true;
    }

    if(selectedArea.length > 1 && selectedArea[0] === "Include All" && allArea === true){
        $('#area-filter-selector').selectpicker('deselectAll');
        $('#area-filter-selector').selectpicker('val', 'Include All');
        $('#area-filter-selector').selectpicker('refresh');

        allArea = false;
    }

    if(selectedArea.length === 0){
        $('#area-filter-selector').selectpicker('val', 'Include All');
        $('#area-filter-selector').selectpicker('refresh');

        allArea = false;
    }

    myVisFlow.filterData();
}

let allCenter = false;
selectedCenter = $('#center-filter-selector').val();
function filterCenter() {
    selectedCenter = $('#center-filter-selector').val();

    if(selectedCenter.length > 1 && selectedCenter[0] === "Include All" && allCenter === false){
        let values = $('#center-filter-selector').val();
        values.shift();
        $('#center-filter-selector').selectpicker('deselectAll');
        $('#center-filter-selector').selectpicker('val', values);
        $('#center-filter-selector').selectpicker('refresh');

        allCenter = true;
    }

    if(selectedCenter.length > 1 && selectedCenter[0] === "Include All" && allCenter === true){
        $('#center-filter-selector').selectpicker('deselectAll');
        $('#center-filter-selector').selectpicker('val', 'Include All');
        $('#center-filter-selector').selectpicker('refresh');

        allCenter = false;
    }

    if(selectedCenter.length === 0){
        $('#center-filter-selector').selectpicker('val', 'Include All');
        $('#center-filter-selector').selectpicker('refresh');

        allCenter = false;
    }

    myVisFlow.filterData();
}