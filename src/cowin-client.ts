import AjaxRequestHandler from './common/http_handler/ajaxrequest_handler';
import cowinInterceptor from './cowin-interceptor';
import { format, addDays, parse } from 'date-fns';
var forge = require('node-forge');
let client: AjaxRequestHandler;
const baseCowinAPIUrl = 'https://cdn-api.co-vin.in/api/v2/';
const baseKvdbAPIUrl = 'https://kvdb.io/ASth4wnvVDPkg2bdjsiqMN/';

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

const refineBeneficiaries = (beneficiaries: any) => {
    return beneficiaries.map((beneficiary: any) => {
        let vaccinated = false;
        let tmp;
        beneficiary["age"] = new Date().getFullYear() - beneficiary["birth_year"];

        if (beneficiary["vaccination_status"] === "Partially Vaccinated") {
            vaccinated = true;
            let days_remaining: number = vaccine_dose2_duedate(beneficiary["vaccine"]);

            
            beneficiary["dose2_due_date"] = format(addDays(parse(beneficiary["dose1_date"], "dd-MM-yyyy", new Date()), days_remaining), 'dd MMM yy');
            beneficiary["dose1_date"] = format(parse(beneficiary["dose1_date"], "dd-MM-yyyy", new Date()), 'dd MMM');
        }

        tmp = {
            "id": beneficiary["beneficiary_reference_id"],
            "name": beneficiary["name"],
            "vaccine": beneficiary["vaccine"],
            "age": beneficiary["age"],
            "status": beneficiary["vaccination_status"],
            "dose1_date": beneficiary["dose1_date"],
            "due_date": ""
        };
        if (vaccinated) {
            tmp["due_date"] = beneficiary["dose2_due_date"];
        }
        return tmp;
    });
}

const vaccine_dose2_duedate = (vaccine_type: string): number => {

    const covishield_due_date = 84
    const covaxin_due_date = 28
    const sputnikV_due_date = 21

    if (vaccine_type === "COVISHIELD")
        return covishield_due_date;
    else if (vaccine_type === "COVAXIN")
        return covaxin_due_date;
    else if (vaccine_type === "SPUTNIK V")
        return sputnikV_due_date;
    else
        return 0;
}

class CowinClient {
    cowinAjaxClient: AjaxRequestHandler;
    config: any;
    otpTxnId: any;
    accessToken: any;
    constructor(config: any) {
        this.config = config;
        this.cowinAjaxClient = cowinAjaxClient();
        cowinInterceptor();
    }
    setConfig(config: any) {
        this.config = {...this.config, ...config};
        localStorage.setItem('cowinConfig', JSON.stringify(this.config));
    }
    isAuthenticated(): boolean{
        return !!localStorage.getItem("accessToken");
    }
    sendOTP() {
        const data = {
            "mobile": this.config.mobile,
            "secret": "U2FsdGVkX183gVkBeZTA5ipKYnQsMj7a0oyZ3lG9tDTEhUP8o+tmEdxRFxVUddzPLTLRn4iDm9nFmNQy46QcRQ==",
        };

        this.cowinAjaxClient.post('auth/generateMobileOTP', data)
            .then((response: any) => {
                this.otpTxnId = response.data['txnId'];
                console.log(response);
            });
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
                return refineBeneficiaries(response.data['beneficiaries']);
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