import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ProjectMap = () => {
  const initialPosition = [51.505, -0.09]; // Replace with your desired coordinates

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={initialPosition}>
        <Popup>Project Boundary Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default ProjectMap;
