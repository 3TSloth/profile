function ProfilePicture() {
  return (
    <div className="grid grid-cols-3 grid-rows-2 justify-center">
      <div className="col-start-2 row-start-1 py-20">
        <img
          className="object-scale-down"
          src="/cartoonSloth.jpg"
          alt="A cartoon sloth hanging from a branch"
        />
      </div>
      <div className="col-start-2 row-start-2">
        <p className="text-white text-2xl">
          Congrats on finding this Easter Egg! You might be curious as to why I
          chose a sloth as my 'mascot'; it's simply because I was born with only
          3 toes on my right foot and find sloths to be cute (especially 3-toed
          sloths).
        </p>
      </div>
    </div>
  );
}

export default ProfilePicture;
