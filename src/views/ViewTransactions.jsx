import { useNavigate } from "react-router";
import "./ViewTransactions.css";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { Back, Income, Expense, Close } from "../lib/Icons";
import { getLabels, getTransactions } from "../api/trackingBudget";
import Dialog from "../components/Dialog";
import ChipsQuestion from "../components/ChipsQuestion";

const Filters = {
    Date: {title: "Date",
        key: 1,
        filters: [
            {description: "This month", selected: false, _id: 1, days: new Date().getDate()},
            {description: "Last 30 days", selected: false, _id: 2, days: 30},
            {description: "Last 90 days", selected: false, _id: 3, days: 90},
        ]},
    Amount: {title: "Amount",
        key: 2,
        filters: [
            {description: "Upto ₹200", selected: false, _id: 1, amount: "0-200"},
            {description: "₹200 - ₹500", selected: false, _id: 2, amount: "200-500"},
            {description: "₹500 - ₹2000", selected: false, _id: 3, amount: "500-2000"},
            {description: "Above ₹2000", selected: false, _id: 4, amount: "2000-"},
        ]},
    Type: {title: "Type",
        key: 3,
        filters: [
            {description: "Income", selected: false, _id: 1},
            {description: "Expense", selected: false, _id: 2}
        ]},
    Category: {title: "Category",
        key: 4,
        filters: []},
    Mode: {title: "Mode",
        key: 5,
        filters: []},
    Tags: {title: "Tags",
        key: 6,
        filters: []},
    Entities: {title: "Entities",
        key: 7,
        filters: []},
    Motive: {title: "Motive",
        key: 8,
        filters: [
            {description: "Want", selected: false, _id: 1},
            {description: "Need", selected: false, _id: 2},
            {description: "Investment", selected: false, _id: 3},
        ]}
    };

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

const DetailsFragment = (details) => (
    <div className="ViTr_DialogDetails">
        <span>Date: </span><strong>{new Date(details.date).toDateString()}</strong>
        <span>Amount: </span><strong>₹{details.amount}</strong>
        <span>Type: </span><strong>{details.type === "income" ? "Income" : "Expense"}</strong>
        <span>Category: </span><strong>{details.category}</strong>
        {details.description ? <><span>Description: </span><strong>{details.description}</strong></> : undefined}
        {details.motive ? <><span>Motive: </span><strong>{details.motive === "want" ? "Want" : details.motive === "need" ? "Need" : "Investment"}</strong></> : undefined}
        {details.mode ? <><span>Mode: </span><strong>{details.mode}</strong></> : undefined}
        {details.entities && details.entities.length ? <><span>Entities: </span><strong>{(details.entities||[]).join(", ")}</strong></> : undefined}
        {details.tags && details.tags.length ? <><span>Tags: </span><strong>{(details.tags||[]).join(", ")}</strong></> : undefined}
    </div>);

const ViewTransactions = ({setTitleType, busyIndicator}) => {
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filterSelected, setFilterSelected] = useState(null);
    const [filterModel, setFilterModel] = useState(Filters);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterDialogData, setFilterDialogData] = useState([]);

    const dialog = useRef(null);
    const filterDialog = useRef(null);

    useEffect(() => {
        setTitleType(2);
        busyIndicator(true, "Loading your transactions...");
        Promise.all([getTransactions(), getLabels("category"), getLabels("entity"), getLabels("mode"), getLabels("tag")])
        .then(([transactions, categories, entities, modes, tags]) => {
            setTransactions(transactions);
            Filters.Category.filters = categories;
            Filters.Entities.filters = entities;
            Filters.Mode.filters = modes;
            Filters.Tags.filters = tags;
            setFilterModel({...Filters});
        }).catch((e) => {

        }).then(() => {
            busyIndicator(false);
        });
    }, []);

    const FiltersFragment = () => (
    <ChipsQuestion 
        chips={filterDialogData} 
        multiSelect={["Type","Category","Mode","Tags","Entities","Motive"].includes(filterSelected)} 
        chipSelected={filterDialogData.filter(filter => filter.selected )} 
        onChange={(selected)=>{
            if(!Array.isArray(selected)) selected = [selected];
            const selectedIds = new Set();
            selected.forEach(filter => selectedIds.add(filter._id));
            const newFilters = filterDialogData.map(filter => ({
                ...filter,
                selected: selectedIds.has(filter._id)
            }));
            setFilterDialogData(newFilters);
        }}/>);

    const onTransactionClick = (transaction) => {
        setDetails({...transaction});
        setDetailsDialogOpen(true);
    }

    const getFilteredData = () => {
        let filter = {}, curr;
        curr = filterModel.Date.filters;
        for(let i = 0; i < curr.length; i++) {
            if(curr[i].selected) {
                filter.date = {};
                let time = new Date().getTime();
                filter.date.$lte = time;
                filter.date.$gte = time - (curr[i].days * 24 * 60 * 60 * 1000);
                break;
            }
        }
        curr = filterModel.Amount.filters;
        for(let i = 0; i < curr.length; i++) {
            if(curr[i].selected) {
                filter.amount = {};
                let amount = curr[i].amount.split("-");
                filter.amount.$gte = Number(amount[0]) || 0;
                if(amount[1]) filter.amount.$lte = Number(amount[1]);
                break;
            }
        }
        let temp = ["Category","Mode","Tags","Entities"];
        temp.forEach(label => {
            const filterArray = filterModel[label].filters.filter(filter => filter.selected).map(filter => filter._id);
            if(filterArray.length) filter[label.toLowerCase()] = { $in: filterArray };
        });
        temp = ["Type","Motive"];
        temp.forEach(label => {
            const filterArray = filterModel[label].filters.filter(filter => filter.selected).map(filter => filter.description.toLowerCase());
            if(filterArray.length) filter[label.toLowerCase()] = { $in: filterArray };
        });
        getTransactions(filter).then((transactions) => {
            setTransactions(transactions);
        });
    }
    
    const onFilterChipClick = (title) => {
        setFilterSelected(title);
        setFilterDialogData(JSON.parse(JSON.stringify(filterModel[title].filters)));
        setFilterDialogOpen(true);
    }

    return (
    <>
    <Dialog title="Details" content={details && DetailsFragment(details)} footer={<><Button text="Delete"/><Button text="Edit"/></>} 
        closeDialog={() => setDetailsDialogOpen(false)} open={detailsDialogOpen}/>
    <Dialog 
    title={filterSelected} 
    content={<FiltersFragment 
        filterDialogData={filterDialogData}
        setFilterDialogData={setFilterDialogData}/>} 
    bottom={true}
    footer={<>
        <Button text="Clear" press={() => {
            setFilterDialogData(filterDialogData.map((filter) => ({...filter, selected: false})));
        }}/>
        <Button text="Done" press={() => {
            filterModel[filterSelected].filters = filterDialogData;
            setFilterModel({...filterModel});
            setFilterDialogOpen(false);
            getFilteredData();
        }}/></>} 
    closeDialog={() => setFilterDialogOpen(false)} 
    open={filterDialogOpen} />
    
    <header>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">View Transactions</span>
    </header>
    <div className="ViTr_SubHeader">
        {filterModel && Object.values(filterModel).map(filter => (<div className="ViTr_FilterChip" key={filter.key} 
        onClick={() => onFilterChipClick(filter.title)}>
            {filter.title}</div>))}
    </div>
    <main className="ViTr_Container">
        <div className="ViTr_Expenses">
            {transactions.map((transaction, i) => {
                return (<div key={`transaction_${i}`} className={`ViTr_Expense ${transaction.type === "income" ? "income" : ""}`} 
                onClick={() => onTransactionClick(transaction)}>
                    {transaction.type === "income" ? <Income/> : <Expense/>}
                    <div className="subSection">
                        <span className="category">{transaction.category}</span>
                        <span className="date">{new Date(transaction.date).toDateString()}</span>
                    </div>
                    <span className="amount">₹{transaction.amount}</span>
                </div>)
            })}
        </div>
    </main>
    </>
    )
}

export default ViewTransactions;