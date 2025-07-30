import DelayMap from "../DelayMap.jsx";

function Projects() {
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
      <DelayMap />
    </div>
  );
}

export default Projects;
