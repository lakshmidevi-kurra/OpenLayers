import './style.css';
import React, { useState, useRef, useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Attribution, defaults as defaultControls } from 'ol/control';
import { LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import lineIcon from '../images/line.png';

function PolyLines() {
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const [showLineForm, setShowLineForm] = useState(false);
    const [numPoints, setNumPoints] = useState(0);
    const [lineCoordinates, setLineCoordinates] = useState([]);

    useEffect(() => {
        const view = new View({
            center: [0, 0],
            zoom: 1,
        });

        const map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: vectorSource.current,
                }),
            ],
            view: view,
            controls: defaultControls({ attribution: false }).extend([
                new Attribution({
                    collapsible: true,
                    className: 'custom-attribution',
                }),
            ]),
        });

        setMap(map);

        return () => map.setTarget(null);
    }, []);

    // Polyline drawing handlers
    const handleLineDrawClick = () => {
        setShowLineForm(true);
    };

    const handleNumPointsChange = (e) => {
        const num = parseInt(e.target.value, 10);
        setNumPoints(num);
        setLineCoordinates(Array(num).fill({ lat: '', lon: '' }));
    };

    const handleLineCoordinateChange = (index, e) => {
        const { name, value } = e.target;
        setLineCoordinates((prev) => {
            const newCoords = [...prev];
            newCoords[index] = { ...newCoords[index], [name]: value };
            return newCoords;
        });
    };

    const drawPolyline = () => {
        const validCoordinates = lineCoordinates
            .map(coord => [parseFloat(coord.lon), parseFloat(coord.lat)])
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

        if (validCoordinates.length >= 2) {
            const transformedCoords = validCoordinates.map(coord => fromLonLat(coord));
            const polyline = new LineString(transformedCoords);
            const feature = new Feature({ geometry: polyline });

            vectorSource.current.clear();
            vectorSource.current.addFeature(feature);
        } else {
            console.error("A polyline requires at least 2 valid coordinates.");
        }
    };

    const clearLines = () => {
        vectorSource.current.clear();
    };

    return (
        <>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>

            {/* Line Draw Button */}
            <div
                className="linedraw"
                onClick={handleLineDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}
            >
                <img src={lineIcon} alt="Line" style={{ height: '40px', width: '40px' }} />
            </div>

            {/* Polyline Drawing Toolbar */}
            {showLineForm && (
                <div className="line-toolbar" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                    <button onClick={drawPolyline}>Draw Polyline</button>
                    <button onClick={clearLines}>Clear Lines</button>
                    <button onClick={() => setShowLineForm(false)}>Close</button>
                </div>
            )}

            {/* Polyline Drawing Form */}
            {showLineForm && (
                <div className="card">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            drawPolyline();
                        }}
                    >
                        <div className="card-title">
                            <label style={{ textAlign: 'center' }}>POLYLINE TOOL</label>
                        </div>
                        <div className="card-body">
                            <label>
                                Number of Points
                                <hr />
                                <input
                                    type="number"
                                    value={numPoints}
                                    min="2"
                                    onChange={handleNumPointsChange}
                                    required
                                />
                                <hr />
                            </label>
                            {lineCoordinates.map((coord, index) => (
                                <div key={index} className="card-line">
                                    <h4>Point {index + 1}</h4>
                                    <label>
                                        Latitude:
                                        <input
                                            type="number"
                                            step="any"
                                            name="lat"
                                            value={coord.lat}
                                            onChange={(e) => handleLineCoordinateChange(index, e)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Longitude:
                                        <input
                                            type="number"
                                            step="any"
                                            name="lon"
                                            value={coord.lon}
                                            onChange={(e) => handleLineCoordinateChange(index, e)}
                                            required
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

export default PolyLines;
