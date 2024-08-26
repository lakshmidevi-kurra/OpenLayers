/* 
  Map Tool line and polygon is not working
*/
import './style.css';
import React, { useState, useRef, useEffect } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import lineIcon from '../images/line.png';
import polygonIcon from '../images/polygon.png';
import geoJsonicon from '../images/geojson.png';
import GeoJSON from 'ol/format/GeoJSON';
import 'ol/ol.css';

function MapToolDraw() {
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const viewRef = useRef(null);
    const vectorLayer = useRef(null);

    const [showGeojson, setShowGeojson] = useState(0);
    const [showPolygonForm, setShowPolygonForm] = useState(false);
    const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
    const [numSides, setNumSides] = useState(null);
    const [coordinates, setCoordinates] = useState([]);

    const [showLineForm, setShowLineForm] = useState(false);
    const [numPoints, setNumPoints] = useState(0);
    const [lineCoordinates, setLineCoordinates] = useState([]);

    useEffect(() => {
        const view = new View({
            center: [0, 0],
            zoom: 2,
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
        });

        viewRef.current = view;
        vectorLayer.current = map.getLayers().item(1); 
        setMap(map);

        return () => map.setTarget(null);
    }, []);

    const handleLineDrawClick1 = () => {
        setShowLineForm(true);
        setShowPolygonForm(false);
        setShowGeojson(false);
    };

{/*
    const handleNumPointsSubmit = (e) => {
        e.preventDefault();
        setLineCoordinates(Array(numPoints).fill({ lat: '', lon: '' ,lat:'',lon:''}));
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
*/}
const handleLineDrawClick = () => {
    setShowLineForm(true);
    setShowPolygonForm(false);
    setShowGeojson(false);
};
const handleNumPointsChange = (e) => {
    const newNumPoints = parseInt(e.target.value, 10);
    setNumPoints(newNumPoints);
    setLineCoordinates(Array.from({ length: newNumPoints }, (_, i) => lineCoordinates[i] || { lat: '', lon: '' }));
};

// Handle coordinate changes
const handleCoordinateChange1 = (index, e) => {
    const { name, value } = e.target;
    const updatedCoordinates = [...lineCoordinates];
    updatedCoordinates[index] = { ...updatedCoordinates[index], [name]: value };
    setLineCoordinates(updatedCoordinates);
};

// Handle form submission
const handleSubmitConfig = (e) => {
    e.preventDefault();
    setShowLineForm(false); // Switch to coordinate input view
};

// Draw polyline based on coordinates
const handleDraw = () => {
    const coordinates = lineCoordinates.map(coord => fromLonLat([parseFloat(coord.lon), parseFloat(coord.lat)]));
    const lineFeature = new Feature({
        geometry: new LineString(coordinates),
    });
    vectorSource.current.clear(); // Clear existing features
    vectorSource.current.addFeature(lineFeature); // Add new line feature
};






    const handlePolygonDrawClick = () => {
        setShowPolygonForm(true);
        setShowLineForm(false);
        setShowGeojson(false);
    };

    const handleNumSidesChange = (event) => {
        setNumSides(parseInt(event.target.value, 10));
    };

    const handleNumSidesSubmit = (event) => {
        event.preventDefault();
        if (numSides >= 3) {
            setCoordinates(Array(numSides).fill({ lat: '', lon: '' }));
            setShowCoordinateInputs(true);
        } else {
            alert('Please enter a number of sides greater than or equal to 3.');
        }
    };

    const handleCoordinateChange = (index, event) => {
        const { name, value } = event.target;
        setCoordinates(prev => {
            const newCoords = [...prev];
            newCoords[index] = { ...newCoords[index], [name]: value };
            return newCoords;
        });
    };

    const drawPolygon = () => {
        const validCoordinates = coordinates
            .map(coord => [parseFloat(coord.lon), parseFloat(coord.lat)])
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

        if (validCoordinates.length >= 3) {
            const transformedCoords = validCoordinates.map(coord => fromLonLat(coord));
            const polygon = new Polygon([transformedCoords]);
            const polygonFeature = new Feature(polygon);

            vectorLayer.current.getSource().addFeature(polygonFeature);
        } else {
            console.error("A polygon requires at least 3 valid coordinates.");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        drawPolygon();
    };

    const handleGeojson = () => {
        setShowGeojson(true);
        setShowPolygonForm(false);
        setShowLineForm(false);
    };

    const handleFileUpload = (event) => {
        if (event.target && event.target.files && event.target.files.length > 0) {
            const file1 = event.target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                const geoJsonData = JSON.parse(content);

                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(geoJsonData, {
                        featureProjection: 'EPSG:3857',
                    }),
                });

                const vectorLayer = new VectorLayer({
                    source: vectorSource,
                });

                if (map) {
                    map.addLayer(vectorLayer);
                    map.getView().fit(vectorSource.getExtent(), { size: map.getSize(), maxZoom: 5 });
                }
            };

            reader.readAsText(file1);
        } else {
            console.error("No file selected or unable to read files.");
        }
    };

    return (
        <>
            <div id="map" style={{ width: '100%', height: '100vh' }}></div>

            {/* Line Draw section */}
            <div
                className="linedraw"
                onClick={handleLineDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}
            >
                <img src={lineIcon} alt="Line" style={{ height: '40px', width: '40px' }} />
            </div>

            {/* Polygon Draw section */}
            <div
                className="polygon-tool"
                onClick={handlePolygonDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}
            >
                <img src={polygonIcon} alt="Polygon" style={{ height: '40px', width: '40px' }} />
            </div>
            
            {/* GeoJson Data to Map */}
            <div className='geojson-data'
                onClick={handleGeojson} style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
                <img src={geoJsonicon} alt="geoJson" style={{ height: '40px', width: '40px' }}></img>
            </div>

            {/* Line Drawing Form */}
            {showLineForm ? (
                
                <div className="card" style={{ position: 'absolute', top: '10px', right: '1px', height:'100px', width:'100px',zIndex: 1000 }}>
                    <form onSubmit={handleSubmitConfig} style={{top:'30px'}}>
                        <div className="card-title" style={{ textAlign: 'center' }}>
                            <label>POLYLINE TOOL</label>
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
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card" >
                    <div className="card-title" style={{ textAlign: 'center', padding:'0%', paddingBottom:'0px'}}>
                        <label> Coordinates</label>
                    </div>
                    <hr/>
                    <div className="card-body">
                        {lineCoordinates.map((coord, index) => (
                            <div key={index} className="card-line">
                                <h4 style={{ paddingRight:'0px',marginTop:"1px", marginBottom:'1px'}}>Point{index + 1}</h4>
                                <div>
                                <label className='label'>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lat"
                                        placeholder='Latitude'
                                        value={coord.lat}
                                        onChange={(e) => handleCoordinateChange1(index, e)}
                                        required
                                    />
                                    
                                </label>
                                <br/>
                                <label>
                                
                                    <input
                                        type="number"
                                        step="any"
                                        name="lon"
                                        placeholder='Longitutde'
                                        value={coord.lon}
                                        onChange={(e) => handleCoordinateChange1(index, e)}
                                        required
                                    />
                                </label>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleDraw} style={ {marginTop:'2%',marginBottom:'2%' }}>Draw Polyline</button>
                    </div>
                </div>
            )}

            {/* Polygon Drawing Form */}
            {showPolygonForm && (
                <div className="card">
                    <form onSubmit={handleNumSidesSubmit}>
                        <div className="card-title">
                            <label style={{ textAlign: 'center' }}>POLYGON TOOL</label>
                        </div>
                        <div className="card-body">
                            <label>
                                Number of Sides
                                <hr />
                                <input
                                    type="number"
                                    value={numSides}
                                    onChange={handleNumSidesChange}
                                    required
                                />
                                <hr />
                            </label>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                    {showCoordinateInputs && coordinates.map((coord, index) => (
                        <div key={index}>
                            <h4>Side {index + 1}</h4>
                            <label>
                                Latitude:
                                <input
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={coord.lat}
                                    onChange={(e) => handleCoordinateChange(index, e)}
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
                                    onChange={(e) => handleCoordinateChange(index, e)}
                                    required
                                />
                            </label>
                        </div>
                    ))}
                    <button onClick={handleSubmit}>Draw Polygon</button>
                    <button onClick={() => setShowPolygonForm(false)}>Close</button>
                </div>
            )}

            {/* GeoJson Data */}
            {showGeojson && (
                <div className='geojson-data'>
                    <form >
                        <label>UPLOAD YOUR GEOJSON FILE</label>
                        <input type='file' onChange={handleFileUpload} />
                    </form>
                    <button onClick={() => setShowGeojson(false)}>Close</button>
                </div>
            )}
        </>
    );
}

export default MapToolDraw;
