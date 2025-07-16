import { useEffect, useState } from "react";
import "./ChipsQuestion.css";

const ChipsQuestion = ({question, chips, onChange, chipSelected=[], multiSelect=false}) => {
    const [filter, setFilter] = useState("");
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if(!Array.isArray(chipSelected)) setSelected([{...chipSelected}]);
        else {
            let isEqual = false;
            if(chipSelected.length === selected.length) {
                isEqual = selected.every((chip, i) => chip._id === chipSelected[i]._id);
            }
            if(!isEqual) setSelected(JSON.parse(JSON.stringify(chipSelected)));
        }
    }, [chipSelected]);

    const onChipChange = (chip, index) => {
        if(!multiSelect) {
            setSelected([chip]);
            onChange(chip);
        } else {
            let currentChipIndex = selected.findIndex((_chip) => _chip._id === chip._id);
            if(currentChipIndex === -1) selected.push({...chip});
            else selected.splice(currentChipIndex, 1);
            setSelected([...selected]);
            onChange([...selected]);
        }
    }

    return (
    <div className="ChQu_Chips">
    <span className="InlineSearch">
        <span className="Question">{question}{question ? ":" : undefined}</span>
        <input type="Search" className="Search" onInput={(e) => setFilter(e.target.value.toLowerCase())} placeholder="search"/>
    </span>
    <div className="Chips">
        {chips.filter(chip => chip.description && chip.description.toLowerCase().includes(filter)).length ?
         chips.filter(chip => chip.description && chip.description.toLowerCase().includes(filter)).map((chip, i) => {
            let className = "Chip";
            className += selected.find(_chip => _chip._id == chip._id) ? " selected" : "";
            return (<div className={className} key={chip._id} onClick={()=>onChipChange(chip, i)}>
                {chip.description}
            </div>)
        })
        :
        <div>No Data</div>}
    </div>
    </div>)
}

export default ChipsQuestion;