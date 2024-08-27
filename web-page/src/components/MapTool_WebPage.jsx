import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import './MapTool_WebPage.css'  

import homeIcon from '../images/home .png'
// Polylines draw
import lineIcon from '../images/drawLine.png';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

// GeoJson Data 
import geoJsonicon from '../images/database.png'
import GeoJSON from 'ol/format/GeoJSON';

//Polygon Tool
import Polygon from 'ol/geom/Polygon';
import polygonIcon from '../images/polygon.png'

//Point Tool
import PointIcon from '../images/point.png';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

//Circle Tool 
import CircleIcon from '../images/circle.png'
import { Fill, Stroke } from 'ol/style';
import { Circle as CircleGeom, } from 'ol/geom';

export default function MapTool_WebPage() {
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const vectorLayer = useRef(null);
    const viewRef = useRef(null);

    // State for controlling visibility of forms

    // Polyline Draw Tool variables
    const [coordinates, setCoordinates] = useState([]);
    const [numPoints, setNumPoints] = useState(0);
    const [showPolyLineForm, setShowPoliLineForm] = useState(false);

    // GeoJson variable
    const [showGeojson, setShowGeojson] = useState(0);

    // polygon variable
    const [showPolygonForm, setShowPolygonForm] = useState(false);
    const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
    const [numSides, setNumSides] = useState(null);
    const [polygoncoordinates, setpolygonCoordinates] = useState([]);

    // Point Variable
    const [showPointForm, setShowPointForm] = useState(false);
    const [pointCoordinates, setPointCoordinates] = useState({ lat: '', lon: '' });

    // Circle Variable
    const [showCircleForm, setCircleForm] = useState(false);
    const [circleCoordinates, setCircleCoordinates] = useState({ lat: '', lon: '' });
    const [radius, setRadius] = useState('');

    // Map creation
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
        console.log(mapRef.current); // Debugging: Check if the map instance is correctly initialized

        setMap(map);

        return () => map.setTarget(null);
    }, []);

    const handlePoliLineDrawClick = () => {
        setShowPoliLineForm(true);
        setShowGeojson(false);
        setShowPolygonForm(false)
        setShowPointForm(false);
        setCircleForm(false);
    };

    const handlePointsSubmit = (e) => {
        e.preventDefault();
        setCoordinates(Array.from({ length: numPoints }, () => ({ lat: '', lon: '' })));
    };

    const handleCoordinateChange = (index, type, value) => {
        const newCoordinates = [...coordinates];
        newCoordinates[index][type] = value;
        setCoordinates(newCoordinates);
    };

    const handleDrawPolyline = (e) => {
        e.preventDefault();

        // Validate coordinates
        for (let i = 0; i < coordinates.length; i++) {
            const { lat, lon } = coordinates[i];
            if (lat === '' || lon === '') {
                alert(`Please enter both latitude and longitude for point ${i + 1}.`);
                return;
            }
            if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
                alert(`Invalid coordinates for point ${i + 1}. Please enter numeric values.`);
                return;
            }
        }

        // Transform coordinates to [lon, lat] and then to map's projection (default is EPSG:3857)
        const transformedCoords = coordinates.map(coord => {
            const lon = parseFloat(coord.lon);
            const lat = parseFloat(coord.lat);
            return fromLonLat([lon, lat]);
        });
        const lineString = new LineString(transformedCoords);
        const lineFeature = new Feature({
            geometry: lineString,
        });
        //vectorSource.current.clear();
        vectorSource.current.addFeature(lineFeature);
        mapRef.current.getView().fit(vectorSource.current.getExtent(), {
            duration: 1000,
        });
    };

    // GeoJSON Data upload section
    const handleGeojson = () => {
        setShowGeojson(true);
        setShowPoliLineForm(false);
        setShowPolygonForm(false);
        setShowPointForm(false);
        setCircleForm(false);
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


    const handlePolygonDrawClick = () => {
        setShowPolygonForm(true);
        setShowGeojson(false);
        setShowPoliLineForm(false);
        setShowPointForm(false);
        setCircleForm(false);

    };
    const handleNumSidesChange = (event) => {
        setNumSides(parseInt(event.target.value, 10));
    };

    // Handle showing coordinate inputs
    const handleNumSidesSubmit = (event) => {
        event.preventDefault();
        if (numSides >= 3) {
            setpolygonCoordinates(Array(numSides).fill({ lat: '', lon: '' }));
            setShowCoordinateInputs(true);
        } else {
            alert('Please enter a number of sides greater than or equal to 3.');
        }
    };

    // Handle the change in latitude and longitude input
    const handleCoordinateChange1 = (index, event) => {
        const { name, value } = event.target;
        setpolygonCoordinates(prev => {
            const newCoords = [...prev];
            newCoords[index] = { ...newCoords[index], [name]: value };
            return newCoords;
        });
    };

    // Function to draw the polygon on the map
    const drawPolygon = () => {
        const validCoordinates = polygoncoordinates
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

    //Point section start
    // Point Tool
    const handlePointDrawClick = () => {
        // Show the point form and hide others
        setShowPoliLineForm(false);
        setShowGeojson(false);
        setShowPolygonForm(false);
        setShowPointForm(true);
        setCircleForm(false);
    };
    const handleDrawPoint = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!pointCoordinates.lat || !pointCoordinates.lon) {
            alert('Please enter valid latitude and longitude.');
            return;
        }

        const pointCoords = fromLonLat([parseFloat(pointCoordinates.lon), parseFloat(pointCoordinates.lat)]);
        const point = new Point(pointCoords);
        const pointFeature = new Feature({
            geometry: point,
        });

        pointFeature.setStyle(
            new Style({
                image: new Icon({
                    src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Example icon
                    scale: .8, // Scale the icon if needed
                }),
            })
        );

        vectorSource.current.clear(); // Clear previous features if needed
        vectorSource.current.addFeature(pointFeature);

        // Adjust map view to center on the point
        map.getView().animate({ center: pointCoords, zoom: 10, duration: 100 });

    };

    const handleCircleDrawClick = () => {
        setCircleForm(true);
        setShowPoliLineForm(false);
        setShowGeojson(false);
        setShowPolygonForm(false)
        setShowPointForm(false);
    }
    const handleDrawCircle = (e) => {
        e.preventDefault();

        // Validate inputs
        if (!circleCoordinates.lat || !circleCoordinates.lon || !radius) {
            alert('Please enter valid latitude, longitude, and radius.');
            return;
        }

        const center = fromLonLat([parseFloat(circleCoordinates.lon), parseFloat(circleCoordinates.lat)]);
        const radiusin = parseFloat(radius) * 1000
        const circleGeom = new CircleGeom(center, radiusin);
        const circleFeature = new Feature(circleGeom);

        // Optional: Set a custom style for the circle
        circleFeature.setStyle(
            new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 5,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            })
        );

        vectorSource.current.clear();  // Clear previous features if needed
        vectorSource.current.addFeature(circleFeature);

        // Adjust map view to center on the circle
        map.getView().animate({ center: center, zoom: 10, duration: 1000 });
    };

    const handleHomeClick = () => {
        // Show the point form and hide others
        setShowPoliLineForm(false);
        setShowGeojson(false);
        setShowPolygonForm(false);
        setShowPointForm(false);
        setCircleForm(false);

    };



    return (
        <>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>

            {/* Home Section */}
            <div
                className="home"
                onClick={handleHomeClick}
                style={{ position: 'absolute', top:'150px', left: '15px', zIndex: 1000 }}
            >
                <img src={homeIcon} alt="Line" style={{ height: '40px', width: '40px', backgroundColor: 'white' }} />
            </div>


            {/* Polylines draw Section */}
            <div
                className="linedraw"
                onClick={handlePoliLineDrawClick}
                style={{ position: 'absolute',  top:' 200px' , left: '15px', zIndex: 1000 }}
            >
                <img src={lineIcon} alt="Line" style={{ height: '40px', width: '40px', backgroundColor: 'white' }} />
            </div>

            {/* Polygon Draw section */}
            <div
                className="polygon-tool"
                onClick={handlePolygonDrawClick}  style={{ position: 'absolute', top: '250px', left: '15px', zIndex: 1000 }}>
                <img src={polygonIcon} alt="Polygon" style={{ height: '40px', width: '40px', backgroundColor: 'white' }} />
            </div>

            {/* Geo Json Data section */}
            <div className='geojson-data'
                onClick={handleGeojson} style={{ position: 'absolute', top:'300px', left: '15px', zIndex: 1000 }}>
                <img src={geoJsonicon} alt="geoJson" style={{ height: '40px', width: '40px', backgroundColor: 'white' }}></img>
            </div>

            {/* Circle Tool */}
            <div className='circle-Tool'
                onClick={handleCircleDrawClick}
                style={{ position: 'absolute', top: '400px', left: '15px', zIndex: 1000 }}>
                <img src={CircleIcon} alt='Circle' style={{ height: '40px', width: '40px', backgroundColor: 'white' }} />
            </div>

            <div className='point-tool'
                onClick={handlePointDrawClick}
                style={{ position: 'absolute', top: '350px', left: '15px', zIndex: 1000 }}>
                <img src={PointIcon} alt='point' style={{ height: '40px', width: '40px', backgroundColor: 'white' }} />

            </div>

            {/*
            /*
            Tool Section Start
            
            */}

            {/* Polylines draw tool */}
            {showPolyLineForm && (
                <div className='card-polylines' >
                    <form onSubmit={handlePointsSubmit}>
                        <div className='card-polylines-title'>
                            <label style={{ padding: '0px' }}>
                                Polylines
                            </label>
                            <hr />
                        </div>
                        <div className='card-polylines-body'>
                            <label >
                                Enter the points<br />
                                <hr />
                                <input
                                    type="number"
                                    value={numPoints}
                                    onChange={(e) => setNumPoints(e.target.value)}
                                    min="2"
                                    required
                                    placeholder='No of points'
                                />
                            </label>
                            <hr />
                            <button className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1} type="submit" style={{ textAlign: 'center' }}>Submit</button>
                        </div>
                        <hr />
                    </form>

                    {coordinates.length > 0 && (
                        <form onSubmit={handleDrawPolyline}>
                            <div className="card-polylines-draw">
                                <div className='card-polylines-title'>
                                    <label>Coordinates </label> </div>
                                <div className='card-polylines-body'>
                                    <label className='card-polylines-text'> Enter Coordinates </label>
                                    <hr />
                                    {coordinates.map((coordinate, index) => (
                                        <div key={index}>
                                            <label>
                                                <input
                                                    type="number"
                                                    value={coordinate.lat}
                                                    onChange={(e) =>
                                                        handleCoordinateChange(index, 'lat', e.target.value)
                                                    }
                                                    required
                                                    placeholder='Latitude'
                                                />
                                            </label>
                                            <label>
                                                <input
                                                    type="number"
                                                    value={coordinate.lon}
                                                    onChange={(e) =>
                                                        handleCoordinateChange(index, 'lon', e.target.value)}
                                                    placeholder='Longitude'
                                                    required
                                                />
                                            </label>
                                        </div>
                                    ))}
                                    <button className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1} type="submit">Draw Polyline</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* GeoJson Data  */}

            {showGeojson && (
                <div className='card-geojson' >
                    <div className='card-geojson-title'>
                        <label > GeoJSON Data</label>
                    </div>
                    <div className=" card-polygon-body">
                        <div className='card-polygon-body-text'>
                            <label htmlFor="FileGroup" >File for upload</label>
                        </div>
                        <hr />
                        <input type="file" className="form-control" id="FileGroup" onChange={handleFileUpload} />
                        <hr />

                    </div>

                </div>


            )}

            {/* Polygon Drawing Form */}
            {showPolygonForm && (
                <div className='card-polygon'>
                    {!showCoordinateInputs ? (
                        <div className=''>
                            <form onSubmit={handleNumSidesSubmit}>
                                <div className='card-polygon-title' >
                                    <label > Polygon Tool</label>
                                </div>
                                <hr />
                                <div className='card-polygon-body'>
                                    <label >
                                        Number of Sides:
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
                                    <hr />
                                    <button className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1} type="submit" style={{ align: 'center' }}>Submit </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className='card-polygon-draw' >
                            <form onSubmit={handleSubmit}>
                                <div className='card-polygon-title' >
                                    <label > Enter the Lon & Lat</label>
                                </div>
                                <hr />
                                <div className='cardpolygon--body'>
                                    {polygoncoordinates.map((coord, index) => (
                                        <div key={index} >
                                            <label className='card-polygon-body-text'>
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
                                            <label >
                                                <input
                                                    type="number"
                                                    step="any"
                                                    name="lon"
                                                    placeholder='Longitude'
                                                    value={coord.lon}
                                                    onChange={(e) => handleCoordinateChange1(index, e)}
                                                    required
                                                />
                                            </label>

                                        </div>

                                    ))
                                    }
                                    <br />
                                    <button type="submit" className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1}>Submit Coordinates</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            )}

            {showPointForm && (
                <div className='card-point' >

                    <form onSubmit={handleDrawPoint}>

                        <div className='card-point-title'>
                            <label> Point Tool</label>
                        </div>
                        <div className='card-point-body'>
                            <div className='card-point-text'>
                                <label > Lon & Lat</label>
                            </div>
                            <hr />
                            <label>
                                <input
                                    type="number"
                                    value={pointCoordinates.lat}
                                    onChange={(e) => setPointCoordinates({ ...pointCoordinates, lat: e.target.value })}
                                    required
                                    placeholder="Latitude"
                                />
                            </label>
                            <br />
                            <label>
                                <input
                                    type="number"
                                    value={pointCoordinates.lon}
                                    onChange={(e) => setPointCoordinates({ ...pointCoordinates, lon: e.target.value })}
                                    required
                                    placeholder="Longitude"
                                />
                            </label>
                            <hr />
                            <button className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1} type="submit">Draw Point</button>
                        </div>
                    </form>
                </div>

            )}

            {/* Circle Tool */}
            {showCircleForm && (
                <div className='card-circle'>
                    <form onSubmit={handleDrawCircle}>
                        <div className='card-circle-title'>
                            <label>Circle Tool</label>
                        </div>
                        <div className='card-circle-body'>
                            <div className='card-circle-text'>
                                <label> Lon,Lat &Radius </label>
                            </div>
                            <hr />
                            <label>
                                <input
                                    type="number"
                                    value={circleCoordinates.lat}
                                    onChange={(e) => setCircleCoordinates({ ...circleCoordinates, lat: e.target.value })}
                                    required
                                    placeholder="Latitude"
                                />
                            </label>
                            <br />
                            <label>
                                <input
                                    type="number"
                                    value={circleCoordinates.lon}
                                    onChange={(e) => setCircleCoordinates({ ...circleCoordinates, lon: e.target.value })}
                                    required
                                    placeholder="Longitude"
                                />
                            </label>
                            <br />
                            <label>
                                <input
                                    type="number"
                                    value={radius}
                                    onChange={(e) => setRadius(e.target.value)}
                                    required
                                    placeholder="Radius (in meters)"
                                />
                            </label>
                        </div>
                        <hr />
                        <button className=" btn btn-outline-success  btn-sm mx-4 my-1 mg-0" tabIndex={-1} type="submit">Draw Circle</button>
                    </form>
                </div>
            )}
        </>
    )
};