import Button from "./Button";
import { useNavigate } from "react-router";
import "./AddTransaction.css";
import { useEffect, useState } from "react";
import { Back } from "./Icons";

const categories = [
    {name: "category 1", key: "cat1"}, 
    {name: "category 2", key: "cat2"}, 
    {name: "category 3", key: "cat3"},
    {name: "category 4", key: "cat4"}, 
    {name: "category 5", key: "cat5"}, 
    {name: "category 6", key: "cat6"}, 
    {name: "category 2", key: "cat7"}, 
    {name: "category 3", key: "cat8"},
    {name: "category 4", key: "cat9"}, 
    {name: "category 5", key: "cat10"}, 
    {name: "category 6", key: "cat11"}, 
    {name: "category 2", key: "cat12"}, 
    {name: "category 3", key: "cat13"},
    {name: "category 4", key: "cat14"}, 
    {name: "category 5", key: "cat15"}, 
    {name: "category 6", key: "cat16"}];

const entities = [
    {name: "entity 1", key: "ent1"}, 
    {name: "entity 2", key: "ent2"}, 
    {name: "entity 3", key: "ent3"},
    {name: "entity 4", key: "ent4"}, 
    {name: "entity 5", key: "ent5"}, 
    {name: "entity 6", key: "ent6"}, 
    {name: "entity 2", key: "ent7"}, 
    {name: "entity 3", key: "ent8"},
    {name: "entity 4", key: "ent9"}, 
    {name: "entity 5", key: "ent10"}, 
    {name: "entity 6", key: "ent11"}, 
    {name: "entity 2", key: "ent12"}, 
    {name: "entity 3", key: "ent13"},
    {name: "entity 4", key: "ent14"}, 
    {name: "entity 5", key: "ent15"}, 
    {name: "entity 6", key: "ent16"}];

const tags = [
    {name: "tag 1", key: "tag1"}, 
    {name: "tag 2", key: "tag2"}, 
    {name: "tag 3", key: "tag3"},
    {name: "tag 4", key: "tag4"}, 
    {name: "tag 5", key: "tag5"}, 
    {name: "tag 6", key: "tag6"}, 
    {name: "tag 2", key: "tag7"}, 
    {name: "tag 3", key: "tag8"},
    {name: "tag 4", key: "tag9"}, 
    {name: "tag 5", key: "tag10"}, 
    {name: "tag 6", key: "tag11"}, 
    {name: "tag 2", key: "tag12"}, 
    {name: "tag 3", key: "tag13"},
    {name: "tag 4", key: "tag14"}, 
    {name: "tag 5", key: "tag15"}, 
    {name: "tag 6", key: "tag16"}];

const modes = [
    {name: "mode of transaction 1", key: "mod1"}, 
    {name: "mode 2", key: "mod2"}, 
    {name: "mode 3", key: "mod3"},
    {name: "mode 4", key: "mod4"}];

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
                if(typeof selected === "string") className += chip.key === selected ? " selected" : "";
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
        const newCat = categories.find(cat => cat.key === newCategory);
        if(newCat.key !== category) setCategory(newCat.key);
    }

    const onModeChange = (newMode) => {
        const newMod = modes.find(mod => mod.key === newMode);
        if(newMod.key !== mode) setMode(newMod.key);
    }

    const onEntityChange = (newEntity) => {
        const newEnt = entities.find(ent => ent.key === newEntity);
        const exists = entity.findIndex(ent => ent.key === newEntity);
        if(exists !== -1) entity.splice(exists, 1);
        else entity.push(newEnt);
        setEntity([...entity]);
    }

    const onTagChange = (newTag) => {
        const newTa = tags.find(tag => tag.key === newTag);
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
        <ChipQuestion question="Categories" search={e => applyFilterOn(e, "category")} chips={categories} filter={catSearchKey} 
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
        <ChipQuestion question="Mode of Transaction" search={e => applyFilterOn(e, "mode")} chips={modes} filter={modSearchKey} 
        selected={mode} onChange={(mod) => onModeChange(mod)}/>
        <ChipQuestion question="Entities" search={e => applyFilterOn(e, "entities")} chips={entities} filter={entSearchKey} 
        selected={entity} onChange={(ent) => onEntityChange(ent)}/>
        <ChipQuestion question="Tags" search={e => applyFilterOn(e, "tags")} chips={tags} filter={tagSearchKey} 
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