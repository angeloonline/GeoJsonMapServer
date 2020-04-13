import { MAPBOX_ACCESSTOKEN } from './constants.js'

window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(location.search)
    console.log(params.toString())
    let varMap = params.get('geojsonmap')
    console.log('varMap: ' + varMap)
    mapboxgl.accessToken = MAPBOX_ACCESSTOKEN
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 5,
        center: [12.496365, 41.902782],
    })
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl())

    var layerList = document.getElementById('menu')
    var inputs = layerList.getElementsByTagName('input')

    var slider = document.getElementById('slider')
    var sliderValue = document.getElementById('slider-value')

    function switchLayer(layer) {
        var layerId = layer.target.id
        map.setStyle('mapbox://styles/mapbox/' + layerId)
    }

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onclick = switchLayer
    }

    // Omnivore will AJAX-request this file behind the scenes and parse it:
    // note that there are considerations:
    // - The file must either be on the same domain as the page that requests it,
    //   or both the server it is requested from and the user's browser must
    //   support CORS.

    // Internally this function uses the TopoJSON library to decode the given file
    // into GeoJSON.
    map.on('load', function() {
        if (varMap == null) return

        var features = map.querySourceFeatures('geojson-map')
        var boundingBox = getBoundingBox(features)
        document.getElementById('zoomto').addEventListener('click', function() {
            map.fitBounds(
                [
                    [boundingBox.xMin, boundingBox.yMin],
                    [boundingBox.xMax, boundingBox.yMax],
                ],
                {
                    padding: 20,
                }
            )
        })
    })
    map.on('style.load', function() {
        // Triggered when `setStyle` is called.
        addDataLayer()
    })

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice()

        var container = document.createElement('containertable')

        // DRAW HTML TABLE

        var perrow = 2, // 2 items per row
            count = 0, // Flag for current cell
            table = document.createElement('table'),
            row = table.insertRow()
        table.classList.add('table')
        table.classList.add('table-striped')

        for (var property in e.features[0].properties) {
            var cell = row.insertCell()
            cell.innerHTML = _.startCase(property)
            cell = row.insertCell()
            cell.innerHTML = e.features[0].properties[property]

            // Break into next row
            row = table.insertRow()

            // You can also attach a click listener if you want
            row.addEventListener('click', function() {
                alert(row.innerHTML)
            })
        }

        container.appendChild(table)

        console.log('Place properties: ')
        for (var property in e.features[0].properties) {
            console.log(property + ' : ' + e.features[0].properties[property])
        }
        var name =
            e.features[0].properties.name == undefined
                ? e.features[0].properties.prov_name
                : e.features[0].properties.name

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(container.innerHTML)
            .addTo(map)
    })
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function() {
        map.getCanvas().style.cursor = 'pointer'
    })

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = ''
    })

    function addDataLayer() {
        if (varMap == null) return
        var layers = map.getStyle().layers
        // Find the index of the first symbol layer in the map style
        var firstSymbolId
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                firstSymbolId = layers[i].id
                break
            }
        }
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource('geojson-map', {
            type: 'geojson',
            data: './public/mapfile/' + varMap,
            generateId: true,
        })
        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        map.addLayer(
            {
                id: 'places',
                type: 'fill',
                source: 'geojson-map',
                layout: { visibility: 'visible' },
                paint: {
                    'fill-color': '#f08',
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        1,
                        0.5,
                    ],
                },
            },
            firstSymbolId
        )
        //});
        slider.addEventListener('input', function(e) {
            // Adjust the layers opacity. layer here is arbitrary - this could
            // be another layer name found in your style or a custom layer
            // added on the fly using `addSource`.
            var value = parseInt(e.target.value, 10) / 100
            map.setPaintProperty('places', 'fill-opacity', value)

            // Value indicator
            sliderValue.textContent = e.target.value + '%'
        })
    }

    var hoveredStateId = null
    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', 'places', function(e) {
        if (e.features.length > 0) {
            if (hoveredStateId != null) {
                map.setFeatureState(
                    { source: 'geojson-map', id: hoveredStateId },
                    { hover: false }
                )
            }
            hoveredStateId = e.features[0].id
            //console.log('mousemove Id: '+ hoveredStateId)
            map.setFeatureState(
                { source: 'geojson-map', id: hoveredStateId },
                { hover: true }
            )
        }
    })

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'places', function() {
        //console.log('mouseleave Id: '+ hoveredStateId)
        if (hoveredStateId != null) {
            map.setFeatureState(
                { source: 'geojson-map', id: hoveredStateId },
                { hover: false }
            )
        }
        hoveredStateId = null
    })

    function getBoundingBox(polygons) {
        var bounds = {},
            coords,
            point,
            latitude,
            longitude
        for (var i = 0; i < polygons.length; i++) {
            var coords = polygons[i].geometry.coordinates
            for (var j = 0; j < coords.length; j++) {
                for (var k = 0; k < coords[j].length; k++) {
                    longitude = coords[j][k][0]
                    latitude = coords[j][k][1]
                    bounds.xMin =
                        bounds.xMin < longitude ? bounds.xMin : longitude
                    bounds.xMax =
                        bounds.xMax > longitude ? bounds.xMax : longitude
                    bounds.yMin =
                        bounds.yMin < latitude ? bounds.yMin : latitude
                    bounds.yMax =
                        bounds.yMax > latitude ? bounds.yMax : latitude
                }
            }
        }
        return bounds
    }

    var toggleableLayerIds = ['places']

    for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i]

        var link = document.createElement('a')
        link.href = '#'
        link.className = 'active'
        link.textContent = id

        link.onclick = function(e) {
            var clickedLayer = this.textContent
            e.preventDefault()
            e.stopPropagation()

            var visibility = map.getLayoutProperty(clickedLayer, 'visibility')

            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none')
                this.className = ''
            } else {
                this.className = 'active'
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible')
            }
        }

        var layers = document.getElementById('menuLayer')
        layers.appendChild(link)
    }
})
