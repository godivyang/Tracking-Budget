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

const _extractTransactionsFromPDF = (pdf, headerLocations=[]) => {
    pdf.sort((a,b) => b.transform[5] - a.transform[5]);  // sorting words based on their vertical position in pdf
    let headerFound = false;
    if(headerLocations.length) {
        pdf = pdf.filter(item => item.transform[5] <= (headerLocations[0].transform[5] + 6));
        headerFound = true;
    }
    let row = [];
    const arr = [];
    let prev = 0;
    for(let entry of pdf) {
        if(!prev) prev = entry.transform[5];
        if(Math.abs(entry.transform[5] - prev) < 6) { // to deal with certain words not aligned properly
            let flag = 0, remove;
            if(row.length) {
                for(let r of row) {
                    if(r.transform[4] - entry.transform[4] - entry.width < 6 && r.transform[4] - entry.transform[4] - entry.width > 4) {
                        entry.str += r.str;
                        flag = 1;
                        remove = r;
                        break;
                    } else if(entry.transform[4] - r.transform[4] - r.width < 6 && entry.transform[4] - r.transform[4] - r.width > 4) {
                        r.str += entry.str;
                        flag = 2;
                        break;
                    }
                }
            }
            if(flag === 0) row.push(entry);
            else if(flag === 1) {
                row.push(entry);
                row = row.filter(r => r.str != remove.str);
            }
        } else {
            row = row.filter(cell => cell.str.trim());  // filtering out all columns that are empty
            if(!headerFound) {
                let flag = 0;
                for(let i = 0; i < row.length; i++) {
                    if(row[i].str.includes("Date") || row[i].str.includes("Narration")) {
                        flag++;
                        if(flag === 2) break;
                    }
                }
                if(flag === 2 && row.length >= 5 && row.length <= 7) {
                    headerFound = true;
                    row.sort((a,b) => a.transform[4] - b.transform[4]);  // sorting based on their horizontal position in pdf
                    headerLocations = [...row];
                }
            } else {
                let flag = false;
                if(row.length == 1 && (row[0].str.toLowerCase().includes("statement summary") || row[0].str.toLowerCase().includes("hdfc bank limited"))) {
                    flag = true;
                }
                if(flag) break;
                arr.push([...row]);
            }
            row = [entry];
            prev = entry.transform[5];
        }
    }
    // console.log(arr);
    const table = [];
    if(arr.length == 0) return { table, headerLocations };
    headerLocations[1].str  = "description"; // It is named as "Narration", we want it as "Description" for our 
    // console.log(headers);
    for(let i = 0; i < arr.length; i++) {
        const row = arr[i];
        if(row.length < 2 && table.length) {
            table[table.length - 1]["description"] += row[0].str;
        } else if(row.length > 2) {
            let rowData = {};
            if(headerLocations.length === 5) {
                const cell = row[3];
                if(cell.str.includes("(Cr)")) {
                    rowData["amount"] = Number(cell.str.split("(Cr)")[0].replaceAll(",","").trim());
                    rowData["type"] = "income";
                } else if(cell.str.includes("(Dr)")) {
                    rowData["amount"] = Number(cell.str.split("(Dr)")[0].replaceAll(",","").trim());
                    rowData["type"] = "expense";
                }
            } else if(headerLocations.length === 7) {
                let cell = row[4];
                if(cell && cell.transform[4] + cell.width < headerLocations[5].transform[4]) {
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
    return {table, headerLocations};
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
                let extractedTransactions = [], headerLocations = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageData = _extractTransactionsFromPDF(textContent.items, headerLocations);
                    pageData.table.forEach(row => extractedTransactions.push(row));
                    headerLocations = pageData.headerLocations;
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
        _handleFileRead(e.target.files[0]);
        e.target.value = "";
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