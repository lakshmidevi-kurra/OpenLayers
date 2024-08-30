import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import geoJsonicon from '../src/../../images/database.png'
import GeoJSON from 'ol/format/GeoJSON';

export default function GeoJsonData() {
    const vectorSource = useRef(new VectorSource());
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const vectorLayer = useRef(null);
    const viewRef = useRef(null);

    // GeoJson variable
    const [showGeojson, setShowGeojson] = useState(0);

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
    const handleGeojson = () => {
        setShowGeojson(true);//        setShowPoliLineForm(false);
        //setShowPolygonForm(false);
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
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100vh', position: 'absolute' }}></div>
            {/* Geo Json Data section */}
            <div className='geojson-data'
                onClick={handleGeojson} style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
                <img src={geoJsonicon} alt="geoJson" style={{ height: '40px', width: '40px' }}></img>
            </div>


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


        </>)
}
