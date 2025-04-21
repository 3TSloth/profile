import AboutMe from "./AboutMe.jsx";
import Contact from "./Contact.jsx";
import Projects from "./Projects.jsx";
function MainContent({ activeContentIndex }) {
  const DefaultContent = () => (
    <div className="main-content grid grid-cols-1 gap-2">
      <div className="justify-self-center w-120">
        <p className="text-white text-center justify-center px-5 py-20 ">
          Hi there, I'm a software developer with a passion for creating
          innovative solutions. I enjoy working with various technologies and am
          always eager to learn new skills. My goal is to build applications
          that people will find helpful. Currently looking for work, check the
          contact link to reach me.
        </p>
      </div>
    </div>
  );

  const content = [
    <DefaultContent key={0} />,
    <AboutMe key={1} />,
    <Contact key={2} />,
    <Projects key={3} />,
  ];

  return content[activeContentIndex];
}

export default MainContent;
