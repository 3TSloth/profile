import AboutMe from "./AboutMe.jsx";
import Contact from "./Contact.jsx";
import Projects from "./Projects.jsx";
import ProfilePicture from "../content/ProfilePicture.jsx";
function MainContent({ activeContentIndex }) {
  const DefaultContent = () => (
    <div className="grid grid-cols-6 gap-2">
      <div className="col-start-3 col-end-5 py-10">
        <p className="text-white">
          Hi there, I'm a software developer with a passion for creating
          innovative solutions. I enjoy working with various technologies and am
          always eager to learn new skills. My goal is to build applications
          that people will find helpful.
          <br />
          Currently looking for work, check the contact link to reach me.
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
