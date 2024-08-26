import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
// Polylines draw
import lineIcon from '../src/../../images/line.png';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

export default function PolyLines() {

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
       // setShowGeojson(false);
        //setShowPolygonForm(false)
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

  return (
   <>
               <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
                
            {/* Polylines draw Section */}
            <div
                className="linedraw"
                onClick={handlePoliLineDrawClick}
                style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}
            >
                <img src={lineIcon} alt="Line" style={{ height: '40px', width: '40px' }} />
            </div>

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

   
   </> 
   
)
}
