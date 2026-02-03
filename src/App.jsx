import { useEffect, useState } from 'react';
import './App.css';
import Button from './components/Button';
import LandingPage from './views/LandingPage';
import { motion } from "framer-motion";
import { checkIfLogin, wakeUltimateUtility } from './api/trackingBudget';
import BusyIndicator from './components/BusyIndicator';
import { Theme } from './lib/Icons';

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [titleType, setTitleType] = useState(1);
  const [userName, setUserName] = useState("");
  const [busyVisible, setBusyVisible] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");

  const [loginFailed, setLoginFailed] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);
  const address = "TrackingBudget-Login-Tries";
  const appName = "TRACKING_BUDGET";
  const appURL = process.env.REACT_APP_TRACKING_BUDGET_URL;

// "TrackingBudget-Login-Tries" logic:
// if it is not present in localstorage, set it to "fresh"
//   login will be checked, if user is logged in, this variable is removed
//   otherwise this variable gets the value of "tried" and redirects to UltimateUtility for SSO
// if it is present and has a vlaue "tried" its value will be set to "final"
//   login will be checked, if user is logged in or not, this variable is removed

  useEffect(() => {
    
    const code = (new URLSearchParams(window.location.search)).get("code");
    let loginTriesFlag = localStorage.getItem(address),
        timer, time = 0;
    if (!loginTriesFlag) {
        localStorage.setItem(address, "fresh");
        timer = setInterval(() => {
            time++;
            setWaitingTime(time);
        }, 1000);
    } else if (loginTriesFlag === "tried") {
        localStorage.setItem(address, "final");
    } else if (loginTriesFlag === "fresh") {
        // times when user refreshes manually
    } else {
        localStorage.removeItem(address);
        setLoginFailed(true);
        clearInterval(timer);
        // alert("SSO LOGIN FAILED!");
        return;
    }

    wakeUltimateUtility();
    checkLogin(code, timer);

  }, []);

  const checkLogin = (code, timer) => {
      checkIfLogin(code).then((userName) => {
          localStorage.removeItem(address);
          setUserName(userName);
          if (code) window.location.href = appURL;
    }).catch((e) => {
        console.log(localStorage.getItem(address))
        if (localStorage.getItem(address) === "fresh") {
            localStorage.setItem(address, "tried");  
            window.location.href = process.env.REACT_APP_ULTIMATE_UTILITY_URL + "?redirect=" + appName;
        } else {
            localStorage.removeItem(address);
              // alert("SSO LOGIN FAILED!");
            setLoginFailed(true);
        }
    }).then(() => {
        clearInterval(timer);
    });
  };

  const refreshPage = () => {
      window.location.href = appURL;
  }

  const changeTheme = () => {
    if(theme == "light") setTheme("dark");
    else setTheme("light");
  };

  const showBusyIndicator = (flag, message="") => {
    setBusyVisible(flag);
    setBusyMessage(message);
  };

  return userName ? 
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
    :
    <>
      <div className='HomePage-Waiting-Container'>
          <span className="CustomBackground">
              <span>
                  <div>Welcome to</div>
                  <span className='AppName'>Tracking Budget</span>
              </span>
              <div style={{margin: "1rem 0"}}>
                  Please wait while we are authenticating you...
              </div>
              <span>
              {!!waitingTime && 
              <div className='WaitingTime'>
                  <div>Waiting time: </div>
                  <span style={{fontSize: "2.5rem", fontWeight: "900", color: "white"}}>{waitingTime}s</span>
                  <div>expect &lt;60s</div>
              </div>}
              </span>
          </span>
          {loginFailed &&
          <Button press={refreshPage} text="Refresh"/>
          }
      </div>
    </>;
};

export default App;
