import { useEffect, useState } from "react";
import { Close } from "../lib/Icons";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import "./Dialog.css";

const Dialog = ({title="Dialog", content, footer, closeDialog=()=>{}, open=false, bottom=false}) => {
    const [dialogOpen, setDialogOpen] = useState(open);

    useEffect(() => {
        setDialogOpen(open);
    }, [open]);
    
    return (
    <AnimatePresence>
    {dialogOpen ?
    <div className="Dialog_Background">
        <motion.div 
        initial={{ x: window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }} 
        className={`Dialog_Container ${bottom ? "bottom" : ""}`}>
            <div className="Dialog_Header">
                <span>{title}</span>
                <Button icon={<Close/>} press={closeDialog} type="minimal"/>
            </div>
            <div className="Dialog_Body">
            {content}
            </div>
            <div className="Dialog_Footer">
                {footer}
            </div>
        </motion.div>
    </div>
    :undefined}
    </AnimatePresence>)
};

export default Dialog;