import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

const checkIfLogin = async (token) => {
    try {
        const response = await axiosInstance.post("/user/me", { token });
        return response.data;
    } catch (e) {
        throw new Error({"message": e.error});
    }
};

export { checkIfLogin };