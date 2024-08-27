/*
 Rotation of map
*/

import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import 'ol/ol.css'
const NavigationTool = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        const view = new View({
            center: [0, 0],
            zoom: 2,
            rotation: 0, // Initial rotation is north-up
        });

        const mapInstance = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: new VectorSource(),
                }),
            ],
            view: view,
        });

        setMap(mapInstance);

        return () => mapInstance.setTarget(null);
    }, []);

    const resetBearingDynamically = () => {
        if (map) {
            const view = map.getView();
            view.animate({
                rotation: 90, // Reset rotation to 0 radians (north-up)
                duration: 1000, // Optional: add animation duration for smooth transition
            });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
                <button onClick={resetBearingDynamically}>Reset Bearing to North</button>
            </div>
        </div>
    );
};

export default NavigationTool;
