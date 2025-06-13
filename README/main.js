// Using Leaflet for creating the map and adding controls for interacting with the map

//
//--- Part 1: adding base maps ---
//

//creating the map; defining the location in the center of the map (geographic coords) and the zoom level. These are properties of the leaflet map object
//the map window has been given the id 'map' in the .html file
// Creating the map centered on Salzburg city with a closer zoom level
var map = L.map('map', {
	center: [47.8095, 13.0550], // Coordinates for Salzburg city center
	zoom: 13 // Closer view suitable for showing specific stores
});


//adding base map/s 

// add open street map as base layer
var osmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	

// for using the two base maps in the layer control, I defined a baseMaps variable
var baseMaps = {
	"Open Street Map": osmap
}

//
//---- Part 2: Adding a scale bar
//
L.control.scale({position:'bottomright',imperial:false}).addTo(map);



//
//
//---- Part 3: adding GeoJSON line features 
//
// Adding GeoJSON line features representing walking routes or shopping streets
// Assuming you have a GeoJSON object 'mwalk' loaded or imported

// Example GeoJSON line features representing shopping routes (replace with your real data)

fetch('data/clothshops.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b>`);
        }
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }
    }).addTo(map);
  });






//
//---- Part 4: adding an event to the map
//

// Function to handle the double click event
function onDoubleClick(event) {
    alert("Coordinates: " + event.latlng.lat.toFixed(5) + ", " + event.latlng.lng.toFixed(5));
}

// Use 'dblclick' instead of 'click'
map.on('dblclick', onDoubleClick);


//
//---- Part 5: Adding GeoJSON features and interactivity
fetch('data/clothshops.geojson')
  .then(response => {
    if (!response.ok) {
      throw new Error("GeoJSON file not found or can't be loaded");
    }
    return response.json();
  })
  .then(data => {
    // Create a GeoJSON layer with your data
    let shopsLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#ff7800",  // base orange color
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          // Popup with shop name and optional details
          let popupContent = `<b>${feature.properties.name}</b>`;
          if(feature.properties.address) popupContent += `<br>Address: ${feature.properties.address}`;
          if(feature.properties.hours) popupContent += `<br>Hours: ${feature.properties.hours}`;
          layer.bindPopup(popupContent);
        }

        // Highlight marker on mouseover (increase size and change color)
        layer.on('mouseover', function () {
          this.setStyle({
            fillColor: '#ffff00',  // yellow highlight
            radius: 10,
            weight: 2,
            color: '#ffaa00'
          });
          this.openPopup();
        });

        // Reset marker style on mouseout
        layer.on('mouseout', function () {
          this.setStyle({
            fillColor: '#ff7800',
            radius: 6,
            weight: 1,
            color: '#000'
          });
          this.closePopup();
        });

        // Zoom to marker on click with smooth animation
        layer.on('click', function (e) {
          map.flyTo(e.latlng, 16, { animate: true, duration: 1.5 });
        });
      }
    }).addTo(map);

    // --- Additional features ---

    // 1. Add a search control to find shops by name
    let searchControl = new L.Control.Search({
      layer: shopsLayer,
      propertyName: 'name',  // search by 'name' property
      marker: false,
      moveToLocation: function(latlng, title, map) {
        map.flyTo(latlng, 16, { animate: true, duration: 1.5 });
      }
    });
    map.addControl(searchControl);

    // 2. Add a legend describing marker colors or types (if you have types)
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend');
      div.innerHTML += '<h4>Clothing Shops</h4>';
      div.innerHTML += '<i style="background: #ff7800"></i> Shop Marker<br>';
      div.innerHTML += '<i style="background: #ffff00"></i> Highlighted Shop<br>';
      return div;
    };
    legend.addTo(map);

    // 3. Bonus: Add a pulse animation effect on marker hover
    shopsLayer.eachLayer(function(layer) {
      layer.on('mouseover', function() {
        this.getElement().classList.add('pulse-marker');
      });
      layer.on('mouseout', function() {
        this.getElement().classList.remove('pulse-marker');
      });
    });

  })
  .catch(error => {
    console.error("Error loading GeoJSON:", error);
  });




//
//---- Part 6: Adding GeoJSON features and several forms of interactivity
//comment out part 5 before testing part 6
 
// Assume your GeoJSON data variable is called `clothshops`
// and your map instance is `map`

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    radius: 10,          // increase radius on hover
    fillColor: '#ffff00', // yellow fill
    color: '#666',        // border color
    weight: 3,
    fillOpacity: 1
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  var layer = e.target;
  layer.setStyle({
    radius: 6,
    fillColor: '#ff7800',
    color: '#000',
    weight: 1,
    fillOpacity: 0.8
  });
}

function zoomToFeature(e) {
  map.setView(e.latlng, 16);
}

// This function attaches event listeners to each feature (marker)
function interactiveFunction(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });

  // Also add a popup
  if (feature.properties && feature.properties.name) {
    layer.bindPopup(`<b>${feature.properties.name}</b><br>${feature.properties.address || ''}`);
  }
}

// Style for the circle markers
var shopStyle = {
  radius: 6,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

// Load and add your GeoJSON layer
fetch('data/clothshops.geojson')
  .then(response => {
    if (!response.ok) throw new Error("GeoJSON file not found or can't be loaded");
    return response.json();
  })
  .then(data => {
    L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, shopStyle);
      },
      onEachFeature: interactiveFunction
    }).addTo(map);
  })
  .catch(err => console.error(err));



//
//---- Part 7: adding GeoJSON point features to marker object
//

// GeoJSON data for clothing shops (example with three shops)
var clothshopsJson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Fashion Boutique",
        "address": "Getreidegasse 12"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [13.0438, 47.8005]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Style Store",
        "address": "Schallmooser Hauptstraße 45"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [13.0602, 47.8102]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Urban Outfitters",
        "address": "Linzer Gasse 3"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [13.0476, 47.8121]
      }
    }
  ]
};

// Create a custom icon for clothing shops
var clothShopIcon = L.icon({
  iconUrl: 'css/images/clothshop.png', // Path to your icon image (replace with your own)
  iconSize: [30, 30],
  iconAnchor: [15, 30],    // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -30]    // Popup position relative to the icon
});

// Add GeoJSON layer with custom markers and enhanced popups
var clothShopsLayer = L.geoJson(clothshopsJson, {
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, { icon: clothShopIcon, title: feature.properties.name });
  },
  onEachFeature: function(feature, marker) {
    var coords = feature.geometry.coordinates;
    var lat = coords[1].toFixed(5);
    var lng = coords[0].toFixed(5);
    marker.bindPopup(
      `<b>${feature.properties.name}</b><br>` +
      `${feature.properties.address || 'Address not available'}<br>` +
      `Coordinates: ${lat}, ${lng}`
    );
  }
}).addTo(map);

var clothingShops = L.geoJson(clothshopsJson, {
  filter: function(feature) {
    return feature.properties.type === 'clothing';
  },
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, { icon: clothShopIcon });
  },
  onEachFeature: function(feature, layer) {
    layer.bindPopup(feature.properties.name);
  }
});

var sportsShops = L.geoJson(clothshopsJson, {
  filter: function(feature) {
    return feature.properties.type === 'sports';
  },
  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, { icon: sportsShopIcon }); // другой иконка для спорта
  },
  onEachFeature: function(feature, layer) {
    layer.bindPopup(feature.properties.name);
  }
});




//
//---- Part 8: Adding a layer control for base maps and feature layers
//

var satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenTopoMap contributors'
});

var features = {
  "Clothing Shops": clothingShops,
  "Sports Shops": sportsShops
};






