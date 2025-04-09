function Header() {
  return (
    <header className="bg-black text-white p-4">
      <div className="grid grid-cols-4">
        <div className="col-start-1 col-end-2">
          <img className="h-30 w-30 object-scale-down" src="/Logo.jpeg"></img>
        </div>
        <div className="col-start-2 col-end-4 self-end">
          <h1 className="text-2xl font-bold text-center">Paulo Moreira</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
