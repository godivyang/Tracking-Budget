import { useState } from 'react';
import './App.css';
import Button from './components/Button';
import LandingPage from './components/LandingPage';

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [titleType, setTitleType] = useState(1);

  const changeThemeTo = (newTheme) => {
    if(theme !== newTheme) setTheme(newTheme);
  };

  return (
    <div className={`App_Container ${theme}`}>
      <div className="App_Title">
        TRACKing{titleType === 1 ? <br/> : <>&nbsp;</>}BUDGET
      </div>
      <div className="App_ThemeChanger">
        <Button text="Light" press={() => changeThemeTo("light")} 
        type={theme === "light" ? "default" : "simple"}/>
        <Button text="Dark" press={() => changeThemeTo("dark")} 
        type={theme === "dark" ? "default" : "simple"}/>
      </div>
      <div className="App_App"><LandingPage setTitleType = {setTitleType}/></div>
    </div>
  );
};

export default App;
