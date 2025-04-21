function Contact() {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="place-items-center pt-10">
        <h1 className="text-white">Contact Me</h1>
      </div>
      <div className="place-items-center">
        <p className="text-white ">
          You can reach me at:
        </p>
        <address>
          <a className="text-white" href="mailto:pdevsloth3@gmail.com">
            pdevsloth3@gmail.com
          </a>
        </address>
      </div>
    </div>
  );
}

export default Contact;
