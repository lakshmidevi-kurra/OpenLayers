import React, { useState, useRef, useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleGeom, } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css'
const CircleTool = () => {
    const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
    const [radius, setRadius] = useState('');
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        const mapInstance = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: vectorSource.current,
                }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        });

        setMap(mapInstance);

        return () => mapInstance.setTarget(null);
    }, []);

    const handleDrawCircle = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!coordinates.lat || !coordinates.lon || !radius) {
            alert('Please enter valid latitude, longitude, and radius.');
            return;
        }

        const center = fromLonLat([parseFloat(coordinates.lon), parseFloat(coordinates.lat)]);
        const radiusin=parseFloat(radius)*1000
        const circleGeom = new CircleGeom(center, radiusin);
        const circleFeature = new Feature(circleGeom);

        // Optional: Set a custom style for the circle
        circleFeature.setStyle(
            new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 5,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            })
        );

        vectorSource.current.clear();  // Clear previous features if needed
        vectorSource.current.addFeature(circleFeature);

        // Adjust map view to center on the circle
        map.getView().animate({ center: center, zoom: 10, duration: 1000 });
    };

    return (
        <div>
            <form onSubmit={handleDrawCircle}>
                <div>
                    <label>
                        Latitude:
                        <input
                            type="number"
                            value={coordinates.lat}
                            onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                            required
                            placeholder="Latitude"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Longitude:
                        <input
                            type="number"
                            value={coordinates.lon}
                            onChange={(e) => setCoordinates({ ...coordinates, lon: e.target.value })}
                            required
                            placeholder="Longitude"
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Radius (in meters):
                        <input
                            type="number"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            required
                            placeholder="Radius"
                        />
                    </label>
                </div>
                <button type="submit">Draw Circle</button>
            </form>
            <div ref={mapRef} style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
        </div>
    );
};

export default CircleTool;
