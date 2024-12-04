// src/axiosInstance.js
import axios from 'axios';
//import React, { useContext } from 'react';
//import {AuthContext} from './src/components/Authentication/authContext';
import {getCookie, setCookie} from './src/components/Authentication/getCookie'

const axiosInstance = axios.create({
    baseURL: 'https://ebjv-api.olongapobataanzambalesads.com/api',
});

let isRefreshing = false;
let refreshUser = []

const onRefresh = (accessToken) => {
  refreshUser.forEach((callback) => callback(accessToken));
  refreshUser = [];
}

const addUser = (callback) => {
    refreshUser.push(callback);
}

// Request interceptor to include the token in every request
axiosInstance.interceptors.request.use((config) => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use((response) => response, 
     async (error) => {
    const originalRequest = error.config;

    //const { logout, showSessionExpiredPopup } = useContext(AuthContext);
    if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = getCookie('refreshToken');

       if (!isRefreshing) {
            isRefreshing = true;
            
        try {
            const response = await axiosInstance.post('/refresh', {refreshToken} );
            const { accessToken } = response.data;

            setCookie('accessToken', accessToken);

            onRefresh(accessToken);
            isRefreshing = false;
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            showSessionExpiredPopup();// Log out on refresh token failure
            return Promise.reject(refreshError);
        }
    }
    return new Promise((resolve) => {
      addUser((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
      });
  });
}
return Promise.reject(error);
});

export default axiosInstance;
