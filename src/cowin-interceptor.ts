import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const cowinInterceptor = (accessToken: any) => {
    axios.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            const newConfig = config;
            const baseOverrideHeaders = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
                'origin': 'https://selfregistration.cowin.gov.in/',
                'referer': 'https://selfregistration.cowin.gov.in/',
                'Authorization': `Bearer ${accessToken}`
            };
            newConfig.headers = {...newConfig.headers, ...baseOverrideHeaders};
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
            // const originalRequest = error.config;
            // const loginurl = `${environment.serviceEndpoint}/login`;
            // if (hasAnError(error, 401) && originalRequest.url === loginurl) {
            //     return Promise.reject(error);
            // }
            // if (hasAnError(error, 401) && originalRequest.url !== loginurl) {
            //     const res = await axios.post(
            //         loginurl,
            //         environment.credentials
            //     );
            //     if (res.status === 201 || res.status === 200) {
            //         saveSession(res);
            //         axios.defaults.headers.common.accesstoken = `${res.data.sessionId};${res.data.timezoneId}`;
            //         return axios(originalRequest);
            //     }
            // }
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

export default cowinInterceptor;
