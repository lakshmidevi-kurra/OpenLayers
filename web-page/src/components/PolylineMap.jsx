import React, { useState, useEffect } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

const PolylineMap = () => {
  const [map, setMap] = useState(null);
  const [numPoints, setNumPoints] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
const vectorSource=new VectorSource({
    source: new OSM()
})
  useEffect(() => {
    const initialMap = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }), 
        new VectorLayer({
            source: vectorSource,
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    setMap(initialMap);
  }, []);

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
    const transformedCoords = coordinates.map(coord => [
      parseFloat(coord.lon),
      parseFloat(coord.lat)
    ]);

    const lineFeature = new Feature({
      geometry: new LineString(transformedCoords),
    });

   
    vectorSource.current.clear();
        vectorSource.current.addFeature(new Feature({ geometry: lineFeature }));
   
    map.getView().fit(vectorSource.getExtent(), { duration: 1000 });
  };

  return (
    <div>
      <form onSubmit={handlePointsSubmit}>
        <label>
          Number of Points:
          <input
            type="number"
            value={numPoints}
            onChange={(e) => setNumPoints(e.target.value)}
            min="2"
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      {coordinates.length > 0 && (
        <form onSubmit={handleDrawPolyline}>
          {coordinates.map((coordinate, index) => (
            <div key={index}>
              <label>
                Point {index + 1} Latitude:
                <input
                  type="number"
                  value={coordinate.lat}
                  onChange={(e) =>
                    handleCoordinateChange(index, 'lat', e.target.value)
                  }
                  required
                />
              </label>
              <label>
                Point {index + 1} Longitude:
                <input
                  type="number"
                  value={coordinate.lon}
                  onChange={(e) =>
                    handleCoordinateChange(index, 'lon', e.target.value)
                  }
                  required
                />
              </label>
            </div>
          ))}
          <button type="submit">Draw Polyline</button>
        </form>
      )}

      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default PolylineMap;
