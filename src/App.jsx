import { useEffect, useState } from 'react';
import './App.css';
import Button from './components/Button';
import LandingPage from './components/LandingPage';
import { motion } from "framer-motion";
import { checkIfLogin } from './api/trackingBudget';

const App = () => {
  useEffect(() => {
    checkIfLogin().then((user) => {
      console.log("user",user);
    }).catch();
  }, []);

  const [theme, setTheme] = useState("dark");
  const [titleType, setTitleType] = useState(1);

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
