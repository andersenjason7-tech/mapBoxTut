import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { SearchBox } from '@mapbox/search-js-react'

import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const center = [-104.05953, 40.36290];



function App() {

  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [inputValue, setInputValue] = useState("");
  const popupRef = useRef(null);
  const [circleRadius, setCircleRadius] = useState(15);  // Default radius

  useEffect(() => {
    mapboxgl.accessToken = accessToken

     mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center:  center,
      zoom: 8,
    });

         // Create the popup UI, but don't add it to the map yet.
        // You only want the UI to appear once the cursor is hovering over an element.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });
        popupRef.current = popup;

       // Add source and layer on map load
    mapRef.current.on('load', () => {
 

//add the temple layer to the map
//first add the image to the map

  mapRef.current.loadImage('/temple-icon.png', (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('temple-icon', image);
  });

     mapRef.current.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
      });
  // Add another source/layer
  mapRef.current.addSource('temples', {
    type: 'geojson',
    data: '/ChurchofJesusChristTemples.geojson' // or your own URL/path
  });

  mapRef.current.addLayer({
    id: 'temples',
    type: 'symbol',
    source: 'temples',
    layout: {
      'icon-image': 'temple-icon', // Use the loaded image as the icon
      'icon-size': 0.5, // Adjust size as needed
      'icon-allow-overlap': true // Allow icons to overlap if necessary
    },
    paint: {
      'icon-opacity': 1,  // Optional: adjust opacity
   
    }
  });


  mapRef.current.addLayer({
        id: 'templeCircles',
        type: 'circle',
        source: 'temples',
        paint: {
          'circle-radius': circleRadius,
          'circle-stroke-width': 2,
          'circle-color': 'rgb(247, 235, 235)',
          'circle-stroke-color': 'white',
          'circle-opacity': 0.6
        }
      });
  
      // Change cursor on hover
      mapRef.current.on('mouseenter', 'earthquakes', (e) => {
        mapRef.current.getCanvas().style.cursor = 'pointer';

        // Get coordinates from the feature
        const coordinates = e.features[0].geometry.coordinates.slice();
        const [longitude, latitude] = coordinates;

        const properties = e.features[0].properties;
        const earthquakeId = properties.id || 'N/A';
        const earthquakeTime = properties.time ? new Date(properties.time).toLocaleString('en-US')  : 'N/A';
        const earthquakeMagnitude = properties.mag || 'N/A';

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Set popup content and location
        popupRef.current
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 8px;">
              <strong>Location</strong><br/>
              <strong>ID:</strong> ${earthquakeId}<br/>
              <strong>Time:</strong> ${earthquakeTime}<br/>
              <strong>Magnitude:</strong> ${earthquakeMagnitude}<br/>
              Latitude: ${latitude.toFixed(4)}<br/>
              Longitude: ${longitude.toFixed(4)}
            </div>
          `)
          .addTo(mapRef.current);
      });

            // Remove popup on mouse leave
      mapRef.current.on('mouseleave', 'temples', () => {
        mapRef.current.getCanvas().style.cursor = '';
        popupRef.current.remove();
      });

       // Change cursor on hover
      mapRef.current.on('mouseenter', 'temples', (e) => {
        mapRef.current.getCanvas().style.cursor = 'pointer';

        // Get coordinates from the feature
        const coordinates = e.features[0].geometry.coordinates.slice();
        const [longitude, latitude] = coordinates;

        const properties = e.features[0].properties;
        const templeId = properties.Name || 'N/A';
        const templePhone = properties.Phone || 'N/A';


        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Set popup content and location
        popupRef.current
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 8px;">
              <strong>Location</strong><br/>
              <strong>Name:</strong> ${templeId}<br/>
              <strong>Phone:</strong> ${templePhone}<br/>
              Latitude: ${latitude.toFixed(4)}<br/>
              Longitude: ${longitude.toFixed(4)}
            </div>
          `)
          .addTo(mapRef.current);
      });

            // Remove popup on mouse leave
      mapRef.current.on('mouseleave', 'temples', () => {
        mapRef.current.getCanvas().style.cursor = '';
        popupRef.current.remove();
      });




    });

    return () => {
         if (mapRef.current) {
        mapRef.current.remove();
      }
    }
  }, [])


return (
  <>

    <div style={{ margin: '10px', position: 'absolute', zIndex: 10 }}>
      <label>Circle Radius: {circleRadius}</label>
      <input
        type="range"
        min="5"
        max="200"
        value={circleRadius}
        onChange={(e) => {
          const newRadius = parseInt(e.target.value);
          setCircleRadius(newRadius);
          if (mapRef.current) {
            mapRef.current.setPaintProperty('templeCircles', 'circle-radius', newRadius);
          }
        }}
      />
    </div>

    <div style={{
        margin: '10px 10px 0 0',
        width: 300,
        right: 0,
        top: 0,
        position: 'absolute',
        zIndex: 10 }}>
        <SearchBox
            accessToken={accessToken}
            map={mapRef.current}
            mapboxgl={mapboxgl}
            value={inputValue}
            proximity={center}
            onChange={(d) => {
            setInputValue(d);
            }}
            marker
        />
    </div>
    <div id='map-container' ref={mapContainerRef} />
  </>
  )
}

export default App

