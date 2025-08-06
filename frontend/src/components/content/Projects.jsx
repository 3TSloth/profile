import DelayMap from "../DelayMap.jsx";

function Projects() {
  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-2 justify-center">
      <div className="col-start-1 md:col-start-2 col-end-6 py-10 ">
        <p className="text-white">
          2 small projects I've been working on; a spaceship fighting simulation
          and a map displaying TTC Subway delays described below.
        </p>
        <a
          className="text-yellow-400 underline "
          href="/starrunner/index.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play Starrunner (will open a new window, meant for desktop)
        </a>
        <p className="text-white py-10">
          As a fun exercise, this is a map containing all the causes for a
          subway delay in Toronto so far in 2025. It may take a moment to load.

          The information is pulled from Toronto's Open Data Catalogue.

          Click on a cluster then on a code to view how long the delay was for.
          (Zoom in to see each instance)
        </p>
      </div>

      <DelayMap />
    </div>
  );
}

export default Projects;
