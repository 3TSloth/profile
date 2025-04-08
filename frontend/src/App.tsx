import Header from "./components/Header.jsx";
import MainContent from "./components/content/MainContent.jsx";
import NavBar from "./components/NavBar.jsx";

function App() {
  return (
    <div className="grid grid-cols-12 grid-rows-12 gap-4 h-screen">
      <div className="col-span-12 row-span-2">
        <Header></Header>
      </div>
      <div className="row-span-10 col-span-12">
        <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full">
          <div className="col-start-1 col-end-3 row-span-12">
            <NavBar>
            </NavBar>
          </div>
          <div className="col-start-3 col-end-12 row-span-12">
            <MainContent></MainContent>
          </div>
        </div>
      </div>
      <div className="col-span-12 row-span-2"></div>
    </div>
  );
}

export default App;
