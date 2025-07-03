import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import { Back, Close, Add } from "../lib/Icons";
import { motion } from "framer-motion";
import "./LabelsView.css";
import { getLabels, updateLabel, addLabel, deleteLabel } from "../api/trackingBudget";
import Dialog from "../components/Dialog";

const Categories = [
    {_id: 1, description: "Health"},
    {_id: 2, description: "Travel"},
    {_id: 3, description: "Groceries"},
    {_id: 4, description: "Food"},
    {_id: 5, description: "Shopping"},
    {_id: 6, description: "Just to keep"},
    {_id: 7, description: "Paid Back"},
    {_id: 8, description: "Bonus"},
    {_id: 9, description: "Salary"}
];

const Entities = [
    {_id: 1, description: "Railway Station"},
    {_id: 2, description: "Market"},
    {_id: 3, description: "Father"},
    {_id: 4, description: "Grand Father"},
    {_id: 5, description: "Friend"}
];

const Modes = [
    {_id: 1, description: "Cash"},
    {_id: 2, description: "Creadit Card"},
    {_id: 3, description: "UPI"},
    {_id: 4, description: "Bank 1"},
    {_id: 5, description: "Bank 2"}
];

const Tags = [
    {_id: 1, description: "Festival"},
    {_id: 2, description: "Vacation"},
    {_id: 3, description: "Renovation"},
    {_id: 4, description: "Party"},
    {_id: 5, description: "Weekend"}
];

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

    useEffect(() => {
        setTitleType(2);
        if(type) setTitle(titles[type]);
        busyIndicator(true, `Loading your ${titles[type]}...`);
        getLabels(type).then((data) => {
            setLabels(data);
        }).catch((e) => {

        }).then(() => {
            busyIndicator(false);
        });
    }, []);

    const onLabelClick = (labelData) => {
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
        if(!labelData.description.trim()) {
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

    return (
    <>
    <Dialog content={<input value={labelData.description} className="AdTr_Input" onChange={onDescriptionChange}/>} 
    footer={<><Button text="Save" press={onSaveClick}/>{labelData._id ? <Button text="Delete" press={onDeleteClick}/> : undefined}</>} 
    title="Edit" closeDialog={closeDialog} open={dialogOpen} bottom={true}/>
    <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">{title}</span>
        <span className="contentRight">
            <Button press={addNew} icon={<Add/>} text="New"/>
        </span>
    </motion.header>
    <motion.main 
        initial={{ y: window.innerHeight, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: window.innerHeight, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="LaVi_Container">
        {labels.map(label => 
            <div key={label._id} className="LaVi_label" onClick={() => onLabelClick(label)}>{label.description}</div>
        )}
    </motion.main>
    </>)
}

export default LabelsView;