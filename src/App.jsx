import { useEffect, useState } from 'react';
import './App.css';
import Button from './components/Button';
import LandingPage from './views/LandingPage';
import { motion } from "framer-motion";
import { checkIfLogin } from './api/trackingBudget';
import BusyIndicator from './components/BusyIndicator';
import { Theme } from './lib/Icons';

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [titleType, setTitleType] = useState(1);
  const [userName, setUserName] = useState("");
  const [busyVisible, setBusyVisible] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    showBusyIndicator(true, "Please wait, you are getting authenticated.");
    let loginTriesFlag = localStorage.getItem("TrackingBudget-Login-Tries");
    if(!loginTriesFlag) {
      localStorage.setItem("TrackingBudget-Login-Tries", "fresh");
    } else if(loginTriesFlag === "tried" && urlParams) {
      alert("SSO Login Failed");
      return;
    }
    checkIfLogin(code).then((userName) => {
      // console.log("user",user);
      localStorage.setItem("TrackingBudget-Login-Tries", "");
      setUserName(userName);
      if(code) window.location.href = process.env.REACT_APP_TRACKING_BUDGET_URL;
    }).catch((e) => {
      // console.log("redirecting to login");
      if(localStorage.getItem("TrackingBudget-Login-Tries") === "fresh") {
        window.location.href = process.env.REACT_APP_ULTIMATE_UTILITY_URL + "?redirect=TRACKING_BUDGET";
        localStorage.setItem("TrackingBudget-Login-Tries", "tried");
      }
    }).then(() => {
      showBusyIndicator(false);
    });
  }, []);

  const changeTheme = () => {
    if(theme == "light") setTheme("dark");
    else setTheme("light");
  };

  const showBusyIndicator = (flag, message="") => {
    setBusyVisible(flag);
    setBusyMessage(message);
  };

  return (
    // <AnimatePresence mode="wait">
    <div className={`App_Container ${theme}`}>
      <BusyIndicator show={busyVisible} message={busyMessage}/>
      <div 
        style={{flexFlow: titleType === 1 ? "column" : "row"}}
        className={`App_Title`}>
        <motion.span>TRACKing&nbsp;</motion.span>
        <motion.span layout>BUDGET</motion.span>
      </div>
      <div className="App_ThemeChanger">
        {userName && <Button text={userName} type="Minimal"/>}
        <Button icon={<Theme/>} press={changeTheme}/>
      </div>
      <div className="App_App"><LandingPage setTitleType = {setTitleType} busyIndicator={showBusyIndicator}/></div>
    </div>
    // </AnimatePresence>
  );
};

export default App;
