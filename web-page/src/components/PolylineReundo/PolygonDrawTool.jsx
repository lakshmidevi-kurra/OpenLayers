// undo operation done in this code for Polygon 
/*

polygon undo button

*/
import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Draw from 'ol/interaction/Draw';
import 'ol/ol.css';

const PolygonDrawTool = () => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const [draw, setDraw] = useState(null);
    const vectorSource = useRef(new VectorSource({ wrapX: false }));

    useEffect(() => {
        // Initialize map
        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource.current,
        });

        const mapInstance = new Map({
            target: mapRef.current,
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: [0,0],
                zoom: 1,
            }),
        });

        setMap(mapInstance);

        return () => {
            mapInstance.setTarget(null); // Clean up the map on component unmount
        };
    }, []);

    const handleDrawPolygon = () => {
        if (draw) {
            map.removeInteraction(draw);
        }

        const drawInteraction = new Draw({
            source: vectorSource.current,
            type: 'Polygon',
        });

        map.addInteraction(drawInteraction);
        setDraw(drawInteraction);
    };

    const handleUndo = () => {
        if (draw) {
             draw.removeLastPoint();
        }
    };

    return (
        <div>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position:'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                
                <label>Polygon</label>
                <button onClick={handleDrawPolygon} 
                 className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                 tabIndex={-1}
                 type="button"
                 style={{ textAlign: 'right' }}
                >
                    Draw
                </button>
                <button onClick={handleUndo} 
                 className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                 tabIndex={-1}
                 type="button"
                 style={{ textAlign: 'right' }}
                >
                    Undo 
                </button>
            </form>
        </div>
    );
};

export default PolygonDrawTool;
