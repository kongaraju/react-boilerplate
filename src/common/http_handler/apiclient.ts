import AjaxRequestHandler from './ajaxrequest_handler';
import axiosInterceptor from './auth_interceptor';

let client: AjaxRequestHandler;
const APM_BASE_API = 'http://<SERVER ORIGIN>/api';
const moduleExtention = 'teams';

const getEnvironmentInfo = (): any => {
    
    const serviceEndpoint: string = process.env.API_SERVICE_URL
        ? process.env.API_SERVICE_URL
        : `${APM_BASE_API}`;
    return {
        serviceEndpoint
    };
};

const setServer = (): string => {
    const env: string = process.env.NODE_ENV
        ? process.env.NODE_ENV
        : 'development';
    let serviceEndpoint: string = window.location.origin
        ? window.location.origin
        : `${window.location.protocol}//${window.location.host}`;
    let environment: any;
    let credentials = {user:'', password: ''};
    //For localhost client requests
    if (env === 'development' || serviceEndpoint.includes(`localhost`)) {
        environment = getEnvironmentInfo();
        serviceEndpoint = environment.serviceEndpoint;
    } else {
        // For hosted environment requests
        serviceEndpoint += `/api`;
    } 
    axiosInterceptor({credentials, serviceEndpoint});
    return `${serviceEndpoint}/${moduleExtention}`;
};

const apiclient = () => {
    const serviceEndpoint: string = setServer();
    if (client) {
        return client;
    }
    client = new AjaxRequestHandler(serviceEndpoint);
    return client;
};

export default apiclient;
