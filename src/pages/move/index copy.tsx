import React, { useState, useEffect } from 'react';
import MapView, { Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default function HomePage() {
     const [position, setPosition] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setPosition(position);
        setCoordinates(prevCoords => [...prevCoords, { latitude, longitude }]);
      },
      error => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="#00F" />
    </MapView>
  );
}
