function NavBar({ setActiveContent }) {
  return (
    <div className="nav">
      <div className="grid grid-cols-1 gap-10 pl-10 py-10">
        <a
          className="text-white"
          href="#home"
          onClick={() => setActiveContent(0)}
        >
          Home
        </a>
        <a
          className="text-white"
          href="#about"
          onClick={() => setActiveContent(1)}
        >
          About
        </a>
        <a
          className="text-white"
          href="#contact"
          onClick={() => setActiveContent(2)}
        >
          Contact
        </a>
        <a
          className="text-white"
          href="#projects"
          onClick={() => setActiveContent(3)}
        >
          Projects
        </a>
      </div>
    </div>
  );
}

export default NavBar;
