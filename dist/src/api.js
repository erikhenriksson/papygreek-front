import { isEmpty } from "./utils.js";
const api = async (url, method, data = {}, headers = { "Content-Type": "application/json" }, parse = "json") => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    try {
        let params = {
            headers: headers,
            mode: "cors",
            method: method,
            signal: window.signal,
        };
        if (!isEmpty(data)) {
            params["body"] = JSON.stringify(data);
        }
        if (!isEmpty(user)) {
            params["headers"]["Authorization"] = `Bearer ${user.token}`;
        }
        const response = await fetch(cnf.api + url, params);
        if (parse == "json") {
            let result = await response.json();
            if (response.ok) {
                return result;
            }
            else {
                if (response.status == 401) {
                    localStorage.removeItem("user");
                    window.location.href = "/bye";
                }
            }
        }
        else if (parse == "blob") {
            return await response.blob();
        }
    }
    catch (err) {
        console.log(err);
    }
};
export const get = async (url) => api(url, "GET");
export const getFile = async (url) => api(url, "GET", {}, { "Content-Type": "application/json" }, "blob");
export const post = async (url, data, headers = { "Content-Type": "application/json" }) => api(url, "POST", data, headers);
