import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Draw from 'ol/interaction/Draw';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

const PolygonDrawTool1 = () => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const [draw, setDraw] = useState(null);
    const vectorSource = useRef(new VectorSource({ wrapX: false }));
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentPolygon, setCurrentPolygon] = useState(null);

    useEffect(() => {

        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource.current,
        });

        const map = new Map({
            target: mapRef.current,
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: fromLonLat([0, 0]),
                zoom: 1,
            }),
        });

        setMap(map);

        return () => {
            map.setTarget(null); // Clean up the map on component unmount
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

        drawInteraction.on('drawstart', (event) => {
            setCurrentPolygon(event.feature);
            setUndoStack([]);
            setRedoStack([]);
        });

        drawInteraction.on('drawend', () => {
//            setUndoStack([]);
            setRedoStack([]);
        });

        map.addInteraction(drawInteraction);
        setDraw(drawInteraction);
    };

    const handleUndo = () => {
        if (currentPolygon) {
            const geometry = currentPolygon.getGeometry();
            const coordinates = geometry.getCoordinates()[0];
            
            // Check if there are more than 3 points to ensure it's a valid polygon
            if (coordinates.length > 1) {
                const removedPoint =   coordinates.pop();
               const  [x, y] = removedPoint;
               const [lon, lat] = fromLonLat([x, y]); // Convert to longitude and latitude
               console.log(`Removed point: Longitude: ${lon}, Latitude: ${lat}`);
   

                setUndoStack([...undoStack, removedPoint]);

                geometry.setCoordinates([coordinates]);
                currentPolygon.setGeometry(geometry);

                

                // Clear redo stack since a new undo operation occurred
                setRedoStack([]);
            }
        }
    };

    const handleRedo = () => {
        if (currentPolygon && undoStack.length > 0) {
            console.log("reundo ")
            const geometry = currentPolygon.getGeometry();
            const coordinates = geometry.getCoordinates()[0];
            const restoredPoint = undoStack.pop();
            
            coordinates.push(restoredPoint); // Add the restored point back
            const  [x, y] = restoredPoint;
            const [lon, lat] = fromLonLat([x, y]); // Convert to longitude and latitude
            console.log(`Restored point: Longitude: ${lon}, Latitude: ${lat}`);
    
            // Ensure the coordinates array is valid and doesn't have duplicates
            geometry.setCoordinates([coordinates]);
            currentPolygon.setGeometry(geometry);
            /*
            vectorSource.current.clear();
            vectorSource.current.addFeature(currentPolygon);
            */
           
            // Push the restored point onto the redo stack
            setRedoStack([...redoStack, restoredPoint]);
        }
    };

    return (
        <div>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                <label>Polygon</label>
                <button onClick={handleUndo}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}>
                    Undo
                </button>

                <button onClick={handleDrawPolygon}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}>
                    Draw
                </button>
               

                <button onClick={handleRedo}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}>
                    Redo
                </button>
            </form>
        </div>
    );
};

export default PolygonDrawTool1;
