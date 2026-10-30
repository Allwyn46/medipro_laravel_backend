// resources/js/lib/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true, // needed for Sanctum cookie auth
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
});

export default api;
