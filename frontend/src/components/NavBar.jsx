import { useState } from "react";

function NavBar({ setActiveContent, orientation = "vertical" }) {
  const [activeLink, setActiveLink] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  return (
    <div className="nav">
      <div
        className={orientation === "vertical"
          ? "grid grid-rows-1  gap-10 px-5 py-10"
          : "grid grid-cols-4 auto-cols-max justify-items-center  gap-10 px-5 py-10"}
      >
        <div>
          <a
            className={activeLink[0]
              ? "text-white rounded-3xl border-2 p-1 border-blue-500"
              : "text-white"}
            href="#home"
            onClick={() => {
              setActiveContent(0);
              setActiveLink({ 0: true, 1: false, 2: false, 3: false });
            }}
          >
            Home
          </a>
        </div>
        <div>
          <a
            className={activeLink[2]
              ? "text-white rounded-3xl border-2 p-1 border-blue-500"
              : "text-white"}
            href="#projects"
            onClick={() => {
              setActiveContent(2);
              setActiveLink({ 0: false, 1: false, 2: true, 3: false });
            }}
          >
            Projects
          </a>
        </div>
        <div>
          <a
            className={activeLink[1]
              ? "text-white rounded-3xl border-2 p-1 border-blue-500"
              : "text-white"}
            href="#about"
            onClick={() => {
              setActiveContent(1);
              setActiveLink({ 0: false, 1: true, 2: false, 3: false });
            }}
          >
            About
          </a>
        </div>
        <div>
          <a
            className={activeLink[3]
              ? "text-white rounded-3xl border-2 p-1 border-blue-500"
              : "text-white"}
            href="#contact"
            onClick={() => {
              setActiveContent(3);
              setActiveLink({ 0: false, 1: false, 2: false, 3: true });
            }}
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
