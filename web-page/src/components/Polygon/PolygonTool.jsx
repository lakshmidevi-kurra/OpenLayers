import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polygon from 'ol/geom/Polygon';
import polygonIcon from '../src/../../images/polygon.png'
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import './Polygon.css'
export default function PolygonTool() {
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const vectorLayer = useRef(null);
    const viewRef = useRef(null);
 // polygon variable
 const [showPolygonForm, setShowPolygonForm] = useState(false);
 const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);
 const [numSides, setNumSides] = useState(null);
 const [polygoncoordinates, setpolygonCoordinates] = useState([]);
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

const handlePolygonDrawClick = () => {
    setShowPolygonForm(true);
   // setShowGeojson(false);
    //setShowPoliLineForm(false);

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
  return (
    <>
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>

     {/* Polygon Draw section */}
     <div
                className="polygon-tool"
                onClick={handlePolygonDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}
            >
                <img src={polygonIcon} alt="Polygon" style={{ height: '40px', width: '40px' }} />
            </div>


            
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
  )
}

