import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

axios.create({
    baseURL: "https://ult-userAuth.onrender.com",
    withCredentials: true
}).get("/user/me")
    .then((user) => console.log("user", user))
    .catch((e) => console.log("no cookie"));

const checkIfLogin = async () => {
    try {
        const response = await axiosInstance.get("/user/me");
        return response.data;
    } catch (e) {
        throw new Error({"message": e.error});
    }
};

export { checkIfLogin };