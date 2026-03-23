/**
 * Headers Library
 */
import axios, { AxiosRequestConfig } from "axios";


/**
 * TODO: Use parameterized configurations.
 */

const getAuthorizationHeader = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem("authorization");
        if (token) {
            return `${token}`;
        }
    }
    return "";
}

const getConfig = () => {
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorizationHeader(),
        },
    };
};

export const get = async (endpoint = "", payload = "") => {
    try {
        let req;
        const config: AxiosRequestConfig = getConfig();
        if (payload) {
            config["params"] = payload;
            req = await axios.get(endpoint, config);
        } else {
            req = await axios.get(endpoint, config);
        }
        return req.data;
    } catch (error) {
        throw error;
    }
};

export const post = async (
    endpoint = "",
    payload = "",
    multipart = false,
    download = false
) => {
    try {
        let req;
        const config: AxiosRequestConfig = getConfig();
        if (download) {
            config["responseType"] = "blob";
        }
        if (multipart) {
            if (!config.headers) config.headers = {};
            config.headers["Content-Type"] = "multipart/form-data";
            req = await axios.post(endpoint, payload, config);
        } else {
            console.log(config);
            
            req = await axios.post(endpoint, payload, config);
        }
        return req.data;
    } catch (error) {
        throw error;
    }
};

export const put = async (endpoint = "", payload = "", multipart = false) => {
    try {
        const config: AxiosRequestConfig = getConfig();
        let req;
        if (multipart) {
            if (!config.headers) config.headers = {};
            config.headers["Content-Type"] = "multipart/form-data";
            req = await axios.put(endpoint, payload, config);
        } else {
            req = await axios.put(endpoint, payload, config);
        }
        return req.data;
    } catch (error) {
        throw error;
    }
};

export const patch = async (endpoint = "", payload = "", multipart = false) => {
    try {
        const config: AxiosRequestConfig = getConfig();
        let req;
        if (multipart) {
            if (!config.headers) config.headers = {};
            config.headers["Content-Type"] = "multipart/form-data";
            req = await axios.patch(endpoint, payload, config);
        } else {
            req = await axios.patch(endpoint, payload, config);
        }
        return req.data;
    } catch (error) {
        throw error;
    }
};

export const del = async (endpoint = "", payload = "") => {
    try {
        const config: AxiosRequestConfig = getConfig();
        if (payload) {
            config["params"] = payload;
        }
        return await axios.delete(endpoint, config);
    } catch (error) {
        throw error;
    }
};
