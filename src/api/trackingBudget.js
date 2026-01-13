import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

// const wait = (time=1000, res) => {
//     setTimeout(async () => res(), time);
// }

export const wakeUltimateUtility = async () => {
    await axiosInstance.get("/user/wakeUltUtl");
}

const checkIfLogin = async (code) => {
    // return new Promise((res, rej) => wait(3500, res)).then(async () => {
    try {
        const response = await axiosInstance.post("/user/me", { code });
        return response.data.data;
    } catch (e) {
        // alert(e.toString())
        throw new Error(e.response.data.details.message);
    }
    // });
};

// ____________________________________________
// creating label (category, entity, mode, tag)
// ____________________________________________
let _labels = {};
export const addLabel = async (label, description) => {
    delete _labels[label];
    try {
        const response = await axiosInstance.post(`/${label}`, { description });
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// ____________________________________________
// reading labels (category, entity, mode, tag)
// ____________________________________________
export const getLabels = (label) => {
    if(_labels[label]) return _labels[label];
    try {
        _labels[label] = axiosInstance.get(`/${label}`);
    } catch (e) {
        delete _labels[label];
        throw new Error(e);
    }
    return _labels[label];
}

// ____________________________________________
// deleting label (category, entity, mode, tag)
// ____________________________________________
export const deleteLabel = async (label, _id) => {
    delete _labels[label];
    try {
        const response = await axiosInstance.delete(`/${label}/${_id}`);
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// ____________________________________________
// updating label (category, entity, mode, tag)
// ____________________________________________
export const updateLabel = async (label, _id, description) => {
    delete _labels[label];
    try {
        const response = await axiosInstance.patch(`/${label}/${_id}`, { description });
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// ____________________
// creating transaction
// ____________________
export const addTransaction = async (transaction) => {
    try {
        const response = await axiosInstance.post(`/transaction`, transaction);
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// ____________________
// reading transactions
// ____________________
export const getTransactions = async (filter={}) => {
    try {
        const response = await axiosInstance.post(`/transaction/filter`, filter);
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// __________________________________________________
// deleting transaction (category, entity, mode, tag)
// __________________________________________________
export const deleteTransaction = async (_id) => {
    try {
        const response = await axiosInstance.delete(`/transaction/${_id}`);
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

// __________________________________________________
// updating transaction (category, entity, mode, tag)
// __________________________________________________
export const updateTransaction = async (_id, transaction) => {
    try {
        const response = await axiosInstance.patch(`/transaction/${_id}`, transaction);
        return response.data;
    } catch (e) {
        throw new Error(e);
    }
}

export { checkIfLogin };