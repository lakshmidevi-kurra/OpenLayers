/*
    Map Tool Web Page- Line with 2points, Plygon, GeoJson data upload
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
import geoJsonicon from '../images/geojson.png'
import GeoJSON from 'ol/format/GeoJSON'
import { getLength } from 'ol/sphere';
import 'ol/ol.css'
function MapToolDraw() {
    const vectorSource = useRef(new VectorSource());
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);
    const viewRef = useRef(null);
    const vectorLayer = useRef(null);
    // geoJson data variable
    const [showGeojson, setShowGeojson] = useState(0);
    // polygon variable
    const [showPolygonForm, setShowPolygonForm] = useState(false);
    const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
    const [numSides, setNumSides] = useState(null);
    const [coordinates, setCoordinates] = useState([]);

    //line variable
    const [showLineForm, setShowLineForm] = useState(false);
    const [lat1, setLat1] = useState('');
    const [lon1, setLon1] = useState('');
    const [lat2, setLat2] = useState('');
    const [lon2, setLon2] = useState('');
    const [distance, setDistance] = useState('');



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
        vectorLayer.current = map.getLayers().item(1); // Get the vector layer
        setMap(map);

        return () => map.setTarget(null);
    }, []);

    // Line drawing handlers
    const handleLineDrawClick = () => {
        setShowLineForm(true);
        setShowPolygonForm(false);
        setShowGeojson(false);

    };
    // for poly lines Lan Lot 
    const drawLine = () => {
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            alert('Please provide both latitude and longitude for both points.');
            return;
        }

        const point1 = fromLonLat([parseFloat(lon1), parseFloat(lat1)]);
        const point2 = fromLonLat([parseFloat(lon2), parseFloat(lat2)]);

        const line = new LineString([point1, point2]);

        vectorSource.current.clear();
        vectorSource.current.addFeature(new Feature({ geometry: line }));
    };
    // line -distance claculation
    const calculateDist = () => {
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            alert('Please provide both latitude and longitude for both points.');
            return;
        }

        const point1 = fromLonLat([parseFloat(lon1), parseFloat(lat1)]);
        const point2 = fromLonLat([parseFloat(lon2), parseFloat(lat2)]);

        const line = new LineString([point1, point2]);

        const length = getLength(line);
        const distanceInKm = Math.round((length / 1000) * 100) / 100;

        setDistance(`${distanceInKm} km`);
    };

    // Polygon drawing handlers
    const handlePolygonDrawClick = () => {
        setShowPolygonForm(true);
        setShowLineForm(false);
        setShowGeojson(false);

    };
    const handleNumSidesChange = (event) => {
        setNumSides(parseInt(event.target.value, 10));
    };

    // Handle showing coordinate inputs
    const handleNumSidesSubmit = (event) => {
        event.preventDefault();
        if (numSides >= 3) {
            setCoordinates(Array(numSides).fill({ lat: '', lon: '' }));
            setShowCoordinateInputs(true);
        } else {
            alert('Please enter a number of sides greater than or equal to 3.');
        }
    };

    // Handle the change in latitude and longitude input
    const handleCoordinateChange = (index, event) => {
        const { name, value } = event.target;
        setCoordinates(prev => {
            const newCoords = [...prev];
            newCoords[index] = { ...newCoords[index], [name]: value };
            return newCoords;
        });
    };

    // Function to draw the polygon on the map
    const drawPolygon = () => {
        const validCoordinates = coordinates
            .map(coord => [parseFloat(coord.lon), parseFloat(coord.lat)])
            .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

        if (validCoordinates.length >= 3) {
            const transformedCoords = validCoordinates.map(coord => fromLonLat(coord));
            const polygon = new Polygon([transformedCoords]);
            const polygonFeature = new Feature(polygon);

           // vectorLayer.current.getSource().clear();
            vectorLayer.current.getSource().addFeature(polygonFeature);
        } else {
            console.error("A polygon requires at least 3 valid coordinates.");
        }
    };

    // Handle final form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        drawPolygon();
    };
    // polygon end 

    // GeoJson Data

    // Geojson data
    const handleGeojson = () => {
        setShowGeojson(true);
        setShowPolygonForm(false);
        setShowLineForm(false);
    };

    const handleFileUpload = (event) => {
        console.log("Event target:", event.target);
        console.log("Event target.files:", event.target.files);

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
            {/**  GeoJson Data to Map */}
            <div className='geojson-data'
                onClick={handleGeojson} style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
                <img src={geoJsonicon} alt="geoJson" style={{ height: '40px', width: '40px' }}></img>
            </div>

            {/* Line Drawing Form */}
            {showLineForm && (
                <div className="card" >
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="card-title">
                            <label style={{ textAlign: 'center' }}>LINE TOOL</label>
                        </div>
                        <div className='card-body'>
                            <label htmlFor="lat1">Latitude 1</label>
                            <input
                                type="text"
                                id="lat1"
                                value={lat1}
                                onChange={(e) => setLat1(e.target.value)}
                                placeholder=" first Latitude"
                            />
                            <label htmlFor="lon1">Longitude 1</label>
                            <input
                                type="text"
                                id="lon1"
                                value={lon1}
                                onChange={(e) => setLon1(e.target.value)}
                                placeholder=" first Longitude"
                            />
                        </div>
                        <div className='card-body'>
                            <label htmlFor="lat2">Latitude 2</label>
                            <input
                                type="text"
                                id="lat2"
                                value={lat2}
                                onChange={(e) => setLat2(e.target.value)}
                                placeholder="second Latitude"
                            />
                            <label htmlFor="lon2" >Longitude 2</label>
                            <input
                                type="text"
                                id="lon2"
                                value={lon2}
                                onChange={(e) => setLon2(e.target.value)}
                                placeholder=" second Longitude"
                            />
                        </div>
                        <div className=' card-body'>
                            <button className="btn btn-outline-success" type="button" onClick={drawLine} style={{ paddingRight: '5px' }}>Draw</button>
                            <button className="btn btn-outline-success" type="button" style={{ paddingRight: '2px' }} onClick={calculateDist}>Calculate Distance</button>
                        </div>
                        <div className='card-body'>
                            <label style={{ textAlign: 'justify' }}>Distance:
                                <textarea rows={1}value={distance} readOnly  placeholder="Calculated distance" ></textarea></label>
                        </div>
                    </form>
                    <br/>

                </div>

            )}

            {/* Polygon Drawing Form */}
            {showPolygonForm && (
                <div className='polygon-tool'>
                {!showCoordinateInputs ? (
                    <form onSubmit={handleNumSidesSubmit}>
                        <div className='card' style={{ left:'40px', height:'250px', width:'380px'}}>
                            <label className='card-title'> Polygon Tool</label>
                            <div className='card-body'>
                            <label >
                                Number of Sides:
                                <hr/>
                                <input
                                    type="number"
                                    value={numSides || ''}
                                    onChange={handleNumSidesChange}
                                    min="3"  // Minimum of 3 sides
                                    required
                                    placeholder='Enter the no of Sides'
                                />
                                <br />
                            </label>
                            <button type="submit" style={{ align: 'center' }}>Submit </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="form-lonlat">
                        <div className='card' style={{ left:'150px', top:'1px', height:'400px', width:'400px'}}>
                        <form onSubmit={handleSubmit}>
                        <div className='card-body'>
                            <div   >
                                <label className='lonlat'> Enter the Lon and Lat</label>
                                {coordinates.map((coord, index) => (
                                   
                                    <div key={index}  className='card-body'>
                                        <label className='card-body-text'>
                                            Latitude{index + 1}:
                                            <input
                                                type="number"
                                                step="any"
                                                name="lat"
                                                value={coord.lat}
                                                onChange={(e) => handleCoordinateChange(index, e)}
                                                required
                                            />
                                        </label>
                                        <label >
                                            Longitude{index + 1}:
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
                            </div>
                            <button type="submit">Submit Coordinates</button>
                            </div>
                        </form>
                        </div>
                    </div>
                )}

            </div>


            )}
            {showGeojson && (
                <div className='card' style={{ width: '18rem' }}>
                    <div className='card-title'>
                        <label > GeoJSON Data</label>
                    </div>
                    <div className=" card-body">

                        <label className='card-body-label' htmlFor="FileGroup" >File for upload</label>

                        <input type="file" className="form-control" id="FileGroup" onChange={handleFileUpload} />


                    </div>

                </div>


            )}
        </>
    );
}

export default MapToolDraw;
