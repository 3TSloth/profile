function NavBar({ setActiveContent, orientation = "vertical" }) {
  return (
    <div className="nav">
      <div
        className={orientation === "vertical"
          ? "grid grid-rows-1  gap-10 px-5 py-10"
          : "grid grid-cols-4 auto-cols-max justify-items-center  gap-10 px-5 py-10"}
      >
        <div>
          <a
            className="text-white"
            href="#home"
            onClick={() => setActiveContent(0)}
          >
            Home
          </a>
        </div>
        <div>
          <a
            className="text-white"
            href="#about"
            onClick={() => setActiveContent(1)}
          >
            About
          </a>
        </div>
        <div>
          <a
            className="text-white"
            href="#projects"
            onClick={() => setActiveContent(3)}
          >
            Projects
          </a>
        </div>
        <div>
          <a
            className="text-white"
            href="#contact"
            onClick={() => setActiveContent(2)}
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
