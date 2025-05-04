import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { User } from "firebase/auth";
function Googlecard() {
  const [Currentuser, SetCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        SetCurrentUser(user);
      }
    });
  }, []);

  return (
    <div className="flex items-center ml-1 cursor-pointer gap-3 relative ">
      <img
        src={Currentuser?.photoURL || ""}
        className="w-12  h-12 min-w-[44px] object-contain rounded-full shadow-lg"
        alt=""
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
export default Googlecard;
