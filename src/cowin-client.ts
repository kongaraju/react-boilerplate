import AjaxRequestHandler from './common/http_handler/ajaxrequest_handler';
import cowinInterceptor from './cowin-interceptor';
import { format, addDays } from 'date-fns';
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

            // let dose1_date=format(new Date(beneficiary["dose1_date"]), 'dd MMM');
            beneficiary["dose2_due_date"] = format(addDays(new Date(beneficiary["dose1_date"]), days_remaining), 'dd MMM yy');
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
    }
    setConfig(config: any) {
        this.config = config;
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
    validateOTP(otp: string) {
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
                cowinInterceptor(this.accessToken);
                // return Promise.resolve();
            });
    }
    getBeneficiaries() {
        return this.cowinAjaxClient.post('auth/validateMobileOtp')
            .then((response: any) => {
                return refineBeneficiaries(response.data['beneficiaries']);
            });
    }
}

export default CowinClient;