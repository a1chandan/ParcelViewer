let map = L.map('map').setView([27.7, 85.3], 12); // Initial placeholder view
let geojsonLayer;

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Load the GeoJSON data
fetch('data/kolvi_1.json')
    .then(response => response.json())
    .then(data => {
        // Add the GeoJSON layer with initial faint styling
        geojsonLayer = L.geoJSON(data, {
            style: {
                color: '#cccccc',
                weight: 1,
            },
            onEachFeature: (feature, layer) => {
                // Tooltip for parcel number
                layer.bindTooltip(`Parcel No: ${feature.properties.parcelno}`);
            },
        }).addTo(map);

        // Zoom and center map to the extent of the entire GeoJSON on landing
        const geojsonBounds = geojsonLayer.getBounds();
        map.fitBounds(geojsonBounds);
    });

// Add event listener for the search button
document.getElementById('search-btn').addEventListener('click', () => {
    const vdc = document.getElementById('vdc').value.trim();
    const wardno = document.getElementById('wardno').value.trim();
    const parcelno = document.getElementById('parcelno').value.trim();

    let parcelFound = false; // Flag to check if parcel is found

    // Iterate over each feature in the GeoJSON layer
    geojsonLayer.eachLayer(layer => {
        const props = layer.feature.properties;

        // Check if the feature matches the query
        if (props.vdc === vdc && props.wardno === wardno && props.parcelno === parcelno) {
            // Zoom to the parcel bounds and center it
            map.fitBounds(layer.getBounds());
            map.setView(layer.getBounds().getCenter(), 18); // Adjust zoom level as needed

            // Highlight the selected parcel with bold styling
            layer.setStyle({
                color: '#ff0000', // Highlight color
                weight: 3,
            });

            // Reset the style of other parcels to faint
            geojsonLayer.eachLayer(otherLayer => {
                if (otherLayer !== layer) {
                    otherLayer.setStyle({
                        color: '#cccccc',
                        weight: 1,
                    });
                }
            });

            layer.bringToFront(); // Bring the selected parcel to the top
            parcelFound = true;
        }
    });

    // If no parcel matches the query, show an alert
    if (!parcelFound) {
        alert('No parcel found with the given query!');
    }
});
