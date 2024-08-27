import 'ol/ol.css'
import './point.css'
import React, { useState, useRef, useEffect } from 'react';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';

export default function PointTool() {
    const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        const view = new View({
            center: [0, 0],
            zoom: 2,
        });

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
            view: view,
        });

        setMap(mapInstance);

        return () => mapInstance.setTarget(null);
    }, []);

    const handleDrawPoint = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!coordinates.lat || !coordinates.lon) {
            alert('Please enter valid latitude and longitude.');
            return;
        }

        const pointCoords = fromLonLat([parseFloat(coordinates.lon), parseFloat(coordinates.lat)]);
        const point = new Point(pointCoords);
        const pointFeature = new Feature({
            geometry: point,
        });


        vectorSource.current.clear(); // Clear previous features if needed
        vectorSource.current.addFeature(pointFeature);

        // Adjust map view to center on the point
        map.getView();
    };

    return (
        <>
            <div  id='map'ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <div style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'white', padding: '10px', zIndex: 1000 }}>
                <form onSubmit={handleDrawPoint}>
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
                    <button type="submit">Draw Point</button>
                </form>
            </div>


        </>

    );
}
