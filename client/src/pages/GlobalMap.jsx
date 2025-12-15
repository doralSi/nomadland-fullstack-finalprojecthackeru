import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Tooltip, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRegion } from '../context/RegionContext';
import './GlobalMap.css';

const GlobalMap = () => {
  const { regions, loading, error } = useRegion();
  const navigate = useNavigate();

  const handleRegionClick = (slug) => {
    navigate(`/region/${slug}`);
  };

  // Function to calculate polygon center (centroid)
  const getPolygonCenter = (coordinates) => {
    let latSum = 0;
    let lngSum = 0;
    const count = coordinates.length;

    coordinates.forEach(coord => {
      latSum += coord[1]; // lat
      lngSum += coord[0]; // lng
    });

    return [latSum / count, lngSum / count];
  };

  if (loading) {
    return (
      <div className="global-map-container">
        <div className="global-map-loading">Loading global map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-map-container">
        <div className="global-map-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-map-container">
      <div className="global-map-header">
        <h1>NomadLand Regions</h1>
        <p>Explore travel destinations around the world</p>
      </div>

      <div className="global-map-wrapper">
        <MapContainer
          center={[20, 30]}
          zoom={2}
          scrollWheelZoom={true}
          className="global-leaflet-map"
          minZoom={2}
          maxBounds={[[-90, -180], [90, 180]]}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {regions.map((region) => {
            // Convert polygon coordinates from [lng, lat] to [lat, lng] for Leaflet
            const polygonCoords = region.polygon.map(coord => [coord[1], coord[0]]);
            const center = getPolygonCenter(region.polygon);

            return (
              <React.Fragment key={region._id}>
                <Polygon
                  positions={polygonCoords}
                  pathOptions={{
                    color: '#6e00ff',
                    fillColor: '#6e00ff',
                    fillOpacity: 0.08,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => handleRegionClick(region.slug),
                    mouseover: (e) => {
                      e.target.setStyle({
                        fillOpacity: 0.15,
                        weight: 3
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({
                        fillOpacity: 0.08,
                        weight: 2
                      });
                    }
                  }}
                >
                  <Tooltip 
                    permanent={false}
                    direction="center"
                    className="region-tooltip"
                  >
                    {region.name}
                  </Tooltip>
                </Polygon>
                
                <CircleMarker
                  center={center}
                  radius={8}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#00d4ff',
                    fillOpacity: 1,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => handleRegionClick(region.slug),
                    mouseover: (e) => {
                      e.target.setStyle({
                        radius: 10,
                        weight: 3
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({
                        radius: 8,
                        weight: 2
                      });
                    }
                  }}
                >
                  <Tooltip 
                    permanent={false}
                    direction="top"
                    className="region-tooltip"
                  >
                    {region.name}
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      <div className="global-map-stats">
        <p>
          {regions.length} {regions.length === 1 ? 'region' : 'regions'} available
        </p>
      </div>

      <div className="regions-grid">
        {regions.map((region) => (
          <div 
            key={region._id} 
            className="region-card"
            onClick={() => handleRegionClick(region.slug)}
          >
            {region.heroImageUrl && (
              <div 
                className="region-card-image"
                style={{ backgroundImage: `url(${region.heroImageUrl})` }}
              />
            )}
            <div className="region-card-content">
              <h3>{region.name}</h3>
              <p>{region.description}</p>
              <button className="region-card-btn">
                Explore {region.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalMap;
