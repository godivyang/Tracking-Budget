import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { Back, Close, Add } from "../lib/Icons";
import { motion } from "framer-motion";
import "./LabelsView.css";
import { getLabels, updateLabel, addLabel, deleteLabel, updateOrder } from "../api/trackingBudget";
import Dialog from "../components/Dialog";

const titles = {
    category: "Categories",
    mode: "Modes of Transaction",
    entity: "Entities",
    tag: "Tags"
}

const LabelsView = ({setTitleType, type, busyIndicator}) => {
    const navigate = useNavigate();

    const dialog = useRef(null);

    const [title, setTitle] = useState();
    const [labels, setLabels] = useState([]);
    const [labelData, setLabelData] = useState({_id: "", description: ""});
    const [dialogOpen, setDialogOpen] = useState(false);

    const [dropIndex, setdropIndex] = useState();
    const [orderMap, setOrderMap] = useState(new Map());
    const [mappingChanged, setMappingChanged] = useState(false);

    useEffect(() => {
        setTitleType(2);
        if(type) setTitle(titles[type]);
        busyIndicator(true, `Loading your ${titles[type]}...`);
        getLabels(type).then((data) => {
            setLabels(data);
            setOrderMap(data.map(label => label._id));
        }).catch((e) => {

        }).then(() => {
            busyIndicator(false);
        });
    }, []);

    const onLabelClick = (labelData) => {
        if(mappingChanged) return;
        setLabelData({...labelData});
        showDialog();
    }

    const closeDialog = () => {
        // dialog.current.close();
        setDialogOpen(false);
    }

    const showDialog = () => {
        setDialogOpen(true);
        // dialog.current.showModal();
    }

    const addNew = () => {
        setLabelData({_id: "", description: ""});
        showDialog();
    }

    const onDescriptionChange = (e) => {
        labelData.description = e.target.value;
        setLabelData({...labelData});
    }

    const onSaveClick = (e) => {
        let _labelData = labelData.description.trim();
        if(!_labelData) {
            alert("Please fill the description")
            return;
        }
        let index = labels.findIndex(l => l._id === labelData._id);
        busyIndicator(true, "Saving, please wait...");
        if(index != -1) {
            updateLabel(type, labelData._id, labelData.description).then((data) => {
                labels[index].description = data.description;
                setLabels([...labels]);
            }).catch((e) => {

            }).then(() => {
                busyIndicator(false);
                closeDialog();
                // dialog.current.close();
            });
        } else {
            addLabel(type, labelData.description).then((data) => {
                setLabels([...labels, {...data}]);
            }).catch((e) => {

            }).then(() => {
                busyIndicator(false);
                closeDialog();
                // dialog.current.close();
            });
        }
    }

    const onDeleteClick = (e) => {
        busyIndicator(true, "Deleting, please wait...");
        let index = labels.findIndex(l => l._id === labelData._id);
        deleteLabel(type, labelData._id).then(() => {
            labels.splice(index, 1);
            setLabels([...labels]);
        }).catch((e) => {

        }).then(() => {
            busyIndicator(false);
            // dialog.current.close();
            closeDialog();
        });
    }

    const _checkIfMappingChanged = (updated) => {
        for(let i = 0; i < labels.length; i++) {
            if(updated[i]._id === orderMap[i]) continue;
            setMappingChanged(true);
            return true;
        }
        setMappingChanged(false);
        return false;
    };

    const onTileDrop = (index, e) => {
        const updated = [...labels];
        const [moved] = updated.splice(index, 1);
        updated.splice(dropIndex, 0, moved);
        setLabels([...updated]);
        setdropIndex(undefined);
        _checkIfMappingChanged(updated);
    }

    const onTileDragOver = (index, e) => {
        e.preventDefault();
        setdropIndex(index);
    };

    const onTileDragStart = (index, e) => {
        setdropIndex(index);
    };

    const saveNewOrder = () => {
        const newMap = labels.map(label => label._id);
        busyIndicator(true, "Saving the new order...");
        updateOrder(type, newMap).then(() => {
            busyIndicator(false);
            setOrderMap(newMap);
            setMappingChanged(false);
        }).catch((e) => {
            alert("Sorting failed");
            cancelNewOrder();
            busyIndicator(false);
        });
    };

    const cancelNewOrder = () => {
        labels.sort((a,b) => orderMap.indexOf(a._id) - orderMap.indexOf(b._id));
        setLabels([...labels]);
        setMappingChanged(false);
    }

    return (
    <>
    <Dialog content={<input value={labelData.description} className="AdTr_Input" onChange={onDescriptionChange}/>} 
    footer={<><Button text="Save" press={onSaveClick}/>{labelData._id ? <Button text="Delete" press={onDeleteClick}/> : undefined}</>} 
    title="Edit" closeDialog={closeDialog} open={dialogOpen} bottom={true}/>
    <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.2 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">{title}</span>
        <span className="contentRight">
            {!mappingChanged && <Button press={addNew} icon={<Add/>} text="New"/>}
            {mappingChanged && <Button press={cancelNewOrder} text="Cancel"/>}
            {mappingChanged && <Button press={saveNewOrder} text="Save"/>}
        </span>
    </motion.header>
    <motion.main 
        initial={{ y: window.innerHeight, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: window.innerHeight, opacity: 0 }}
        transition={{ type: "spring", duration: 0.2 }}
        className="LaVi_Container">
        {labels.map((label, i) => 
            <motion.div layout key={label._id} className={`LaVi_label ${!isNaN(dropIndex) ? "dragging" : ""} ${dropIndex === i ? "holding" : ""}`} onClick={() => onLabelClick(label)}
             draggable={true} onDragStart={(e) => onTileDragStart(i,e)} onDragOver={(e) => onTileDragOver(i,e)} onDragEnd={(e) => onTileDrop(i,e)}>
                {label.description}
            </motion.div>
        )}
    </motion.main>
    </>)
}

export default LabelsView;