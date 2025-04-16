import Button from "./Button";
import { useNavigate } from "react-router";
import "./AddTransaction.css";
import { useEffect, useState } from "react";
import { Back } from "./Icons";

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
            {chips.filter(chip => chip.name.includes(filter)).length ?
            chips.filter(chip => chip.name.includes(filter)).map(chip => {
                let className = "AdTr_Chip";
                if(typeof selected !== "object") className += chip.key === selected ? " selected" : "";
                else className += selected.findIndex(sel => sel.key === chip.key) !== -1 ? " selected" : "";
                return (<div className={className} key={chip.key}
                        onClick={() => onChange(chip.key)}>{chip.name}</div>)
            })
            :
            <div>No Data</div>}
        </div>
    </div>
    )
};

const AddTransaction = ({setTitleType}) => {
    const navigate = useNavigate();
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("");
    const [catSearchKey, setCatSearchKey] = useState("");
    const [entity, setEntity] = useState([]);
    const [entSearchKey, setEntSearchKey] = useState("");
    const [tag, setTag] = useState([]);
    const [tagSearchKey, setTagSearchKey] = useState("");
    const [mode, setMode] = useState("");
    const [modSearchKey, setModSearchKey] = useState("");
    const [motive, setMotive] = useState("need");
    const [moreInfoVisible, setMoreInfoVisible] = useState(false);

    useEffect(() => {
        setTitleType(2);
    }, []);
    
    const onCategoryChange = (newCategory) => {
        const newCat = Categories.find(cat => cat.key == newCategory);
        if(newCat.key !== category) setCategory(newCat.key);
    }

    const onModeChange = (newMode) => {
        const newMod = Modes.find(mod => mod.key === newMode);
        if(newMod.key !== mode) setMode(newMod.key);
    }

    const onEntityChange = (newEntity) => {
        const newEnt = Entities.find(ent => ent.key === newEntity);
        const exists = entity.findIndex(ent => ent.key === newEntity);
        if(exists !== -1) entity.splice(exists, 1);
        else entity.push(newEnt);
        setEntity([...entity]);
    }

    const onTagChange = (newTag) => {
        const newTa = Tags.find(tag => tag.key === newTag);
        const exists = tag.findIndex(tag => tag.key === newTag);
        if(exists !== -1) tag.splice(exists, 1);
        else tag.push(newTa);
        setTag([...tag]);
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

    return (
    <main className="AdTr_Container">
    <header>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">Add Transaction</span>
    </header>
    <div className="AdTr_Questions">
        <div className="AdTr_TypeQuestion">
            <Button text="Expense" type={type === "expense" ? "default" : "simple"}
            press={() => setType("expense")}/>
            <Button text="Income" type={type === "income" ? "default" : "simple"}
            press={() => setType("income")}/>
        </div>
        <div className="AdTr_GroupQuestion">
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Amount:</span>
                <input className="AdTr_Input" type="Number"/>
            </div>
            <div className="AdTr_GeneralQuestion">
                <span className="AdTr_Question">Date:</span>
                <input type="Date" className="AdTr_Input"/>
            </div>
        </div>
        <ChipQuestion question="Categories" search={e => applyFilterOn(e, "category")} chips={Categories} filter={catSearchKey} 
        selected={category} onChange={(cat) => onCategoryChange(cat)}/>
    </div>
    <>
    {moreInfoVisible ?
    <>
    <Button text="Hide more info..." type="Minimal" press={() => setMoreInfoVisible(false)}/>
    <div className="AdTr_ExtraQuestions">
        <div className="AdTr_GeneralQuestion">
            <span className="AdTr_Question">Description:</span>
            <textarea className="AdTr_Input"/>
        </div>
        <div className="AdTr_MotiveQuestion">
            <Button text="Want" type={motive === "want" ? "default" : "simple"}
            press={() => setMotive("want")}/>
            <Button text="Need" type={motive === "need" ? "default" : "simple"}
            press={() => setMotive("need")}/>
            <Button text="Investment" type={motive === "investment" ? "default" : "simple"}
            press={() => setMotive("investment")}/>
        </div>
        <ChipQuestion question="Mode of Transaction" search={e => applyFilterOn(e, "mode")} chips={Modes} filter={modSearchKey} 
        selected={mode} onChange={(mod) => onModeChange(mod)}/>
        <ChipQuestion question="Entities" search={e => applyFilterOn(e, "entities")} chips={Entities} filter={entSearchKey} 
        selected={entity} onChange={(ent) => onEntityChange(ent)}/>
        <ChipQuestion question="Tags" search={e => applyFilterOn(e, "tags")} chips={Tags} filter={tagSearchKey} 
        selected={tag} onChange={(tag) => onTagChange(tag)}/>
    </div>
    </>
    :
    <Button text="Add more info..." type="Default" press={() => setMoreInfoVisible(true)}/>
    }
    </>
    <footer><Button text="Submit" enabled="no"/></footer>
    </main>
    )
}

export default AddTransaction;