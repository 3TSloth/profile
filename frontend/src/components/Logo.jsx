function Logo({ onClick }) {
  return (
    <img
      onClick={onClick}
      className="h-30 w-30 object-scale-down cursor-pointer"
      src="/Logo.jpeg"
      alt="Logo"
    />
  );
}

export default Logo;
