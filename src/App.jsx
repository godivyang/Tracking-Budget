import { useEffect, useState } from 'react';
import './App.css';
import Button from './components/Button';
import LandingPage from './components/LandingPage';
import { motion } from "framer-motion";
import { checkIfLogin } from './api/trackingBudget';

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [titleType, setTitleType] = useState(1);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    checkIfLogin(code).then((user) => {
      // console.log("user",user);
      setUserName(user.name);
      if(code) window.location.href = process.env.REACT_APP_TRACKING_BUDGET_URL;
    }).catch((e) => {
      // console.log("redirecting to login");
      window.location.href = process.env.REACT_APP_ULTIMATE_UTILITY_URL + "?redirect=TRACKING_BUDGET";
    });
  }, []);

  const changeThemeTo = (newTheme) => {
    if(theme !== newTheme) setTheme(newTheme);
  };

  return (
    // <AnimatePresence mode="wait">
    <div className={`App_Container ${theme}`}>
      <div 
        style={{flexFlow: titleType === 1 ? "column" : "row"}}
        className={`App_Title`}>
        <motion.span>TRACKing&nbsp;</motion.span>
        <motion.span layout>BUDGET</motion.span>
      </div>
      <div className="App_ThemeChanger">
        <div className="welcome">Welcome {userName}!</div>
        <Button text="Light" press={() => changeThemeTo("light")} 
        type={theme === "light" ? "default" : "simple"}/>
        <Button text="Dark" press={() => changeThemeTo("dark")} 
        type={theme === "dark" ? "default" : "simple"}/>
      </div>
      <div className="App_App"><LandingPage setTitleType = {setTitleType}/></div>
    </div>
    // </AnimatePresence>
  );
};

export default App;
