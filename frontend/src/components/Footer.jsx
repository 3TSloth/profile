function Footer({ activeContentIndex, quotes }) {
  return (
    <p className="text-white ">
      {quotes.length > 0
        ? (
          <span>
            Quotes from the{" "}
            <i>
              Stormlight Archive
            </i>: "{quotes[activeContentIndex % quotes.length]["quote"]}"
          </span>
        )
        : ""}
    </p>
  );
}

export default Footer;
