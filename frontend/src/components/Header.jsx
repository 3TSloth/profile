import Logo from "./Logo.jsx";
import NavBar from "./NavBar.jsx";

function Header({ setActiveContent }) {
  return (
    <div id="header">
      <div className="grid grid-cols-[200px_1fr]">
        <div className="col-start-1 col-end-2 border-b-2 border-r-2 sm:border-r-0 border-cyan-500">
          <Logo></Logo>
        </div>
        <div className="sm:visible invisible col-start-2 border-r-2 border-b-2 border-cyan-500">
          <NavBar
            setActiveContent={setActiveContent}
            orientation="horizontal"
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
