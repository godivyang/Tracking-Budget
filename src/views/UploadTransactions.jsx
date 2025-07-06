import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./UploadTransactions.css";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { Back, Close } from "../lib/Icons";

const UploadTransactions = ({setTitleType, busyIndicator}) => {
    const [fileName, setFileName] = useState("");
    const [fileDropState, setFileDropState] = useState("inactive");

    const navigate = useNavigate();

    useEffect(() => {
        setTitleType(2);
    }, []);

    const onUploadFile = (e) => {
        if(e.target.files.length == 0) return;
        setFileName(e.target.files[0].name);
    }

    const handleFileDrop = (e) => {
        e.preventDefault();
        setFileName(e.dataTransfer.files[0].name);
        // _handleFileRead(e.dataTransfer.files[0]);
        setFileDropState("inactive");
        // e.target.value = "";
    }

    const handleFileDragEnter = (e) => {
        e.preventDefault();
        setFileDropState("active");
    }

    const handleFileDragLeave = (e) => {
        setFileDropState("inactive");
    }

    return (<>
    <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">Upload Transactions</span>
        <div className="UpTr_AfterFileUpload contentRight">
            {/* {!fileName && <label for="Upload"><Button text="Upload Statement"/></label>} */}
            {fileName && <div className="FileName">
                <span>{fileName}</span>
                <Button icon={<Close/>} press={() => setFileName("")}/>
            </div>}
        </div>
    </motion.header>
    <div className="UpTr_Header">
        
        
        <input type="File" id="Upload" onChange={onUploadFile} hidden/>
        {!fileName && 
        <label htmlFor="Upload" className={`FileDropArea ${fileDropState === "active" ? "Hovering" : ""}`} 
        onDrop={handleFileDrop} onDragEnter={handleFileDragEnter} onDragLeave={handleFileDragLeave} onDragOver={(e) => e.preventDefault()}>
        {fileDropState === "inactive" ?
            "Click or Drop your bank statement pdf here"
            :
            "Drop here"
        }
        </label>}
    </div>
    </>)
};

export default UploadTransactions;