import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import { Map as MapIcon, Terrain, NightsStay } from '@mui/icons-material';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiaHVtYW5lLXNvbHV0aW9ucyIsImEiOiJja3V0MzdlYzcwMmM0Mm9sZm1idW9jODNvIn0.cuGK4uYv9GRpHAO4U3Utyw';

const BASEMAPS = {
  streets: 'mapbox://styles/mapbox/streets-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
  night: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

type BasemapType = keyof typeof BASEMAPS;

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [basemap, setBasemap] = useState<BasemapType>('night');
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: BASEMAPS[basemap],
        center: [-74.5, 40],
        zoom: 9
      });

      map.current.on('load', () => {
        setMapInitialized(true);
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 'bottom-right');

      // Add geolocate control
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'bottom-right');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle basemap changes
  useEffect(() => {
    if (map.current && mapInitialized) {
      try {
        map.current.setStyle(BASEMAPS[basemap]);
      } catch (error) {
        console.error('Error changing basemap:', error);
      }
    }
  }, [basemap, mapInitialized]);

  const handleBasemapChange = (_: React.MouseEvent<HTMLElement>, newBasemap: BasemapType | null) => {
    if (newBasemap) {
      setBasemap(newBasemap);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: 'calc(100vh - 88px)' }}>
      <Box
        ref={mapContainer}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%'
        }}
      />
      
      {/* Basemap Switcher */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          p: 0.5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <ToggleButtonGroup
          value={basemap}
          exclusive
          onChange={handleBasemapChange}
          size="small"
          orientation="vertical"
        >
          <ToggleButton value="streets" aria-label="streets">
            <MapIcon />
          </ToggleButton>
          <ToggleButton value="satellite" aria-label="satellite">
            <Terrain />
          </ToggleButton>
          <ToggleButton value="night" aria-label="night">
            <NightsStay />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
} 