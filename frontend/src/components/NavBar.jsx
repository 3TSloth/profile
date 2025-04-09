function NavBar({ setActiveContent }) {
  return (
    <div className="nav">
      <div className="grid grid-rows-3 gap-10 pl-10">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#projects">Projects</a>
      </div>
    </div>
  );
}

export default NavBar;
