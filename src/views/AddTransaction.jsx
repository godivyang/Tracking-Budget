import Button from "../components/Button";
import { useNavigate } from "react-router";
import "./AddTransaction.css";
import { useEffect, useState } from "react";
import { Back } from "../lib/Icons";
import { motion } from "framer-motion";
import { addTransaction, getLabels } from "../api/trackingBudget";
import ChipsQuestion from "../components/ChipsQuestion";
import Dialog from "../components/Dialog";

const SuccessFragment = (details) => {
    return (
    <div className="AdTr_DialogDetails">
        <span>Date: </span><strong>{new Date(details.date).toDateString()}</strong>
        <span>Amount: </span><strong>₹{details.amount}</strong>
        <span>Type: </span><strong>{details.type === "income" ? "Income" : "Expense"}</strong>
        <span>Category: </span><strong>{details.category}</strong>
        {details.description ? <><span>Description: </span><strong>{details.description}</strong></> : undefined}
        {details.motive && details.type === "expense" ? <><span>Motive: </span><strong>{details.motive === "want" ? "Want" : details.motive === "need" ? "Need" : "Investment"}</strong></> : undefined}
        {details.mode ? <><span>Mode: </span><strong>{details.mode}</strong></> : undefined}
        {details.entities && details.entities.length ? <><span>Entities: </span><strong>{(details.entities||[]).join(", ")}</strong></> : undefined}
        {details.tags && details.tags.length ? <><span>Tags: </span><strong>{(details.tags||[]).join(", ")}</strong></> : undefined}
    </div>)
};

const AddTransaction = ({setTitleType=()=>{}, editObj, updateEditObj}) => {
    const navigate = useNavigate();
    const [type, setType] = useState("expense");
    const [date, setDate] = useState(new Date().getTime());
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState({});
    const [description, setDescription] = useState("");
    const [entities, setEntities] = useState([]);
    const [tags, setTags] = useState([]);
    const [mode, setMode] = useState({});
    const [motive, setMotive] = useState("need");
    const [moreInfoVisible, setMoreInfoVisible] = useState(false);
    const [addTransactionModel, setAddTransactionModel] = useState({categories: [], entities: [], modes: [], tags: [], details: null});
    const [validated, setValidated] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    useEffect(() => {
        setTitleType(2);
        Promise.all([getLabels("category"), getLabels("entity"), getLabels("mode"), getLabels("tag")])
        .then(([_categories, _entities, _modes, _tags]) => {
            addTransactionModel.categories = _categories;
            addTransactionModel.entities = _entities;
            addTransactionModel.modes = _modes;
            addTransactionModel.tags = _tags;
            setAddTransactionModel({...addTransactionModel});
            if(editObj) {
                if(editObj.type) setType(editObj.type);
                if(editObj.amount) setAmount(editObj.amount);
                if(editObj.date) setDate(editObj.date);
                if(editObj.category) setCategory(_categories.find(cat => cat.description === editObj.category));
                if(editObj.mode) setMode(_modes.find(mod => mod.description === editObj.mode));
                if(editObj.motive) setMotive(editObj.motive);
                if(editObj.description) setDescription(editObj.description);
                if(editObj.entities) {
                    const entSet = new Set(editObj.entities);
                    setEntities(_entities.filter(ent => entSet.has(ent.description)));
                }
                if(editObj.tags) {
                    const tagSet = new Set(editObj.tags);
                    setTags(_tags.filter(tag => tagSet.has(tag.description)));
                }
            }
        });
    }, []);

    useEffect(() => {
        if(date && amount > 0 && category) {
            setValidated(true);
        } else setValidated(false);
    }, [date, amount, category]);

    useEffect(() => {
        if(!editObj) return;
        if(editObj.type) setType(editObj.type);
        else setType("expense");
        if(editObj.amount) setAmount(editObj.amount);
        else setAmount(0);
        if(editObj.date) setDate(editObj.date);
        else setDate(new Date().getTime());
        if(editObj.category) setCategory(addTransactionModel.categories.find(cat => cat.description === editObj.category));
        else setCategory({});
        if(editObj.mode) setMode(addTransactionModel.modes.find(mod => mod.description === editObj.mode));
        else setMode({});
        if(editObj.motive) setMotive(editObj.motive);
        else setMotive("need");
        if(editObj.description) setDescription(editObj.description);
        else setDescription("");
        if(editObj.entities) {
            const entSet = new Set(editObj.entities);
            setEntities(addTransactionModel.entities.filter(ent => entSet.has(ent.description)));
        } else setEntities([]);
        if(editObj.tags) {
            const tagSet = new Set(editObj.tags);
            setTags(addTransactionModel.tags.filter(tag => tagSet.has(tag.description)));
        } else setTags([]);
    }, [editObj]);

    const onSubmitClick = () => {
        console.log({
            date: new Date(date).getTime(), 
            amount, type, description, motive, 
            mode: mode._id, category: category._id, 
            entities: entities.map(entity => entity._id), tags: tags.map(tag => tag._id)
        })
        addTransaction({
            date: new Date(date).getTime(), 
            amount, type, description, motive, 
            mode: mode._id, category: category._id, 
            entities: entities.map(entity => entity._id), tags: tags.map(tag => tag._id)
        }).then((details) => {
            resetForm();
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
        setCategory({});
        setDescription("");
        // setCatSearchKey("");
        setEntities([]);
        // setEntSearchKey("");
        setTags([]);
        // setTagSearchKey("");
        setMode({});
        // setModSearchKey("");
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
        // return newDate.toISOString().split("T")[0];
        let fullYear = newDate.getFullYear(), month = newDate.getMonth() + 1, date = newDate.getDate();
        if(month < 10) month = "0" + month;
        if(date < 10) date = "0" + date;
        return `${fullYear}-${month}-${date}`;
    }

    const updateCategory = (chip) => {
        setCategory(chip);
        if(editObj) {
            editObj.category = chip.description;
            updateEditObj({...editObj});
        }
    }

    const updateDescription = (e) => {
        const value = e.target.value;
        setDescription(value);
        if(editObj) {
            editObj.description = value;
            updateEditObj({...editObj});
        }
    }

    const updateAmount = (e) => {
        const value = Number(e.target.value);
        setAmount(value);
        if(editObj) {
            editObj.amount = value;
            updateEditObj({...editObj});
        }
    }

    const updateDate = (e) => {
        const value = dateFormatter(e.target.value);
        setDate(value);
        if(editObj) {
            editObj.date = value;
            updateEditObj({...editObj});
        }
    }

    const updateType = (value) => {
        setType(value);
        if(editObj) {
            editObj.type = value;
            updateEditObj({...editObj});
        }
    }

    const updateMotive = (value) => {
        setMotive(value);
        if(editObj) {
            editObj.motive = value;
            updateEditObj({...editObj});
        }
    }

    const updateMode = (chip) => {
        setMode(chip);
        if(editObj) {
            editObj.mode = chip.description;
            updateEditObj({...editObj});
        }
    }

    const updateTags = (chips) => {
        setTags([...chips]);
        if(editObj) {
            if(chips.length) editObj.tags = chips.map(chip => chip.description);
            else delete editObj.tags;
            console.log(editObj)
            updateEditObj({...editObj});
        }
    }

    const updateEntities = (chips) => {
        setEntities([...chips]);
        if(editObj) {
            if(chips.length) editObj.entities = chips.map(chip => chip.description);
            else delete editObj.entities;
            updateEditObj({...editObj});
        }
    }

    return (
    <main className="AdTr_Container">
    <Dialog title="Success" open={successDialogOpen} content={addTransactionModel.details && SuccessFragment(addTransactionModel.details)} 
    closeDialog={() => setSuccessDialogOpen(false)} 
    footer={<><Button text="Add New" press={addNewClick}/><Button text="View Transactions" press={viewTransactionsPress}/></>}/>
    {!editObj && <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">Add Transaction</span>
    </motion.header>}
    <motion.div 
        initial={!editObj && { y: -window.innerHeight, opacity: 0 }}
        animate={!editObj && { y: 0, opacity: 1 }}
        exit={!editObj && { y: -window.innerHeight, opacity: 0 }}
        transition={!editObj && { type: "spring", duration: 0.4 }}
        className="AdTr_Questions">
        <div className="AdTr_TypeQuestion">
            <Button text="Expense" type={type === "expense" ? "default" : "simple"}
            press={() => updateType("expense")}/>
            <Button text="Income" type={type === "income" ? "default" : "simple"}
            press={() => updateType("income")}/>
        </div>
        <div className="AdTr_GroupQuestion">
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Amount:</span>
                <input className="AdTr_Input" type="Number" value={Number(amount)} onChange={updateAmount}/>
            </div>
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Date:</span>
                <input type="Date" className="AdTr_Input" value={dateFormatter(date)} onChange={updateDate}/>
            </div>
        </div>
        <ChipsQuestion question="Categories" chips={addTransactionModel.categories} chipSelected={category} onChange={updateCategory}/>
        {/* <ChipsQuestion question="Categories" search={e => applyFilterOn(e, "category")} chips={addTransactionModel.categories} filter={catSearchKey} 
        selected={category} onChange={(cat) => onCategoryChange(cat)}/> */}
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
            <textarea className="AdTr_Input" value={description} onChange={updateDescription}/>
        </div>
        {type === "expense" &&
        <div className="AdTr_MotiveQuestion">
            <Button text="Want" type={motive === "want" ? "default" : "simple"}
            press={() => updateMotive("want")}/>
            <Button text="Need" type={motive === "need" ? "default" : "simple"}
            press={() => updateMotive("need")}/>
            <Button text="Investment" type={motive === "investment" ? "default" : "simple"}
            press={() => updateMotive("investment")}/>
        </div>}
        <ChipsQuestion question="Mode of Transaction" chips={addTransactionModel.modes} chipSelected={mode} onChange={updateMode}/>
        <ChipsQuestion question="Entities" chips={addTransactionModel.entities} chipSelected={entities} onChange={updateEntities} multiSelect={true}/>
        <ChipsQuestion question="Tags" chips={addTransactionModel.tags} chipSelected={tags} onChange={updateTags} multiSelect={true}/>
    </motion.div>
    </>
    :
    <Button text="Add more info..." type="Default" press={() => setMoreInfoVisible(true)}/>
    }
    </>
    {!editObj && <footer><Button text="Submit" enabled={validated ? "yes" : "no"} press={onSubmitClick}/></footer>}
    </main>)
}

export default AddTransaction;