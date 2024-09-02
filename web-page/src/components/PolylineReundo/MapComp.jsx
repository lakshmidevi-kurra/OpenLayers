import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import 'ol/ol.css';

const MapComp = () => {
    const mapRef = useRef(null);
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [undo, setUndo] = useState([]); // Stack for undo actions
    const [reundo, setReundo] = useState([]); // Stack for redo actions
    const [drawingType, setDrawingType] = useState('LineString'); // Default to drawing lines
    
    useEffect(() => {
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

    const handleDrawStart = () => {
        if (map && !drawInteraction) {
            // Create a new draw interaction
            const draw = new Draw({
                source: vectorSource.current,
                type: drawingType,
            });

            draw.on('drawstart', (event) => {
                const feature = event.feature;
                setCurrentFeature(feature);
                setUndo([]); // Clear undo stack for new drawing
                setReundo([]); // Clear redo stack for new drawing

                feature.getGeometry().on('change', () => {
                    const coordinates = feature.getGeometry().getCoordinates();
                    setUndo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(coordinates))]);
                });
            });


            map.addInteraction(draw);
            setDrawInteraction(draw);
        }
    };

    
    const handleUndoAction = () => {
        if (currentFeature && undo.length > 0) {
            const geometry = currentFeature.getGeometry();

            if (drawingType === 'Polygon') {
                if (undo.length > 1) {
                    const previousCoordinates = undo.pop();
                    setReundo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(geometry.getCoordinates()))]);
                    geometry.setCoordinates([previousCoordinates]);
                } else {
                    vectorSource.current.removeFeature(currentFeature);
                    setCurrentFeature(null);
                }
            } else {
                const coordinates = geometry.getCoordinates();
                if (coordinates.length > 1) {
                    const newCoordinates = coordinates.slice(0, -1);
                    setReundo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(coordinates.slice(-1)[0]))]);
                    geometry.setCoordinates(newCoordinates);
                } else {
                    vectorSource.current.removeFeature(currentFeature);
                    setCurrentFeature(null);
                }
                setUndo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(coordinates))]);
            }
        }
    };

    const handleReundoAction = () => {
        if (reundo.length > 0 && currentFeature) {
            const geometry = currentFeature.getGeometry();
            const lastRedo = reundo.pop();

            if (drawingType === 'Polygon') {
                const newCoordinates = [...geometry.getCoordinates()[0], lastRedo];
                setUndo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(geometry.getCoordinates()[0]))]);
                geometry.setCoordinates([newCoordinates]);
            } else {
                const newCoordinates = [...geometry.getCoordinates(), lastRedo];
                setUndo((prevStack) => [...prevStack, JSON.parse(JSON.stringify(geometry.getCoordinates()))]);
                geometry.setCoordinates(newCoordinates);
            }
        }
    };

    const handleDrawingTypeChange = (type) => {
        setDrawingType(type);
        handleDrawStart();
    };

    return (
        <>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                <label>Draw Type</label>
                <select
                    value={drawingType}
                    onChange={(e) => handleDrawingTypeChange(e.target.value)}
                >
                    <option value="LineString">Line</option>
                    <option value="Polygon">Polygon</option>
                </select>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1"
                    tabIndex={-1}
                    type="button"
                    onClick={handleUndoAction}
                >
                    Undo
                </button>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1"
                    tabIndex={-1}
                    type="button"
                    onClick={handleDrawStart}
                >
                    Draw
                </button>
                <button
                    className="btn btn-outline-success btn-sm mx-4 my-1"
                    tabIndex={-1}
                    type="button"
                    onClick={handleReundoAction}
                >
                    Re-undo
                </button>
                           </form>
        </>
    );
};

export default MapComp;
