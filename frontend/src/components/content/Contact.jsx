function Contact() {
  return (
    <div className="main-content grid grid-cols-6 place-items-center gap-2">
      <div className="col-start-2 col-end-6 py-10">
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
