import { useRef } from "react";
import "./Button.css";

const animationClass = "CuBu_RippleEffect_Animation";
let animationTimeout = null;

// type: default / simple / minimal
// enabled: yes / no
const Button = ({ text, press = () => {}, icon, enabled = "yes", type = "default", className }) => {
    const ripple = useRef(null);
    const rippleContainer = useRef(null);

    const onButtonClick = (oEvent) => {
        oEvent.stopPropagation();
        if(enabled && enabled === "no") {
            return;
        }
        if(animationTimeout) {
            ripple.current.classList.remove(animationClass);
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        const rect = rippleContainer.current.getBoundingClientRect();
        const x = oEvent.clientX - rect.left;
        const y = oEvent.clientY - rect.top;
        ripple.current.style.left = `${x}px`;
        ripple.current.style.top = `${y}px`;
        ripple.current.classList.add(animationClass);
    
        animationTimeout = setTimeout(() => {
            if(ripple.current) {
                ripple.current.classList.remove(animationClass);
                animationTimeout = null;
            }
        }, 500);

        press();
    }

    const onButtonClickThroughKeyboard = (oEvent) => {
        oEvent.stopPropagation();
        // key code 13 is for Enter key
        if(oEvent.keyCode === 13) {
            onButtonClick(oEvent);
        }
    }

    return (
        <div className={`${className ? className : ""}`}>
        <div 
        ref={rippleContainer}
        className={`${className ? className : ""} CuBu_Container`} 
        onClick={onButtonClick} 
        type={type}
        enabled={enabled}
        tabIndex={enabled === "yes" ? 0 : -1}
        onKeyDown={onButtonClickThroughKeyboard}>
            {icon ? icon : undefined}
            {icon && text ? <>&nbsp;</> : undefined}
            <div className="CuBu_Text">{text}</div>
            <span className="CuBu_RippleEffect" ref={ripple}></span>
        </div>
        </div>
    )
}

export default Button;