import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import 'ol/ol.css';


const PolygonReundo_DrawEnd = () => {
    const mapRef = useRef(null);
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [undoStack, setUndoStack] = useState([]); // Stack for undo actions
    const [redoStack, setRedoStack] = useState([]); // Stack for redo actions


    useEffect(() => {
        // Initialize the map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({ source: vectorSource.current }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            }),
        });


        setMap(map);


        return () => {
            map.setTarget(null);
        };
    }, []);


    const handlePolygonDraw = () => {
        if (map && !drawInteraction) {
            // Create a new draw interaction for polygons
            const draw = new Draw({
                source: vectorSource.current,
                type: 'Polygon',
            });


            draw.on('drawstart', () => {
                // Clear the stacks when starting a new polygon
                setUndoStack([]);
                setRedoStack([]);
            });


            draw.on('drawend', (event) => {
                const feature = event.feature;
                setCurrentFeature(feature);
                const coordinates = feature.getGeometry().getCoordinates()[0];
                // Save all coordinates to the undo stack
                setUndoStack(coordinates);
                setRedoStack([]); // Clear the redo stack
            });


            map.addInteraction(draw);
            setDrawInteraction(draw);
        }
    };


    const handleUndoAction = () => {
        if (undoStack.length > 2) { // Keep at least two points to form a valid polygon
            const newUndoStack = [...undoStack];
            const lastCoordinate = newUndoStack.pop();
            setRedoStack([lastCoordinate, ...redoStack]);


            // Update the geometry of the current feature
            currentFeature.getGeometry().setCoordinates([newUndoStack]);
            setUndoStack(newUndoStack);
        }
    };


    const handleRedoAction = () => {
        if (redoStack.length > 0) {
            const nextCoordinate = redoStack.shift();
            const newUndoStack = [...undoStack, nextCoordinate];


            // Update the geometry of the current feature
            currentFeature.getGeometry().setCoordinates([newUndoStack]);
            setUndoStack(newUndoStack);
            setRedoStack(redoStack);
        }
    };


    return (
        <>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                <label>Polygon</label>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'center' }}
                    onClick={handleUndoAction}
                >
                    Undo
                </button>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'left' }}
                    onClick={handlePolygonDraw}
                >
                    Draw
                </button>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}
                    onClick={handleRedoAction}
                >
                    Redo
                </button>
            </form>
        </>
    );
};


export default PolygonReundo_DrawEnd;


