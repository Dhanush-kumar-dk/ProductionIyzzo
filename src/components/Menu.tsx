import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion } from "framer-motion";
import { useState } from "react";
import Googlecard from "./GoggleCard";

function Menu({ openLogIn }: { openLogIn: () => void }) {
  const [user = null] = useAuthState(auth);
  const [isMenu, setisMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div
        onMouseEnter={() => setisMenu(true)}
        onMouseLeave={() => setisMenu(false)}
        className="flex items-center ml-auto cursor-pointer gap-2 relative "
      >
        <Googlecard />

        {isMenu && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute w-44 z-10 flex flex-col right-9 top-10 bg-card shadow-lg rounded-lg backdrop-blur-md "
          >
            <div>
              <p className="text-xl text-textColor hover:font-semibold duration-150 translate-all ease-in-out cursor-pointer no-underline m-2">
                <a
                  href="https://amzn.to/4hem5Gx "
                  className="text-xl text-gray-900 hover:font-semibold duration-150 translate-all ease-in-out cursor-pointer no-underline m-2"
                >
                  Amazon
                </a>
              </p>
            </div>
            <hr className="mx-2" />

            <div>
              <div className="space-x-2 ">
                {!user ? (
                  <button
                    onClick={openLogIn}
                    className="text-xl text-blue-500 hover:font-semibold duration-150 translate-all ease-in-out m-2"
                  >
                    Log In
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => auth.signOut()}
                      className="text-xl text-blue-500 hover:font-semibold duration-150 translate-all ease-in-out m-2"
                    >
                      Log Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default Menu;
