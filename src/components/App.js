import { useEffect, useState } from "react";
import AppRouter from "./Router";
import { authService } from "../fbase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [init, setInit] = useState(false);
  const [userObj, setUserObj] = useState(null);
  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setUserObj(user);
      } 
      setInit(true);
    });
  }, [])

  return (
    <>
      { !init ? "initializing..." : (<AppRouter isLoggedIn={Boolean(userObj)} userObj={userObj} />)}
      <footer>&copy; Nwitter {new Date().getFullYear()}</footer>
    </>
  );
}

export default App; 
