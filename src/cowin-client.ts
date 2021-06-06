import AjaxRequestHandler from './common/http_handler/ajaxrequest_handler';
import cowinInterceptor from './cowin-interceptor';
import CowingDataAdapter from './common/cowin-data-adapter';

import jwtDecode, { JwtPayload } from "jwt-decode";
import {intervalToDuration, formatRelative } from 'date-fns';

var forge = require('node-forge');
let client: AjaxRequestHandler;
const baseCowinAPIUrl = 'https://cdn-api.co-vin.in/api/v2/';
const baseKvdbAPIUrl = 'https://r8mmtri5kh.execute-api.us-west-2.amazonaws.com/items/'; //'https://kvdb.io/HKC2ypxKZn9UfSuvRDaEDw/';

export const cowinAjaxClient = () => {
    const serviceEndpoint: string = baseCowinAPIUrl;
    if (client) {
        return client;
    }
    client = new AjaxRequestHandler(serviceEndpoint);
    return client;
};

export const kvdbAjaxClient = () => {
    const serviceEndpoint: string = baseKvdbAPIUrl;
    const client = new AjaxRequestHandler(serviceEndpoint);
    return client;
};
class CowinClient {
    cowinAjaxClient: AjaxRequestHandler;
    kvdbAjaxClient: AjaxRequestHandler;
    cowinDataAdapter: CowingDataAdapter;
    config: any;
    otpTxnId: any;
    accessToken: any;
    constructor(config: any) {
        this.config = config;
        this.cowinAjaxClient = cowinAjaxClient();
        this.kvdbAjaxClient = kvdbAjaxClient();
        this.cowinDataAdapter = new CowingDataAdapter();
        cowinInterceptor();
    }
    setConfig(config: any) {
        this.config = {...this.config, ...config};
        localStorage.setItem('cowinConfig', JSON.stringify(this.config));
    }
    isAuthenticated(): boolean{
        const token = localStorage.getItem("accessToken");
        if(!token){
            return false;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        console.log(decoded);
        if(!decoded.exp){
            return false;
        }

        const duration:Duration = intervalToDuration({
            start: new Date(), 
            end: new Date(decoded.exp * 1000)
        });
        return !!duration.minutes || !!duration.seconds;
    }
    sendOTP() {
        const data = {
            "mobile": this.config.mobile,
            "secret": "U2FsdGVkX183gVkBeZTA5ipKYnQsMj7a0oyZ3lG9tDTEhUP8o+tmEdxRFxVUddzPLTLRn4iDm9nFmNQy46QcRQ==",
        };

        return this.cowinAjaxClient.post('auth/generateMobileOTP', data)
            .then((response: any) => {
                this.otpTxnId = response.data['txnId'];
                console.log(response);
            });
    }
    clearKvdbBucket(){
        return this.kvdbAjaxClient.put(this.config.mobile, "");
    }
    getKvdbOTP(){
        return this.kvdbAjaxClient.get(this.config.mobile)
        .then(response=>response.data as string);
    }
    validateOTP(otp: number) {
        var md = forge.md.sha256.create();
        md.update(otp);
        const data = {
            "otp": md.digest().toHex(),
            "txnId": this.otpTxnId
        };
        return this.cowinAjaxClient.post('auth/validateMobileOtp', data)
            .then((response: any) => {
                console.log("validate OTP Response");
                console.log(response);
                this.accessToken = response.data['token'];
                localStorage.setItem("accessToken", this.accessToken);
                return Promise.resolve();
            });
    }
    getBeneficiaries() {
        return this.cowinAjaxClient.get('appointment/beneficiaries')
            .then((response: any) => {
                return response.data['beneficiaries'];
            });
    }
    getStates(){
        return this.cowinAjaxClient.get('admin/location/states')
        .then((response: any)=>{
            return response.data["states"];
        });
    }
    getDistricts(stateId: string){
        return this.cowinAjaxClient.get(`admin/location/districts/${stateId}`)
        .then((response: any)=>{
            return response.data['districts'];
        });
    }
    getCentersByDistrict(districtId: number, date: any){
        return this.cowinAjaxClient.get(`appointment/sessions/calendarByDistrict?district_id=${districtId}&date=${date}`)
        .then((response: any)=> response.data["centers"]);
    }
    getCaptcha(){
        return this.cowinAjaxClient.post('auth/getRecaptcha')
        .then((response: any)=> response.data["captcha"]);
    }
    bookAppointment(details: any){
        return this.cowinAjaxClient.post('appointment/schedule', details)
        .then((response: any)=> response.data["captcha"]);
    }
}

export default CowinClient;