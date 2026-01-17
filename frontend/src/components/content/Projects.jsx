import DelayMapLeaflet from "../DelayMapLeaflet.jsx";

function Projects() {
  return (
    <div className="grid grid-cols-6 grid-rows-4 gap-4">
      <div className="col-start-1  col-end-6 py-10 ">
        <h1 className="text-white">Projects</h1>
        <ul className="list-disc">
          <li className="text-white">
            <p>
              2 small projects I've been working on; a spaceship fighting
              simulation and a map displaying TTC Subway delays described below.
            </p>
          </li>
          <p className="py-4">
            As a fun exercise, this is a map showing (currently only 5) causes
            for a TTC (Toronto Transit Corporation) Subway Delay.

            The information is pulled from Toronto's Open Data Catalogue (which
            contains typos/errors, e.g. 'Assualt' instead of 'Assault').
          </p>

          <p>
            Click on a cluster then on a code to view how long the delay was
            for. (Zoom in to see each instance)
          </p>
        </ul>
      </div>
      <div className="row-start-2 col-start-1 col-span-6 row-span-2">
        <DelayMapLeaflet />
      </div>
      <div className="row-start-4 col-start-1 col-span-3">
        <a
          className="text-yellow-400 underline "
          href="/starrunner/index.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play Starrunner (will open a new window, meant for desktop)
        </a>
      </div>
    </div>
  );
}

export default Projects;
