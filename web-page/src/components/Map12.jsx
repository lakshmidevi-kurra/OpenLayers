import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import './style.css';

// Polylines draw
import lineIcon from '../images/draw.png';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

// GeoJson Data 
import geoJsonicon from '../images/database.png'
import GeoJSON from 'ol/format/GeoJSON';

import Polygon from 'ol/geom/Polygon';
import polygonIcon from '../images/polyline.png'


//Point Tool
import PointIcon from '../images/point.png';

//Circle Tool 
import CircleIcon from '../images/circle.png'

//Navigation icon
import NavgationIcon from '../images/navigation.png'


import NavBar from './NavBar/NavBar';
export default function Map12() {
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const vectorLayer = useRef(null);
    const viewRef = useRef(null);




    // State for controlling visibility of forms
    const [showPolyLineForm, setShowPoliLineForm] = useState(false);

    // Polyline Draw Tool variables
    const [coordinates, setCoordinates] = useState([]);
    const [numPoints, setNumPoints] = useState(0);

    // GeoJson variable
    const [showGeojson, setShowGeojson] = useState(0);

    // polygon variable
    const [showPolygonForm, setShowPolygonForm] = useState(false);
    const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
    const [numSides, setNumSides] = useState(null);
    const [polygoncoordinates, setpolygonCoordinates] = useState([]);

    // Point Variable
        const[showPointForm, setShowPointForm]=useState(false);
        const[lat, setLat]=useState(null);
        const[lon, setLan]=useState(null);
        
    // Circle Variable
    const[showCircleForm, setCircleForm]=useState(false);

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
        vectorSource.current.clear();
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
    const handlePointDrawClick=()=>{
        setShowPoliLineForm(false);
        setShowGeojson(false);
        setShowPolygonForm(false)
        setShowPointForm(true);
        setCircleForm(false);  
    }

    const handleCircleDrawClick=()=>{
        setCircleForm(true);
        setShowPoliLineForm(false);
        setShowGeojson(false);
        setShowPolygonForm(false)
        setShowPointForm(false);
    }

    return (
        <>
        <NavBar/>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>

            {/* Polylines draw Section */}
            <div
                className="linedraw"
                onClick={handlePoliLineDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 1000 }}
            >
                <img src={lineIcon} alt="Line" style={{ height: '40px', width: '40px', backgroundColor:'white' }} />
            </div>

            {/* Geo Json Data section */}
            <div className='geojson-data'
                onClick={handleGeojson} style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 1000 }}>
                <img src={geoJsonicon} alt="geoJson" style={{ height: '40px', width: '40px', backgroundColor:'white' }}></img>
            </div>

            {/* Polygon Draw section */}
            <div
                className="polygon-tool"
                onClick={handlePolygonDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 1000 }}
            >
                <img src={polygonIcon} alt="Polygon"  style={{height:'40px', width:'40px', backgroundColor:'white'}} />
            </div>

            {/* Circle Tool */}
            <div className='circle-Tool'
            onSubmit={handleCircleDrawClick}
            style={{ position: 'absolute', top: '350px', left: '12px', zIndex: 1000 }}>
            <img src={CircleIcon} alt='Circle' style={{ height:'40px', width:'40px', backgroundColor:'white'}}/>
            </div>

            <div className='point-tool' 
            onClick={handlePointDrawClick} 
            style={{ position: 'absolute', bottom: '300px', left: '10px', zIndex: 1000 }}>
                <img src={PointIcon} alt='point' style={{ height:'40px', width:'40px', backgroundColor:'white'}}/>

            </div>

            {/* Navigation */}
            <div className='navigation-tool' 
            style={{position:'absolute', top:'50px', right:'10px', zIndex:1000}}
            >
                <img src={NavgationIcon} alt="navgation " style={{ height:'40px', width:'40px'}} />

            </div>
            
        {/*
        
            Tool Section Start
        
        */}

            {/* Polylines draw tool */}
            {showPolyLineForm && (
                <div className='card' >
                    <form onSubmit={handlePointsSubmit}>
                        <div className='card-title'>
                            <label>
                                Polylines
                            </label>
                        </div>
                        <hr />
                        <div className='card-body'>
                            <label >
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
                            <button className=' btn btn-primary' type="submit" style={{ textAlign: 'center' }}>Submit</button>
                        </div>
                        <hr />
                    </form>

                    {coordinates.length > 0 && (
                        <form onSubmit={handleDrawPolyline}>
                            <div className='card1'>
                                <div className='card-title'>
                                    <label>Coordinates </label> </div>
                                <div className='card-body1'>
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
                                            <hr />
                                        </div>
                                    ))}
                                    <button type="submit">Draw Polyline</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* GeoJson Data  */}

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

            {/* Polygon Drawing Form */}
            {showPolygonForm && (
                <div className='polygon-tool'>
                    {!showCoordinateInputs ? (
                        <form onSubmit={handleNumSidesSubmit}>
                            <div className='card' style={{
                                left: '1040px', top: '1px',
                                bottom: '200px', height: '250px', width: '380px'
                            }}>
                                <label className='card-title'> Polygon Tool</label>
                                <div className='card-body'>
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
                                    <button className='btn btn-outline-success' type="submit" style={{ align: 'center' }}>Submit </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className='card' style={{ left: '1100px', top: '.5px', height: 'auto', width: '400px' }}>
                            <form onSubmit={handleSubmit}>
                                <div className='card-title' >
                                    <label className='lonlat'> Enter the Lon and Lat</label>
                                </div>
                                <div className='card-body'>
                                    {polygoncoordinates.map((coord, index) => (
                                        <div key={index} >
                                            <label className='card-body-text'>
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
                                            <hr />

                                        </div>

                                    ))
                                    }
                                    <button type="submit">Submit Coordinates</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            )}


        </>
    );
}
