import { useNavigate } from "react-router";
import "./ViewTransactions.css";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { Back, Income, Expense, Close } from "./Icons";

const Expenses = [
    {dat:new Date(),amo:100,typ:"i",cat:"1",des:"long description",mot:"w",mod:"1",ent:["1","2"],tag:["1","2"],key:"1"},
    {dat:new Date(),amo:500,typ:"e",cat:"5",des:"long description 2",mot:"n",mod:"5",ent:["5","4"],tag:["3","4"],key:"2"},
    {dat:new Date(),amo:900,typ:"e",cat:"2",des:"",mot:"",mod:"",ent:[],tag:[],key:"3"},
    {dat:new Date(),amo:10,typ:"i",cat:"7",des:"",mot:"",mod:"",ent:[],tag:[],key:"4"},
    {dat:new Date(),amo:100,typ:"i",cat:"1",des:"long description",mot:"w",mod:"1",ent:["1","2"],tag:["1","2"],key:"5"},
    {dat:new Date(),amo:500,typ:"e",cat:"5",des:"long description 2",mot:"n",mod:"4",ent:["5","4"],tag:["3","4"],key:"6"},
    {dat:new Date(),amo:900,typ:"e",cat:"2",des:"",mot:"",mod:"",ent:[],tag:[],key:"7"},
    {dat:new Date(),amo:10,typ:"i",cat:"7",des:"",mot:"",mod:"",ent:[],tag:[],key:"8"},
    {dat:new Date(),amo:100,typ:"i",cat:"1",des:"long description",mot:"w",mod:"1",ent:["1","2"],tag:["1","2"],key:"9"},
    {dat:new Date(),amo:500,typ:"e",cat:"5",des:"long description 2",mot:"n",mod:"3",ent:["5","4"],tag:["3","4"],key:"10"},
    {dat:new Date(),amo:900,typ:"e",cat:"2",des:"",mot:"",mod:"",ent:[],tag:[],key:"11"},
    {dat:new Date(),amo:10,typ:"i",cat:"7",des:"",mot:"",mod:"",ent:[],tag:[],key:"12"}
];

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

const ViewTransactions = ({setTitleType}) => {
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [filters, setFilters] = useState(null);
    const [filterSelected, setFilterSelected] = useState(0);

    const dialog = useRef(null);
    const filterDialog = useRef(null);

    useEffect(() => {
        setTitleType(2);
        setFilters([
            {title: "Date",
            key: 1,
            filters: [
                {name: "This month", selected: false, key: 1},
                {name: "Last 30 days", selected: false, key: 2},
                {name: "Last 90 days", selected: false, key: 3},
            ]},
            {title: "Amount",
            key: 2,
            filters: [
                {name: "Upto ₹200", selected: false, key: 1},
                {name: "₹200 - ₹500", selected: false, key: 2},
                {name: "₹500 - ₹2000", selected: false, key: 3},
                {name: "Above ₹2000", selected: false, key: 3},
            ]},
            {title: "Type",
            key: 3,
            filters: [
                {name: "Income", selected: false, key: 1},
                {name: "Expense", selected: false, key: 2}
            ]},
            {title: "Category",
            key: 4,
            filters: Categories.map(cat => {
                cat.selected = false;
                return cat;
            })},
            {title: "Mode",
            key: 5,
            filters: Modes.map(mod => {
                mod.selected = false;
                return mod;
            })},
            {title: "Tags",
            key: 6,
            filters: Tags.map(tag => {
                tag.selected = false;
                return tag;
            })},
            {title: "Entities",
            key: 7,
            filters: Entities.map(ent => {
                ent.selected = false;
                return ent;
            })},
            {title: "Motive",
            key: 8,
            filters: [
                {name: "Want", selected: false, key: 1},
                {name: "Need", selected: false, key: 2},
                {name: "Investment", selected: false, key: 3},
            ]}
        ]);
    }, []);

    const onExpenseClick = (expense) => {
        setDetails({...expense});
        dialog.current.showModal();
    }

    const onCloseDialog = () => {
        dialog.current.close();
    }

    const onCloseFilterDialog = () => {
        filterDialog.current.close();
    }
    
    const onFilterChipClick = (key) => {
        setFilterSelected(key);
        filterDialog.current.showModal();
    }

    return (
    <>
    <>
        <dialog ref={dialog}>
            <div className="ViTr_DialogHeader">
                <span>Details</span>
                <Button icon={<Close/>} press={onCloseDialog} type="minimal"/>
            </div>
            {details && (
            <div className="ViTr_DialogDetails">
                <span>Date: </span><strong>{details.dat.toDateString()}</strong>
                <span>Amount: </span><strong>₹{details.amo}</strong>
                <span>Type: </span><strong>{details.typ === "i" ? "Income" : "Expense"}</strong>
                <span>Category: </span><strong>{Categories.find(cat => cat.key == details.cat).name}</strong>
                <span>Description: </span><strong>{details.des}</strong>
                <span>Motive: </span><strong>{details.mot === "w" ? "Want" : details.mot === "n" ? "Need" : "Investment"}</strong>
                <span>Mode: </span><strong>{details.mod ? Modes.find(m => m.key == details.mod).name : ""}</strong>
                <span>Entities: </span><strong>{details.ent.map(ent => ent ? Entities.find(e => e.key == ent).name : "").join(", ")}</strong>
                <span>Tags: </span><strong>{details.tag.map(tag => tag ? Tags.find(t => t.key == tag).name : "").join(", ")}</strong>
            </div>)}
            <div className="ViTr_DialogFooter">
                <Button text="Delete"/>
                <Button text="Edit"/>
            </div>
        </dialog>
        {filters && 
        <dialog ref={filterDialog} className="bottom">
            <div className="ViTr_DialogHeader">
                <span>{filterSelected && filters.find(f => f.key === filterSelected).title}</span>
                <Button icon={<Close/>} press={onCloseFilterDialog} type="minimal"/>
            </div>
            <div className="ViTr_FilterDialogContent">
            {filterSelected && filters.find(f => f.key === filterSelected).filters.map(f => 
            <div className="ViTr_FilterChip" key={f.key}>{f.name}</div>)}
            </div>
            <div className="ViTr_DialogFooter">
                <Button text="Clear"/>
                <Button text="Done"/>
            </div>
        </dialog>}
    </>
    <header>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">View Transactions</span>
    </header>
    <div className="ViTr_SubHeader">
        {filters && filters.map(filter => (<div className="ViTr_FilterChip" key={filter.key} onClick={() => onFilterChipClick(filter.key)}>
            {filter.title}</div>))}
    </div>
    <main className="ViTr_Container">
        <div className="ViTr_Expenses">
            {Expenses.map(exp => {
                return (<div key={exp.key} className={`ViTr_Expense ${exp.typ === "i" ? "income" : ""}`} onClick={() => onExpenseClick(exp)}>
                    {exp.typ === "i" ? <Income/> : <Expense/>}
                    <div className="subSection">
                        <span className="category">{Categories.find(cat => cat.key == exp.cat).name}</span>
                        <span className="date">{exp.dat.toDateString()}</span>
                    </div>
                    <span className="amount">₹{exp.amo}</span>
                </div>)
            })}
        </div>
    </main>
    </>
    )
}

export default ViewTransactions;