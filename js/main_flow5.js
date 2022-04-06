// load data using promises
let promises = [
    d3.csv('data/people.csv')
];
Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {
    // log data
    let latestPeopleData = dataArray[0];

    // initialize the visualization here
    myVisFlow = new visFlow("relationshipDiv", latestPeopleData);
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
