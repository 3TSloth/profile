import Logo from "./Logo.jsx";
import NavBar from "./NavBar.jsx";
import { PAGE_VIEWS } from "../constants/pageViews.js";

function Header({ activeContentIndex, setActiveContent }) {
  return (
    <div id="header">
      <div className="grid grid-cols-[150px_1fr] sm:grid-cols-[150px_1fr_150px] border-b-2 border-cyan-500">
        <div className="border-r-2 sm:border-r-0 border-cyan-500">
          <Logo onClick={() => setActiveContent(PAGE_VIEWS.SECRET_LOGO_VIEW)}>
          </Logo>
        </div>
        <div className="hidden sm:block">
          <NavBar
            activeContentIndex={activeContentIndex}
            setActiveContent={setActiveContent}
            orientation="horizontal"
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
