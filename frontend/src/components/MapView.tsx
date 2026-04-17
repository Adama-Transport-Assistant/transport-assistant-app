import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This is necessary to fix the broken marker icons issue in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView() {
  // Center coordinates for Adama, Ethiopia
  const adamaCenter: [number, number] = [8.5400, 39.2700];

  return (
    <div className="h-full w-full relative flex-1 z-10 rounded-xl">
      <MapContainer
        center={adamaCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap standard tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={adamaCenter}>
          <Popup>
            <div className="text-gray-800">
              <span className="font-bold">Adama Center</span>
              <p>Welcome to Adama Smart Transport!</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
