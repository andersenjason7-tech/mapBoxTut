import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { SearchBox } from '@mapbox/search-js-react'

import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const center = [-71.05953, 42.36290];

function App() {

  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [inputValue, setInputValue] = useState("");
  const popupRef = useRef(null);

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
      mapRef.current.addSource('earthquakes', {
        type: 'geojson',
        data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
      });

      mapRef.current.addLayer({
        id: 'earthquakes',
        type: 'circle',
        source: 'earthquakes',
        paint: {
          'circle-radius': 4,
          'circle-stroke-width': 2,
          'circle-color': '#f00',
          'circle-stroke-color': 'white'
        }
      });



      // Change cursor on hover
      mapRef.current.on('mouseenter', 'earthquakes', (e) => {
        mapRef.current.getCanvas().style.cursor = 'pointer';

        // Get coordinates from the feature
        const coordinates = e.features[0].geometry.coordinates.slice();
        const [longitude, latitude] = coordinates;

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
              Latitude: ${latitude.toFixed(4)}<br/>
              Longitude: ${longitude.toFixed(4)}
            </div>
          `)
          .addTo(mapRef.current);
      });

            // Remove popup on mouse leave
      mapRef.current.on('mouseleave', 'earthquakes', () => {
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

