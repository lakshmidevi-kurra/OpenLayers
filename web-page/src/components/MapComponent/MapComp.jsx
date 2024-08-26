import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import 'ol/ol.css'
const MapComp = () => {
    const mapRef = useRef(null);
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);

    useEffect(() => {
        const mapInstance = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({ source: vectorSource.current }),
            ],
            view: new View({ center: [0, 0], zoom: 2 }),
        });

        setMap(mapInstance);

        return () => mapInstance.setTarget(null);
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100vh' }}></div>
            </div>
    );
};

export default MapComp;
