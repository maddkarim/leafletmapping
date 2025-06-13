// Using Leaflet for creating the map and adding controls for interacting with the map

// 1. Initialize Map with Salzburg coordinates
const map = L.map('map').setView([47.8095, 13.0550], 14); // [lat, lng], zoom

// 2. Add Base Tile Layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Define Marker Style
const shopStyle = {
    radius: 8,
    fillColor: "#ff7800", // Orange fill
    color: "#000",       // Black border
    weight: 1,           // Border thickness
    fillOpacity: 0.8     // Transparency
};

// 4. Load Shops Data - CORRECTED PATH
fetch('clothshops.geojson') // ← Now looks in root folder
    .then(response => {
        if (!response.ok) throw new Error("Failed to load GeoJSON");
        return response.json();
    })
    .then(data => {
        // 5. Create GeoJSON Layer
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, shopStyle);
            },
            onEachFeature: (feature, layer) => {
                // 6. Add Popup Content
                if (feature.properties?.name) {
                    layer.bindPopup(`
                        <b>${feature.properties.name}</b>
                        ${feature.properties.address ? `<br>${feature.properties.address}` : ''}
                    `);
                }
                
                // 7. Add Interactivity
                layer.on({
                    mouseover: e => e.target.setStyle({ fillColor: '#ffff00' }),
                    mouseout: e => e.target.setStyle({ fillColor: '#ff7800' }),
                    click: e => map.flyTo(e.latlng, 16)
                });
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error("Loading failed:", error);
        // 8. Fallback Test Marker
        L.marker([47.8095, 13.0550])
            .addTo(map)
            .bindPopup("<b>Test Marker</b><br>Salzburg Center")
            .openPopup();
    });
    





