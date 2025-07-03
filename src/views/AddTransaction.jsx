import Button from "../components/Button";
import { useNavigate } from "react-router";
import "./AddTransaction.css";
import { useEffect, useState } from "react";
import { Back } from "../lib/Icons";
import { motion } from "framer-motion";
import { addTransaction, getLabels } from "../api/trackingBudget";
import Dialog from "../components/Dialog";

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
    {key: 3, name: "Evergreen Foods"},
    {key: 4, name: "Grand Father"},
    {key: 5, name: "Friend"}
];

const Tags = [
    {key: 1, name: "Festival"},
    {key: 2, name: "Vacation"},
    {key: 3, name: "Renovation"},
    {key: 4, name: "Party"},
    {key: 5, name: "Weekend"}];

const Modes = [
    {key: 1, name: "Cash"},
    {key: 2, name: "Creadit Card"},
    {key: 3, name: "UPI"},
    {key: 4, name: "Bank 1"},
    {key: 5, name: "Bank 2"}];

const ChipQuestion = ({question, search, chips, filter, selected, onChange}) => {
    return (
    <div className="AdTr_GeneralQuestion">
        <span className="AdTr_InlineSearch">
            <span className="AdTr_Question">{question}:</span>
            <input type="Search" className="AdTr_Search" onInput={search} placeholder="search"/>
        </span>
        <div className="AdTr_Chips">
            {chips.filter(chip => chip.description.includes(filter)).length ?
            chips.filter(chip => chip.description.includes(filter)).map(chip => {
                let className = "AdTr_Chip";
                if(typeof selected !== "object") className += chip._id === selected ? " selected" : "";
                else className += selected.findIndex(sel => sel._id === chip._id) !== -1 ? " selected" : "";
                return (<div className={className} key={chip._id}
                        onClick={() => onChange(chip._id)}>{chip.description}</div>)
            })
            :
            <div>No Data</div>}
        </div>
    </div>
    )
};

const SuccessFragment = (details) => {
    return (
    <div className="AdTr_DialogDetails">
        <span>Date: </span><strong>{new Date(details.date).toDateString()}</strong>
        <span>Amount: </span><strong>₹{details.amount}</strong>
        <span>Type: </span><strong>{details.type === "income" ? "Income" : "Expense"}</strong>
        <span>Category: </span><strong>{details.category}</strong>
        {details.description ? <><span>Description: </span><strong>{details.description}</strong></> : undefined}
        {details.motive ? <><span>Motive: </span><strong>{details.motive === "want" ? "Want" : details.motive === "need" ? "Need" : "Investment"}</strong></> : undefined}
        {details.mode ? <><span>Mode: </span><strong>{details.mode}</strong></> : undefined}
        {details.entities && details.entities.length ? <><span>Entities: </span><strong>{(details.entities||[]).join(", ")}</strong></> : undefined}
        {details.tags && details.tags.length ? <><span>Tags: </span><strong>{(details.tags||[]).join(", ")}</strong></> : undefined}
    </div>)
};

const AddTransaction = ({setTitleType}) => {
    const navigate = useNavigate();
    const [type, setType] = useState("expense");
    const [date, setDate] = useState(new Date().getTime());
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [catSearchKey, setCatSearchKey] = useState("");
    const [entities, setEntities] = useState([]);
    const [entSearchKey, setEntSearchKey] = useState("");
    const [tags, setTags] = useState([]);
    const [tagSearchKey, setTagSearchKey] = useState("");
    const [mode, setMode] = useState("");
    const [modSearchKey, setModSearchKey] = useState("");
    const [motive, setMotive] = useState("need");
    const [moreInfoVisible, setMoreInfoVisible] = useState(false);
    const [addTransactionModel, setAddTransactionModel] = useState({categories: [], entities: [], modes: [], tags: [], details: null});
    const [validated, setValidated] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    useEffect(() => {
        setTitleType(2);
        Promise.all([getLabels("category"), getLabels("entity"), getLabels("mode"), getLabels("tag")])
        .then(([categories, entities, modes, tags]) => {
            addTransactionModel.categories = categories;
            addTransactionModel.entities = entities;
            addTransactionModel.modes = modes;
            addTransactionModel.tags = tags;
            setAddTransactionModel({...addTransactionModel});
        });
    }, []);

    useEffect(() => {
        if(date && amount > 0 && category) {
            setValidated(true);
        } else setValidated(false);
    }, [date, amount, category]);
    
    const onCategoryChange = (newCategory) => {
        const newCat = addTransactionModel.categories.find(cat => cat._id == newCategory);
        if(newCat._id !== category) setCategory(newCat._id);
    }

    const onModeChange = (newMode) => {
        const newMod = addTransactionModel.modes.find(mod => mod._id === newMode);
        if(newMod._id !== mode) setMode(newMod._id);
    }

    const onEntitiesChange = (newEntity) => {
        const newEnt = addTransactionModel.entities.find(ent => ent._id === newEntity);
        const exists = entities.findIndex(ent => ent._id === newEntity);
        if(exists !== -1) entities.splice(exists, 1);
        else entities.push(newEnt);
        setEntities([...entities]);
    }

    const onTagsChange = (newTag) => {
        const newTa = addTransactionModel.tags.find(tag => tag._id === newTag);
        const exists = tags.findIndex(tag => tag._id === newTag);
        if(exists !== -1) tags.splice(exists, 1);
        else tags.push(newTa);
        setTags([...tags]);
    }

    const applyFilterOn = (e, type) => {
        if(type === "category") {
            setCatSearchKey(e.target.value);
        } else if(type === "entities") {
            setEntSearchKey(e.target.value);
        } else if(type === "mode") {
            setModSearchKey(e.target.value);
        } else if(type === "tags") {
            setTagSearchKey(e.target.value);
        }
    }

    const onSubmitClick = () => {
        addTransaction({
            date: new Date(date).getTime(), 
            amount, type, category, description, motive, mode, 
            entities: entities.map(entity => entity._id), tags: tags.map(tag => tag._id)
        }).then((details) => {
            console.log(details)
            addTransactionModel.details = details;
            setAddTransactionModel({...addTransactionModel});
            showSuccessDialog();
        }).catch((e) => {

        });
    }

    const resetForm = () => {
        setType("expense");
        setDate(new Date().getTime());
        setAmount(0);
        setCategory("");
        setDescription("");
        setCatSearchKey("");
        setEntities([]);
        setEntSearchKey("");
        setTags([]);
        setTagSearchKey("");
        setMode("");
        setModSearchKey("");
        setMotive("need");
        setMoreInfoVisible(false);
    }

    const addNewClick = () => {
        resetForm();
        setSuccessDialogOpen(false);
    }

    const viewTransactionsPress = () => {
        resetForm();
        navigate("/ViewTransactions");
    }

    const showSuccessDialog = () => {
        setSuccessDialogOpen(true);
    }

    const dateFormatter = (d) => {
        const newDate = new Date(d);
        if(isNaN(newDate)) return d;
        return newDate.toISOString().split("T")[0];
    }

    return (
    <main className="AdTr_Container">
    <Dialog title="Success" open={successDialogOpen} content={addTransactionModel.details && SuccessFragment(addTransactionModel.details)} 
    closeDialog={() => setSuccessDialogOpen(false)} 
    footer={<><Button text="Add New" press={addNewClick}/><Button text="View Transactions" press={viewTransactionsPress}/></>}/>
    <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">Add Transaction</span>
    </motion.header>
    <motion.div 
        initial={{ y: -window.innerHeight, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -window.innerHeight, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="AdTr_Questions">
        <div className="AdTr_TypeQuestion">
            <Button text="Expense" type={type === "expense" ? "default" : "simple"}
            press={() => setType("expense")}/>
            <Button text="Income" type={type === "income" ? "default" : "simple"}
            press={() => setType("income")}/>
        </div>
        <div className="AdTr_GroupQuestion">
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Amount:</span>
                <input className="AdTr_Input" type="Number" value={Number(amount)} onChange={(e) => setAmount(e.target.value)}/>
            </div>
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Date:</span>
                <input type="Date" className="AdTr_Input" value={dateFormatter(date)} onChange={(e) => setDate(e.target.value)}/>
            </div>
        </div>
        <ChipQuestion question="Categories" search={e => applyFilterOn(e, "category")} chips={addTransactionModel.categories} filter={catSearchKey} 
        selected={category} onChange={(cat) => onCategoryChange(cat)}/>
    </motion.div>
    <>
    {moreInfoVisible ?
    <>
    <Button text="Hide more info..." type="Minimal" press={() => setMoreInfoVisible(false)}/>
    <motion.div 
        key="More"
        initial={{ y: window.innerHeight, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: window.innerHeight, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="AdTr_ExtraQuestions">
        <div className="AdTr_GeneralQuestion">
            <span className="AdTr_Question">Description:</span>
            <textarea className="AdTr_Input" value={description} onChange={(e) => setDescription(e.target.value)}/>
        </div>
        <div className="AdTr_MotiveQuestion">
            <Button text="Want" type={motive === "want" ? "default" : "simple"}
            press={() => setMotive("want")}/>
            <Button text="Need" type={motive === "need" ? "default" : "simple"}
            press={() => setMotive("need")}/>
            <Button text="Investment" type={motive === "investment" ? "default" : "simple"}
            press={() => setMotive("investment")}/>
        </div>
        <ChipQuestion question="Mode of Transaction" search={e => applyFilterOn(e, "mode")} chips={addTransactionModel.modes} 
        filter={modSearchKey} selected={mode} onChange={(mod) => onModeChange(mod)}/>
        <ChipQuestion question="Entities" search={e => applyFilterOn(e, "entities")} chips={addTransactionModel.entities} 
        filter={entSearchKey} selected={entities} onChange={(ent) => onEntitiesChange(ent)}/>
        <ChipQuestion question="Tags" search={e => applyFilterOn(e, "tags")} chips={addTransactionModel.tags} 
        filter={tagSearchKey} selected={tags} onChange={(tag) => onTagsChange(tag)}/>
    </motion.div>
    </>
    :
    <Button text="Add more info..." type="Default" press={() => setMoreInfoVisible(true)}/>
    }
    </>
    <footer><Button text="Submit" enabled={validated ? "yes" : "no"} press={onSubmitClick}/></footer>
    </main>)
}

export default AddTransaction;