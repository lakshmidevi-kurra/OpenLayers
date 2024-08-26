import React from 'react'
import 'ol/ol.css'
import { useRef, useEffect } from 'react';
import {Map, View} from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import vectorSource from 'ol/source/Vector'
import { useState } from 'react';
import './MapDraw.css'
// for Polylines 
import lineIcon from '../images/line.png'
export default function MapDraw() {

        const mapRef=useRef(null);
        const viewRef=useRef(null);
        const[map,setMap]=useState(null);
    useEffect(() => {
        const vectorLayer=new VectorLayer();

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

    const handleClickDrawPolyLines=()=>{
        
    }

  return (
    <>
    <div id="map" ref={mapRef}> </div>
    {/* Polylines start */}
    <div
    className='lineDraw'
    onClick={handleClickDrawPolyLines}>

    <img src={lineIcon} alt="Line" style={{ left:'50px', top:'100px',height: '40px',position:'absolute', width: '40px', cursor:'pointer', zIndex:'1000' }} />


    </div>
    </>
  )
}
