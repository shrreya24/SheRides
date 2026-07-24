import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons (Vite/webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Pink teardrop pin for pickup
const pinkIcon = new L.DivIcon({
  html: `<div style="
    width:26px;height:26px;
    background:linear-gradient(135deg,#D63384,#b02770);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 3px 10px rgba(214,51,132,0.45);
  "></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -28],
});

// Lavender circle pin for destination
const lavenderIcon = new L.DivIcon({
  html: `<div style="
    width:22px;height:22px;
    background:linear-gradient(135deg,#8B5CF6,#7C3AED);
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 3px 10px rgba(139,92,246,0.45);
  "></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Live car icon (pink-lavender gradient circle)
const carIcon = new L.DivIcon({
  html: `<div style="
    background:linear-gradient(135deg,#D63384,#8B5CF6);
    border-radius:50%;
    width:36px;height:36px;
    display:flex;align-items:center;justify-content:center;
    border:3px solid white;
    box-shadow:0 4px 15px rgba(139,92,246,0.5);
  ">
    <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
      <path d='M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2'/>
      <circle cx='7.5' cy='17.5' r='2.5'/><circle cx='17.5' cy='17.5' r='2.5'/>
    </svg>
  </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    const valid = positions.filter(p => p && p[0] && p[1]);
    if (valid.length >= 2) {
      map.fitBounds(valid, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

const PanToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position, map]);
  return null;
};

const MapView = ({
  fromCoords,
  toCoords,
  liveLocation,
  height = '300px',
  showLive = false,
}) => {
  const defaultCenter = [12.9716, 77.5946]; // Bengaluru

  const fromPos = fromCoords?.lat && fromCoords?.lng ? [fromCoords.lat, fromCoords.lng] : null;
  const toPos = toCoords?.lat && toCoords?.lng ? [toCoords.lat, toCoords.lng] : null;
  const livePos = liveLocation?.lat && liveLocation?.lng ? [liveLocation.lat, liveLocation.lng] : null;

  const center = fromPos || livePos || defaultCenter;
  const bounds = [fromPos, toPos].filter(Boolean);

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap contributors"
        />

        {bounds.length >= 2 && <FitBounds positions={bounds} />}
        {showLive && livePos && <PanToLocation position={livePos} />}

        {fromPos && (
          <Marker position={fromPos} icon={pinkIcon}>
            <Popup>Pickup point</Popup>
          </Marker>
        )}

        {toPos && (
          <Marker position={toPos} icon={lavenderIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {fromPos && toPos && (
          <Polyline
            positions={[fromPos, toPos]}
            color="#8B5CF6"
            weight={3}
            opacity={0.55}
            dashArray="8, 8"
          />
        )}

        {showLive && livePos && (
          <Marker position={livePos} icon={carIcon}>
            <Popup>Live location</Popup>
          </Marker>
        )}

        {showLive && livePos && fromPos && (
          <Polyline
            positions={[fromPos, livePos]}
            color="#22C55E"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
