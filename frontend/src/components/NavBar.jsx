function NavBar({ setActiveContent }) {
  return (
    <div className="nav">
      <div className="grid grid-cols-1 gap-10 pl-10 py-10">
        <a className="text-white" href="#home">Home</a>
        <a className="text-white" href="#about">About</a>
        <a className="text-white" href="#contact">Contact</a>
        <a className="text-white" href="#projects">Projects</a>
      </div>
    </div>
  );
}

export default NavBar;
