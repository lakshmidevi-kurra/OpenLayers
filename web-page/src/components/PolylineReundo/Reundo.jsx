import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Draw from 'ol/interaction/Draw';
import 'ol/ol.css';

const PolygonDrawTool1 = () => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const [draw, setDraw] = useState(null);
    const vectorSource = useRef(new VectorSource({ wrapX: false }));
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentFeature, setCurrentFeature] = useState(null);

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
                center: [0, 0],
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

        drawInteraction.on('drawstart', (event) => {
            setCurrentFeature(event.feature);
            setUndoStack([]);
            setRedoStack([]);
        });

        drawInteraction.on('drawend', () => {
            const geometry = currentFeature.getGeometry();
            setUndoStack([geometry.getCoordinates()]);
            setRedoStack([]);
        });

        map.addInteraction(drawInteraction);
        setDraw(drawInteraction);
    };

    const handleUndo = () => {
        if (currentFeature) {
            const geometry = currentFeature.getGeometry();
            const coordinates = geometry.getCoordinates()[0];

            if (coordinates.length > 1) {
                const removedPoint = coordinates.pop();

                setRedoStack([...redoStack, removedPoint]); // Push removed point to redo stack
                setUndoStack([...undoStack, coordinates.slice()]); // Push current state to undo stack

                geometry.setCoordinates([coordinates]);
                currentFeature.setGeometry(geometry);
            }
        }
    };

    const handleRedo = () => {
        if (currentFeature && redoStack.length > 0) {
            const geometry = currentFeature.getGeometry();
            const coordinates = geometry.getCoordinates()[0];
            const restoredPoint = redoStack.pop();

            coordinates.push(restoredPoint); // Add the restored point back
            setUndoStack([...undoStack, coordinates.slice()]); // Push current state to undo stack

            geometry.setCoordinates([coordinates]);
            currentFeature.setGeometry(geometry);
        }
    };

    return (
        <div>
            <div ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            <form className="drawTool" style={{ position: 'absolute', top: '100px', right: '100px', zIndex: 1000 }}>
                <label>Polygon</label>
                <button
                    onClick={handleDrawPolygon}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}
                >
                    Draw
                </button>
                <button
                    onClick={handleUndo}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}
                >
                    Undo
                </button>
                <button
                    onClick={handleRedo}
                    className="btn btn-outline-success btn-sm mx-4 my-1 mg-0"
                    tabIndex={-1}
                    type="button"
                    style={{ textAlign: 'right' }}
                >
                    Redo
                </button>
            </form>
        </div>
    );
};

export default PolygonDrawTool1;
