import { isEmpty } from "./utils.js";

const api = async (
  url: string,
  method: string,
  data: object = {},
  headers: object = { "Content-Type": "application/json" }
) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  try {
    let params: any = {
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
    let result = await response.json();
    if (response.ok) {
      return result;
    } else {
      if (response.status == 401) {
        localStorage.removeItem("user");
        window.location.href = "/bye";
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const get = async (url: string) => api(url, "GET");
export const post = async (
  url: string,
  data: object,
  headers: object = { "Content-Type": "application/json" }
) => api(url, "POST", data, headers);
