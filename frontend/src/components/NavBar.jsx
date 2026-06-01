import { PAGE_VIEWS } from "../constants/pageViews.js";

const NAV_ITEMS = [
  { id: PAGE_VIEWS.HOME, label: "Home", href: "#home" },
  { id: PAGE_VIEWS.PROJECTS, label: "Projects", href: "#projects" },
  { id: PAGE_VIEWS.ABOUT, label: "About", href: "#about" },
  { id: PAGE_VIEWS.CONTACT, label: "Contact", href: "#contact" },
];

function NavBar(
  { activeContentIndex, setActiveContent, orientation = "vertical" },
) {
  return (
    <nav className="nav">
      <div
        className={orientation === "vertical"
          ? "flex flex-col gap-10 px-5 py-10"
          : "flex flex-row justify-center gap-10 flex-wrap px-5 py-10"}
      >
        {NAV_ITEMS.map((item) => (
          <div key={item.id}>
            <a
              className={activeContentIndex === item.id
                ? "text-white rounded-3xl border-2 p-1 border-blue-500"
                : "text-white"}
              href={item.href}
              aria-current={activeContentIndex === item.id ? "page" : undefined}
              onClick={() => setActiveContent(item.id)}
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
