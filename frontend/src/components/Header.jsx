import Logo from "./Logo.jsx";
import Title from "./Title.jsx";

function Header() {
  return (
    <div className="contents">
      <div className="col-start-1 col-end-2 row-end-2 border-r-2 border-b-2 border-cyan-500">
        <Logo></Logo>
      </div>
      <div className="col-start-2 row-end-2 border-b-cyan-500 border-b-2 py-10">
        <Title></Title>
      </div>
    </div>
  );
}

export default Header;
