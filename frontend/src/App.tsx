/// <reference types="vite/client" />

import MainContent from "./components/content/MainContent.jsx";
import NavBar from "./components/NavBar.jsx";
import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";

function App() {
  const [activeContentIndex, setActiveContent] = useState(0);

  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        if (apiUrl === undefined || apiUrl === null) {
          console.log("API URL is undefined or null.");
          return;
        }
        const response = await fetch(`${apiUrl}/quotes`);

        const data = await response.json();
        setQuotes(data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[100px_1fr] min-h-screen bg-black font-display">
      <div className="col-span-full">
        <Header setActiveContent={setActiveContent} />
      </div>
      <div className="sm:hidden col-start-1 col-end-2 row-start-2 row-end-3 border-r-cyan-500 border-r-2 overflow-y-auto">
        <NavBar setActiveContent={setActiveContent}></NavBar>
      </div>
      <div className="col-start-2 row-start-2 row-end-3  overflow-y-auto">
        <MainContent activeContentIndex={activeContentIndex}></MainContent>
      </div>
      <div className="col-start-1 row-start-3" />
      <div className="col-start-1 col-span-2 row-start-3  text-center py-10 px-10 border-t-cyan-500 border-t-2 flex items-end justify-end">
        <p className="text-white ">{quotes[activeContentIndex]}</p>
      </div>
    </div>
  );
}

export default App;
