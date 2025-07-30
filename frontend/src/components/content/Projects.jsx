import { APIProvider, Map } from "@vis.gl/react-google-maps";

function Projects() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-2">
      <div className="col-start-2 md:col-start-3 col-end-6 py-10">
        <p className="text-white">
          Currently in progress. (Stay tuned!)
        </p>
        <a
          className="text-white"
          href="/starrunner/index.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play Starrunner (will open a new window, meant for desktop)
        </a>
      </div>
      <div className="col-start-1 col-end-6 row-start-2 row-end-6 py-10">
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            style={{ width: "100%", height: "100%" }}
            defaultCenter={{ lat: 43.6532, lng: -79.3832 }}
            defaultZoom={10}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
          />
        </APIProvider>
      </div>
    </div>
  );
}

export default Projects;
