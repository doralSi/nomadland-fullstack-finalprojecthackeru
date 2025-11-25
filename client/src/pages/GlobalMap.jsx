import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRegion } from '../context/RegionContext';
import './GlobalMap.css';

const GlobalMap = () => {
  const { regions, loading, error } = useRegion();
  const navigate = useNavigate();

  // Custom marker icon for region centers
  const createRegionIcon = () =>
    L.divIcon({
      html: `
        <div class="region-marker">
          <span class="material-icons">place</span>
        </div>
      `,
      className: 'custom-region-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35]
    });

  const handleRegionClick = (slug) => {
    navigate(`/region/${slug}`);
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
        <p>Explore our digital nomad communities around the world</p>
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {regions.map((region) => {
            // Convert polygon coordinates from [lng, lat] to [lat, lng] for Leaflet
            const polygonCoords = region.polygon.map(coord => [coord[1], coord[0]]);

            return (
              <React.Fragment key={region._id}>
                {/* Region polygon */}
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
                />

                {/* Region center marker */}
                <Marker
                  position={[region.center.lat, region.center.lng]}
                  icon={createRegionIcon()}
                  eventHandlers={{
                    click: () => handleRegionClick(region.slug)
                  }}
                >
                  <Popup>
                    <div className="region-popup">
                      <h3>{region.name}</h3>
                      <p>{region.description.substring(0, 100)}...</p>
                      <button 
                        className="region-popup-btn"
                        onClick={() => handleRegionClick(region.slug)}
                      >
                        Explore Region
                      </button>
                    </div>
                  </Popup>
                </Marker>
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
