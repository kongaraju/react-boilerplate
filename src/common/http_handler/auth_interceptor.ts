import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const axiosInterceptor = (environment: any) => {
    axios.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            const newConfig = config;
            newConfig.headers['Content-Type'] = 'application/json';
            newConfig.headers.timeout = 30000;
            const sessionId = localStorage.getItem('sessionId');
            const timezoneId = localStorage.getItem('timezoneId');
            if (sessionId) {
                newConfig.headers.accesstoken = `${sessionId};${timezoneId}`;
            }
            return newConfig;
        },
        (error: AxiosError) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config;
            const loginurl = `${environment.serviceEndpoint}/login`;
            if (hasAnError(error, 401) && originalRequest.url === loginurl) {
                return Promise.reject(error);
            }
            if (hasAnError(error, 401) && originalRequest.url !== loginurl) {
                const res = await axios.post(
                    loginurl,
                    environment.credentials
                );
                if (res.status === 201 || res.status === 200) {
                    saveSession(res);
                    axios.defaults.headers.common.accesstoken = `${res.data.sessionId};${res.data.timezoneId}`;
                    return axios(originalRequest);
                }
            }
            return Promise.reject(error);
        }
    );
};

function hasAnError(error: AxiosError, errcode: number) {
    return error && error.response && error.response.status === errcode;
}

function saveSession(response: AxiosResponse) {
    localStorage.setItem('sessionId', response.data.sessionId);
    localStorage.setItem('timezoneId', response.data.timezoneId);
}

export default axiosInterceptor;
