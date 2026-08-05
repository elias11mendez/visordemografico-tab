import { MapProvider } from "./context/MapContext";
import MainMap from "./components/MainMap";

function App() {
  return (
    <div>
      <MapProvider>
        <MainMap />
      </MapProvider>
    </div>
  );
}

export default App;
