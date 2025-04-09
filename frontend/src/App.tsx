import Header from "./components/Header.jsx";
import MainContent from "./components/content/MainContent.jsx";
import NavBar from "./components/NavBar.jsx";
import { useState } from "react";

function App() {
  const [activeContentIndex, setActiveContent] = useState(0);
  return (
    <div className="grid grid-cols-12 grid-rows-12 h-screen bg-black">
      <div className="row-start-1 row-end-2 col-end-2 justify-self-stretch border-b-2 border-r-2 border-cyan-400 relative">
        <img
          src="/Logo.jpeg"
          alt="Logo"
          className="h-full object-contain absolute left-0"
        />
      </div>
      <div className="row-start-2 row-end-13 col-end-2 border-r-2 border-r-cyan-400">
      </div>
      <div className="row-end-2 col-start-2 col-end-13 border-b-2 border-cyan-400">
      </div>
      <div></div>
    </div>
  );
}

export default App;
