class MapVis {
    constructor(parentElement, nodeData, peopleData, center) {
        this.parentElement = parentElement;
        this.data = nodeData;
        this.peopleData = peopleData;
        this.center = center;
        this.initVis();
    }
    initVis() {
        let vis = this;

        // Initialize map layer
        vis.map = L.map(vis.parentElement).setView(vis.center, 13);

        // Add tile layer to map - initialize with light mode map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        })
            .addTo(vis.map);

        // Add empty layer group for markers
        vis.facultyOffices = L.layerGroup().addTo(vis.map);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // from https://stackoverflow.com/questions/29364262/how-to-group-by-and-sum-array-of-object

            vis.displayData = [];
            vis.data.reduce(function (res, value) {
                if (!res[value.location]) {
                    res[value.location] = {location: value.location, coordinates: value.coordinates, qty: 0};
                    vis.displayData.push(res[value.location])
                }
                res[value.location].qty += 1;
                return res;
            }, {});

        vis.displayData = vis.displayData.filter(function(d) { return d.location != null; });

        // Clear markers in layer
        vis.facultyOffices.clearLayers();

        vis.displayData.forEach( d =>
            vis.facultyOffices.addLayer (L.marker(d.coordinates)
                .bindPopup(	"<strong>"+d.location+"</strong>" +
                    "<br>Number of Faculty: " + d.qty)
            )
        )
    }

    updateVis() {
        let vis = this;

        // Clear markers in layer
        vis.facultyOffices.clearLayers();

        vis.myFaculty = document.getElementById('myInput').value;

        if (vis.myFaculty) {
            vis.myMapView = vis.data.find(obj => {
                return obj.name == vis.myFaculty
            })

            vis.myOffice = vis.peopleData.find(obj => {return obj.Title==vis.myFaculty})
            console.log(vis.myOffice)

            vis.facultyOffices.addLayer(L.marker(vis.myMapView.coordinates)
                .bindPopup(	"<strong>"+vis.myMapView.name+"</strong>" +
                    "<br>Office: "+ vis.myOffice.Office +
                "<br>Teaching Area: "+ vis.myOffice["Teaching Areas"] +
                "<br>Email: " + vis.myOffice.Email +
                "<br>Telephone: " + vis.myOffice.Phone))
        }

        else {
            vis.wrangleData()
        }

    }
}