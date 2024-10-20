import axios from "axios";
import queryClient from "./queryClient";
import { navigate } from "../lib/navigation";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

// create a separate client for refreshing the access token
// to avoid infinite loops with the error interceptor
const RefreshTokenClient = axios.create(options);
RefreshTokenClient.interceptors.response.use((response) => response.data);

const API = axios.create(options);

API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};

    // try to refresh the token if it's expired
    if (status === 401) {
      try {
        await RefreshTokenClient.post("/user/refresh-token");
        // retry the original request
        return RefreshTokenClient(config);
      } catch (error) {
        // if refresh token is also expired, redirect to login
        // this will clear the cookie and reset the state
        queryClient.clear();
        navigate("/login", {
          state: { redirectUrl: window.location.pathname },
        });
      }
    }

    return Promise.reject({ status, ...data });
  }
);

export default API;
