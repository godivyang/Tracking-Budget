import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

const checkIfLogin = async () => {
    try {
        const response = await axiosInstance.get("/user/me");
        return response.data;
    } catch (e) {
        
    }
};

export { checkIfLogin };