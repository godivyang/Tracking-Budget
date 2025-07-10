import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./UploadTransactions.css";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import ChipsQuestion from "../components/ChipsQuestion";
import AddTransaction from "./AddTransaction";
import { motion } from "framer-motion";
import { Back, Close, Income, Expense, Warning } from "../lib/Icons";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { addTransaction, getLabels } from "../api/trackingBudget";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const TransactionFragment = (details, categories, changeCategory) => {
    return details ? 
    <div className="UpTr_DialogDetails">
        <span>Date: </span><strong>{new Date(details.date).toDateString()}</strong>
        <span>Amount: </span><strong>₹{details.amount}</strong>
        <span>Type: </span><strong>{details.type === "income" ? "Income" : "Expense"}</strong>
        <div style={{gridColumn: "1/3"}}>
            <ChipsQuestion question="Category" chips={categories} chipSelected={details.category}
            onChange={(chip) => changeCategory(chip.description)}/>
        </div>
        {details.description ? <><span>Description: </span><textarea value={details.description}></textarea></> : undefined}
        {details.motive ? <><span>Motive: </span><strong>{details.motive === "want" ? "Want" : details.motive === "need" ? "Need" : "Investment"}</strong></> : undefined}
        {details.mode ? <><span>Mode: </span><strong>{details.mode}</strong></> : undefined}
        {details.entities && details.entities.length ? <><span>Entities: </span><strong>{(details.entities||[]).join(", ")}</strong></> : undefined}
        {details.tags && details.tags.length ? <><span>Tags: </span><strong>{(details.tags||[]).join(", ")}</strong></> : undefined}
    </div>
    :
    undefined
}

const _extractTransactionsFromPDF = (pdf) => {
    pdf.sort((a,b) => b.transform[5] - a.transform[5]);  // sorting words based on their vertical position in pdf
    let res = [];
    const arr = [];
    let prev = 0;
    let headerFound = false;
    for(let entry of pdf) {
        if(!prev) prev = entry.transform[5];
        if(Math.abs(entry.transform[5] - prev) < 6) res.push(entry);  // to deal with certain words not aligned properly
        else {
            res = res.filter(cell => cell.str.trim());  // filtering out all columns that are empty
            if(!headerFound) {
                let flag = false;
                for(let i = 0; i < res.length; i++) {
                    if(res[i].str.includes("Date")) {
                        flag = true;
                        break;
                    }
                }
                if(flag && res.length >= 5 && res.length <= 7) {
                    headerFound = true;
                    res.sort((a,b) => a.transform[4] - b.transform[4]);  // sorting based on their horizontal position in pdf
                    arr.push([...res]);
                }
            } else {
                let flag = false;
                if(res.length == 1 && res[0].str.toLowerCase().includes("statement summary")) {
                    flag = true;
                }
                if(flag) break;
                arr.push([...res]);
            }
            res = [entry];
            prev = entry.transform[5];
        }
    }
    // console.log(arr);
    const table = [];
    if(arr.length == 0) return table;
    const headers = arr[0].map(cell => cell.str.replaceAll("/",""));
    const headerLocations = arr[0].map(cell => cell.transform[4]);
    arr.shift();
    let lastRowIndex = -1;
    headers[1]  = "description"; // It is named as "Narration", we want it as "Description" for our 
    // console.log(headers);
    for(let i = 0; i < arr.length; i++) {
        const row = arr[i];
        if(row.length < 2 && table.length) {
            table[table.length - 1]["description"] += row[0].str;
        } else if(row.length > 2) {
            let rowData = {};
            if(headers.length === 5) {
                const cell = row[3];
                if(cell.str.includes("(Cr)")) {
                    rowData["amount"] = Number(cell.str.split("(Cr)")[0].replaceAll(",","").trim());
                    rowData["type"] = "income";
                } else if(cell.str.includes("(Dr)")) {
                    rowData["amount"] = Number(cell.str.split("(Dr)")[0].replaceAll(",","").trim());
                    rowData["type"] = "expense";
                }
            } else if(headers.length === 7) {
                let cell = row[4];
                if(cell && cell.transform[4] + cell.width < headerLocations[5]) {
                    rowData["amount"] = Number(cell.str.replaceAll(",",""));
                    rowData["type"] = "expense";
                } else if(cell) {
                    rowData["amount"] = Number(cell.str.replaceAll(",",""));
                    rowData["type"] = "income";
                }
            }
            let date = row[0].str;
            if(date.includes("-")) {
                date = date.split("-");
                rowData["date"] = new Date(`${date[1]},${date[0]},${date[2]}`).getTime();
            } else if(date.includes("/")) {
                date = date.split("/");
                rowData["date"] = new Date(`${date[1]},${date[0]},${date[2]}`).getTime();
            }
            rowData["description"] = row[1].str;
            table.push(rowData);
        }
    }
    [].forEach((row, i) => {
        console.log(i, row, table.length)
        if(Math.abs(row.length - headers.length) > 1 && lastRowIndex != -1) {  // considering there can be rows with 1 empty cells
            row.forEach(cell => {
                let minDiff = Infinity, req = 0;
                arr[lastRowIndex].forEach((parentCell, j) => {
                    let loc = parentCell.transform[4];
                    if(Math.abs(cell.transform[4] - loc) < minDiff) {
                        minDiff = Math.round(cell.transform[4] - loc);
                        req = j;
                    }
                });
                arr[lastRowIndex][req].str += cell.str;
            });
        } else {
            let rowData = {};
            if(lastRowIndex != -1) {
                // console.log(arr, lastRowIndex);
                arr[lastRowIndex].forEach((cell, j) => {
                    // console.log(rowData)
                    if(!headerLocations[5] && j == 3) {
                        if(cell.str.includes("(Cr)")) {
                            rowData["amount"] = Number(cell.str.split("(Cr)")[0].replaceAll(",","").trim());
                            rowData["type"] = "income";
                        } else if(cell.str.includes("(Dr)")) {
                            rowData["amount"] = Number(cell.str.split("(Dr)")[0].replaceAll(",","").trim());
                            rowData["type"] = "expense";
                        }
                    } else if(j == 4 && headerLocations[5]) {
                        if(cell.transform[4] + cell.width < headerLocations[5] && cell.str) {
                            rowData["amount"] = cell.str;
                            rowData["type"] = "expense";
                        } else if(cell.str) {
                            rowData[headers[5]] = cell.str;
                            rowData["type"] = "income";
                        }
                    } else if(j == 0 || j == 1) {
                        rowData[headers[j]] = cell.str;
                    }
                });
                table.push(rowData);
            }
            if(Math.abs(row.length - headers.length) <= 1) lastRowIndex = i;
        }
    });
    return table;
}

const UploadTransactions = ({setTitleType, busyIndicator}) => {
    const [fileName, setFileName] = useState("");
    const [fileDropState, setFileDropState] = useState("inactive");
    const [transactions, setTransactions] = useState([]);
    const [copyTransactions, setCopyTransactions] = useState([]);
    const [currentCopyTransaction, setCurrentCopyTransaction] = useState({});
    const [selectedTransactionIndex, setSelectedTransactionIndex] = useState(-1);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    const [validated, setValidated] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setTitleType(2);
    }, []);

    useEffect(() => {
        let flag = false;
        for(let transaction of transactions) {
            if(!transaction.category) {
                flag = true;
                break;
            }
        }
        if(!flag && transactions.length) setValidated(true);
        else setValidated(false);
    }, [transactions]);

    const resetPage = () => {
        setFileName("");
        setTransactions([]);
        setCopyTransactions([]);
        setCurrentCopyTransaction({});
        setSelectedTransactionIndex(-1);
        setDialogOpen(false);
        setValidated(false);
    }

    const _handleFileRead = (file) => {
        if(file.size > 1 * 1024 * 1024) {
            alert("File big!");
        } else if(file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = async () => {
                const typedArray = new Uint8Array(reader.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let extractedTransactions = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    _extractTransactionsFromPDF(textContent.items).forEach(row => extractedTransactions.push(row));
                }

                setTransactions(extractedTransactions);
                let _copyTransactions = JSON.parse(JSON.stringify(extractedTransactions));
                _copyTransactions.map(t => {
                    t.isEdited = false;
                    return t;
                });
                setCopyTransactions(_copyTransactions);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const onUploadFile = (e) => {
        if(e.target.files.length == 0) return;
        setFileName(e.target.files[0].name);
    }

    const handleFileDrop = (e) => {
        e.preventDefault();
        setFileName(e.dataTransfer.files[0].name);
        _handleFileRead(e.dataTransfer.files[0]);
        setFileDropState("inactive");
        // e.target.value = "";
    }

    const handleFileDragEnter = (e) => {
        e.preventDefault();
        setFileDropState("active");
    }

    const handleFileDragLeave = (e) => {
        setFileDropState("inactive");
    }

    const removeFile = () => {
        setFileName("");
        setTransactions([]);
    }

    const onTransactionClick = (index) => {
        setSelectedTransactionIndex(index);
        setCurrentCopyTransaction({...copyTransactions[index]});
        setDialogOpen(true);
    }

    const onNextClick = () => {
        let index = selectedTransactionIndex;
        index += 1;
        if(transactions.length == index) index = 0;
        setSelectedTransactionIndex(index);
        setCurrentCopyTransaction({...copyTransactions[index]});
        // setDialogOpen(false);
        // setDialogOpen(true);
    }

    const onPreviousClick = () => {
        let index = selectedTransactionIndex;
        index -= 1;
        if(index == -1) index = transactions.length - 1;
        setSelectedTransactionIndex(index);
        setCurrentCopyTransaction({...copyTransactions[index]});
    }

    const updateCopyTransactions = (transaction) => {
        const index = selectedTransactionIndex;
        copyTransactions[index] = {...transaction};
        delete transaction.isEdited;
        // console.log(JSON.stringify(transactions[index]), JSON.stringify(transaction))
        copyTransactions[index].isEdited = JSON.stringify(transactions[index]) !== JSON.stringify(transaction);
        setCopyTransactions([...copyTransactions]);
    }

    const saveCopyTransactions = () => {
        // if(confirm("Are you sure you want to save this transaction?")) {
            const index = selectedTransactionIndex;
            delete copyTransactions[index].isEdited;
            // console.log(copyTransactions[index])
            transactions[index] = JSON.parse(JSON.stringify(copyTransactions[index]));
            setTransactions([...transactions]);
            copyTransactions[index].isEdited = false;
            setCopyTransactions([...copyTransactions]);
        // }
    }

    const deleteTransaction = (index) => {
        if(confirm("Are you sure you want to delete Transaction #" + (index+1))) {
            copyTransactions.splice(index, 1);
            transactions.splice(index, 1);
            setCopyTransactions([...copyTransactions]);
            setTransactions([...transactions]);
            setSelectedTransactionIndex(-1);
        }
    }

    const onSubmitAll = () => {
        getLabels("category").then(categories => {
            Promise.all(transactions.forEach((transaction) => {
                const category = categories.find(cat => cat.description == transaction.category);
                transaction.category = category._id;
                addTransaction(transaction);
            })).then(() => {
                console.log("All transactions saved successfully!");
                resetPage();
            });
        });
    }

    return (<>
    {selectedTransactionIndex != -1 &&
    // <Dialog content={TransactionFragment(transactions[selectedTransactionIndex], categories, (description)=>updateCategory(description))} 
    <Dialog 
    content={<AddTransaction 
        editObj={currentCopyTransaction} 
        updateEditObj={updateCopyTransactions}/>}
    open={dialogOpen} 
    closeDialog={() => setDialogOpen(false)} 
    title={`${copyTransactions[selectedTransactionIndex].isEdited ? "*" : ""}Edit Transaction ${selectedTransactionIndex+1}`}
    footer={<><Button text="Previous" press={onPreviousClick}/>
        <span style={{flex: 1}}/>
        {copyTransactions[selectedTransactionIndex].isEdited && <Button text="Save" press={saveCopyTransactions}/>}
        <span style={{flex: 1}}/>
        <Button text="Next" press={onNextClick}/></>}/>}
    <motion.header 
        initial={{ x: -window.innerWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -window.innerWidth, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}>
        <Button press={() => navigate("/")} icon={<Back/>}/>
        <span className="title">Upload Transactions</span>
        <div className="UpTr_AfterFileUpload contentRight">
            {/* {!fileName && <label for="Upload"><Button text="Upload Statement"/></label>} */}
            {fileName && <div className="FileName">
                <span>{fileName}</span>
                <Button icon={<Close/>} press={removeFile}/>
            </div>}
        </div>
    </motion.header>
    <div className="UpTr_Header">
        <input type="File" id="Upload" onChange={onUploadFile} hidden/>
        {!fileName && 
        <label htmlFor="Upload" className={`FileDropArea ${fileDropState === "active" ? "Hovering" : ""}`} 
        onDrop={handleFileDrop} onDragEnter={handleFileDragEnter} onDragLeave={handleFileDragLeave} onDragOver={(e) => e.preventDefault()}>
        {fileDropState === "inactive" ?
            "Click or Drop your bank statement pdf here"
            :
            "Drop here"
        }
        </label>}
    </div>
    {fileName && <>
    <main className="UpTr_Body">
        <div className="UpTr_Transactions">
            {transactions.map((transaction, i) => {
                return (<div key={`transaction_${i}`} 
                    className={`Transaction ${transaction.type === "income" ? "income" : ""} ${transaction.category ? "" : "error"}`} 
                    onClick={() => onTransactionClick(i)}>
                    <span>{`${i+1}${copyTransactions[i].isEdited ? "*" : ""}`}</span>
                    {transaction.type === "income" ? <Income/> : <Expense/>}
                    <div className="subSection">
                        <span className="category">{transaction.category || <Warning/>}</span>
                        <span className="date">{new Date(transaction.date).toDateString()}</span>
                    </div>
                    <span className="amount">₹{transaction.amount}</span>
                    <Button icon={<Close/>} press={() => deleteTransaction(i)}/>
                </div>)
            })}
        </div>
    </main>
    <footer>
        <Button text="Submit All" enabled={validated ? "yes" : "no"} press={onSubmitAll}/>
    </footer>
    </>}
    </>)
};

export default UploadTransactions;