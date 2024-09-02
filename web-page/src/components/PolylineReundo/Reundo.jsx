// For Polylines undo and Reundo buttons 

import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import 'ol/ol.css';

const Reundo = () => {
    const mapRef = useRef(null);
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [undo, setUndo] = useState([]); // Stack for undo actions
    const [reundo, setReundo] = useState([]); // Stack for redo actions

    useEffect(() => {
        // Initialize the map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({ source: vectorSource.current }),
            ],
            view: new View({ center: [0, 0], zoom: 2 }),
        });

        setMap(map);

        return () => {
            map.setTarget(null);
        };
    }, []);

    const handleDrawLines = () => {
        if (map && !drawInteraction) {
            // Create a new draw interaction
            const draw = new Draw({
                source: vectorSource.current,
                type: 'LineString',
            });

            draw.on('drawstart', (event) => {
                const feature = event.feature;
                setCurrentFeature(feature);
                setUndo((prevStack) => [...prevStack, feature]);
                setReundo([]); // Clear redo stack on new draw action
                //console.log('Drawn polyline:', feature);
            });

            map.addInteraction(draw);
            setDrawInteraction(draw); // Store the draw interaction
        }
    };

    const handleUndoAction = () => {
        if (currentFeature) {
            const coordinates = currentFeature.getGeometry().getCoordinates();
            if (coordinates.length > 1) {
                // Remove the last coordinate
                const newCoordinates = coordinates.slice(0, -1);
                currentFeature.getGeometry().setCoordinates(newCoordinates);

                // Save state to redo stack
                setReundo((prevStack) => [...prevStack, { coordinates: coordinates.slice(-1)[0] }]);

                // Save state to undo stack
                setUndo((prevStack) => {
                    const updatedStack = [...prevStack];
                    updatedStack[updatedStack.length - 1] = currentFeature;
                    return updatedStack;
                });
            } else {
                // Remove the feature if no coordinates left
                vectorSource.current.removeFeature(currentFeature);
                setCurrentFeature(null);
                setUndo((prevStack) => prevStack.slice(0, -1)); // Remove last feature from undo stack
            }
        }
    };

    const handleRedoAction = () => {
        if (reundo.length > 0 && currentFeature) {
            const lastRedo = reundo.pop();
            const coordinates = currentFeature.getGeometry().getCoordinates();

            // Add the last removed coordinate
            const newCoordinates = [...coordinates, lastRedo.coordinates];
            currentFeature.getGeometry().setCoordinates(newCoordinates);

            // Save state to undo stack
            setUndo((prevStack) => [...prevStack, currentFeature]);

            // Update redo stack
            setReundo(reundo);
        }
    };

    return (
        <>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                <label>Polylines</label>
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
                    onClick={handleDrawLines}
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
                    reundo
                </button>
            </form>
        </>
    );
};

export default Reundo;
