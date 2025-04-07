import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { toast } from "react-toastify";
import MinimalLayout from "../layouts/MinimalLayout";

// Fix leaflet icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      setPosition(latlng);
    },
  });

  useEffect(() => {
    if (position) {
      axios
        .get("https://api.opencagedata.com/geocode/v1/json", {
          params: {
            key: "b5d6650c794946dab763740603c1ec35",
            q: `${position.lat}+${position.lng}`,
          },
        })
        .then((res) => {
          const result = res.data.results[0];
          setAddress(result?.formatted || "Unknown location");
        })
        .catch(() => {
          setAddress("Unknown location");
        });
    }
  }, [position]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  ) : null;
}

export default function Location() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        toast.error("Unable to fetch location.");
      }
    );
  }, []);

  const handleSubmit = () => {
    if (!address || address === "Unknown location") {
      toast.error("Please select a valid location.");
      return;
    }
  
    localStorage.setItem("selectedAddress", address); // ✅ Save to localStorage
    navigate("/home");
  };

  return (
    <MinimalLayout>
    <div className="flex flex-col h-screen">
  {/* Header */}
  <div className="p-4 bg-white shadow-md z-10">
    <div className="text-5xl text-center mb-2">📍</div>
    <h2 className="text-xl font-semibold text-center">Confirm Your Location</h2>
    <p className="text-gray-600 text-sm text-center">
      We'll use this to find stores around you
    </p>
    <p className="text-xs text-center text-gray-400 mt-1">Tap or drag the pin on the map</p>
  </div>
      <div className="flex-grow">
        {position && (
          <MapContainer center={position} zoom={16} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              setAddress={setAddress}
            />
          </MapContainer>
        )}
      </div>
       {/* Address + Confirm */}
  <div className="p-4 bg-white shadow-md z-10">
    <input
      type="text"
      className="w-full p-2 border rounded text-center"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
    />
    <button
      onClick={handleSubmit}
      className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg"
    >
      Confirm Location
    </button>
  </div>
    </div>
    </MinimalLayout>
  );
}
