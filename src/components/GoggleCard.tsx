import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { User, onAuthStateChanged } from "firebase/auth";

function Googlecard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center ml-1 cursor-pointer gap-3 relative">
      {currentUser?.photoURL ? (
        <img
          src={currentUser.photoURL}
          className="w-10 h-10 min-w-[40px] object-cover rounded-full shadow-md"
          alt={currentUser.displayName || "User avatar"}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-10 h-10 min-w-[40px] bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
          {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
}

export default Googlecard;
