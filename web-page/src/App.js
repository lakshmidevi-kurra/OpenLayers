import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './App.css';
import MapContainer from './components/GeoJSON/GeoJsonData';
import NavBar from './components/NavBar/NavBar';
//import GeoJsonData from './components/GeoJSON/GeoJsonData';
function App() {
  return (
    <>
    <FontAwesomeIcon/>
    <NavBar/>
    <MapContainer/>
    </>
  );
}

export default App;
