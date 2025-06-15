import "./LandingPage.css";
import { Routes, Route, useNavigate } from "react-router";
import AddTransaction from "./AddTransaction";
import { useEffect } from "react";
import ViewTransactions from "./ViewTransactions";
import LabelsView from "./LabelsView";
import { motion } from "framer-motion";

const HomePage = ({setTitleType}) => {
    const navigate = useNavigate();

    useEffect(() => {
        setTitleType(1);
    }, []);

    const onTileClick = (id) => {
        setTitleType(2);
        if(id === 1) navigate("AddTransaction");
        else if(id === 2) navigate("ViewTransactions");
        else if(id === 3) navigate("UploadTransactions");
        else if(id === 4) navigate("Labels/Entities");
        else if(id === 5) navigate("Labels/Categories");
        else if(id === 6) navigate("Labels/Modes");
        else if(id === 7) navigate("Labels/Tags");
    }

    return (
        <motion.div 
            key="Home"
            initial={{ x: -window.innerWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -window.innerWidth, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }} 
            className="LaPa_Container">
            <div className="LaPa_SubContainer first">
                <div className="LaPa_Title">Transactions</div>
                    <div className="LaPa_TileContainer">
                        <span className="LaPa_Tile" onClick={() => onTileClick(1)}>Add</span>
                        <span className="LaPa_Tile" onClick={() => onTileClick(2)}>View</span>
                        <span className="LaPa_Tile">Upload</span>
                    </div>
                </div>
            <div className="LaPa_SubContainer second">
                <div className="LaPa_Title">Labels</div>
                <div className="LaPa_TileContainer">
                    <span className="LaPa_Tile" onClick={() => onTileClick(4)}>Entities</span>
                    <span className="LaPa_Tile" onClick={() => onTileClick(5)}>Categories</span>
                    <span className="LaPa_Tile" onClick={() => onTileClick(6)}>Modes of Transaction</span>
                    <span className="LaPa_Tile" onClick={() => onTileClick(7)}>Tags</span>
                </div>
            </div>
        </motion.div>
    )
}

const LandingPage = ({setTitleType}) => {
    return (
    <Routes>
        <Route path="/" element={<HomePage setTitleType={setTitleType}/>}/>
        <Route path="AddTransaction" element={<AddTransaction setTitleType={setTitleType}/>}/>
        <Route path="ViewTransactions" element={<ViewTransactions setTitleType={setTitleType}/>}/>

        <Route path="Labels/Entities" element={<LabelsView setTitleType={setTitleType} type="Entities"/>}/>
        <Route path="Labels/Categories" element={<LabelsView setTitleType={setTitleType} type="Categories"/>}/>
        <Route path="Labels/Modes" element={<LabelsView setTitleType={setTitleType} type="Modes"/>}/>
        <Route path="Labels/Tags" element={<LabelsView setTitleType={setTitleType} type="Tags"/>}/>
    </Routes>)
}

export default LandingPage;