import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const BASEMAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  night: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

type BasemapStyle = keyof typeof BASEMAP_STYLES;

class MapboxStyleSwitcherControl {
  private map?: mapboxgl.Map;
  private container?: HTMLDivElement;
  private styleButton?: HTMLButtonElement;

  onAdd(map: mapboxgl.Map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    
    this.styleButton = document.createElement('button');
    this.styleButton.className = 'mapboxgl-ctrl-icon mapboxgl-style-switcher';
    this.styleButton.type = 'button';
    this.styleButton.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,%3Csvg width=\'29\' height=\'29\' viewBox=\'0 0 29 29\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10.5 14l4-8 4 8h-8z\'/%3E%3Cpath d=\'M10.5 16l4 8 4-8h-8z\' fill=\'%23666\'/%3E%3C/svg%3E")';
    this.styleButton.style.backgroundSize = '70%';
    this.styleButton.style.backgroundPosition = 'center';
    this.styleButton.style.backgroundRepeat = 'no-repeat';
    
    let currentStyleIndex = 0;
    const styles = Object.values(BASEMAP_STYLES);
    
    this.styleButton.addEventListener('click', () => {
      currentStyleIndex = (currentStyleIndex + 1) % styles.length;
      this.map?.setStyle(styles[currentStyleIndex]);
    });
    
    this.container.appendChild(this.styleButton);
    return this.container;
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container);
    this.map = undefined;
  }
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [basemap, setBasemap] = useState<BasemapStyle>('night');
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLES[basemap],
      center: [-74.5, 40],
      zoom: 9,
    });

    // Add navigation control (zoom and rotation)
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add geolocate control
    geolocateControl.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocateControl.current, 'top-right');

    // Add style switcher control
    map.current.addControl(
      new MapboxStyleSwitcherControl(),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl(),
      'bottom-right'
    );

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box
        ref={mapContainer}
        sx={{
          flexGrow: 1,
          width: '100%',
          '& .mapboxgl-ctrl-group': {
            marginBottom: '10px'
          },
          '& .mapboxgl-style-switcher': {
            width: '30px',
            height: '30px',
            cursor: 'pointer'
          },
          '& .mapboxgl-ctrl-top-right': {
            top: '10px',
            right: '10px',
            '& .mapboxgl-ctrl': {
              marginBottom: '10px'
            }
          },
          '& .mapboxgl-ctrl-bottom-right': {
            bottom: '10px',
            right: '10px'
          }
        }}
      />
    </Box>
  );
} 