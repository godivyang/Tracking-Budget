import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "./Button";
import { Back, Close, Add } from "./Icons";
import "./LabelsView.css";

const Categories = [
    {key: 1, name: "Health"},
    {key: 2, name: "Travel"},
    {key: 3, name: "Groceries"},
    {key: 4, name: "Food"},
    {key: 5, name: "Shopping"},
    {key: 6, name: "Just to keep"},
    {key: 7, name: "Paid Back"},
    {key: 8, name: "Bonus"},
    {key: 9, name: "Salary"}
];

const Entities = [
    {key: 1, name: "Railway Station"},
    {key: 2, name: "Market"},
    {key: 3, name: "Father"},
    {key: 4, name: "Grand Father"},
    {key: 5, name: "Friend"}
];

const Modes = [
    {key: 1, name: "Cash"},
    {key: 2, name: "Creadit Card"},
    {key: 3, name: "UPI"},
    {key: 4, name: "Bank 1"},
    {key: 5, name: "Bank 2"}
];

const Tags = [
    {key: 1, name: "Festival"},
    {key: 2, name: "Vacation"},
    {key: 3, name: "Renovation"},
    {key: 4, name: "Party"},
    {key: 5, name: "Weekend"}
];

const LabelsView = ({setTitleType, type}) => {
    const navigate = useNavigate();

    const dialog = useRef(null);

    const [title, setTitle] = useState();
    const [labels, setLabels] = useState([]);
    const [labelData, setLabelData] = useState({key: "", name: ""});

    useEffect(() => {
        setTitleType(2);
        if(type) setTitle(type);
        if(type === "Modes") {
            setLabels(Modes);
            setTitle("Modes of Transaction");
        } else if(type === "Categories") {
            setLabels(Categories);
        } else if(type === "Entities") {
            setLabels(Entities);
        } else if(type === "Tags") {
            setLabels(Tags);
        }
    }, []);

    const onLabelClick = (labelData) => {
        setLabelData({...labelData});
        dialog.current.showModal();
    }

    const onCloseDialog = () => {
        dialog.current.close();
    }

    const addNew = () => {
        setLabelData({key: new Date(), name: ""});
        dialog.current.showModal();
    }

    const onNameChange = (e) => {
        labelData.name = e.target.value;
        setLabelData({...labelData});
    }

    const onSaveClick = (e) => {
        if(!labelData.name.trim()) {
            console.log("Hi")
            alert("Please fill the name")
            return;
        }
        let index = labels.findIndex(l => l.key === labelData.key);
        if(index != -1) {
            labels[index].name = labelData.name;
            setLabels([...labels]);
        } else {
            setLabels([...labels, {...labelData}]);
        }
        dialog.current.close();
    }

    return (
    <>
    <dialog className="bottom" ref={dialog}>
        <div className="ViTr_DialogHeader">
            <span>Edit</span>
            <Button icon={<Close/>} press={onCloseDialog} type="minimal"/>
        </div>
        <div className="LaVi_DialogContainer">
            <input value={labelData.name} className="AdTr_Input" onChange={onNameChange}/>
        </div>
        <div className="ViTr_DialogFooter">
            <Button text="Save" press={onSaveClick}/>
        </div>
    </dialog>
    <header>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">{title}</span>
        <span className="contentRight">
            <Button press={addNew} icon={<Add/>} text="New"/>
        </span>
    </header>
    <main className="LaVi_Container">
        {labels.map(label => 
            <div key={label.key} className="LaVi_label" onClick={() => onLabelClick(label)}>{label.name}</div>
        )}
    </main>
    </>)
}

export default LabelsView;