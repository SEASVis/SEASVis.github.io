// load data using promises
let promises = [
    d3.csv('data/people'),
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

function resetVis() {
    let element = document.getElementById("reset-btn");
    element.setAttribute("hidden", "hidden");
    myVisFlow.filterData(NaN, -1);
}

let selectedColorPalette = false;
function changeColorPalette(){
    selectedColorPalette = !selectedColorPalette;
    myVisFlow.updateVis();
}
