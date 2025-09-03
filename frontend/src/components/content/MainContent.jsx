import AboutMe from "./AboutMe.jsx";
import Contact from "./Contact.jsx";
import Projects from "./Projects.jsx";
import ProfilePicture from "../content/ProfilePicture.jsx";
function MainContent({ activeContentIndex }) {
  const DefaultContent = () => (
    <div className="grid grid-cols-6 grid-rows-2 gap-2">
      <div className="col-start-3 col-end-5 py-10">
        <p className="text-white text-xl">
          Hi there, I'm a software developer with a passion for creating
          innovative solutions. I enjoy working with various technologies and am
          always eager to learn new skills. My goal is to build applications
          that people will find helpful.
        </p>
      </div>
      <div className="col-start-3 col-end-5 row-start-2">
        <p className="text-white text-xl">
          Currently looking for work, check the contact link to reach me. In the
          meantime, feel free to check out my Projects section to see what I've
          been up to.
        </p>
      </div>
    </div>
  );

  const content = [
    <DefaultContent key={0} />,
    <AboutMe key={1} />,
    <Projects key={2} />,
    <Contact key={3} />,
    <ProfilePicture key={4} />,
  ];

  return content[activeContentIndex];
}

export default MainContent;
