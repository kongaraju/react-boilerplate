import _ from "lodash";
import { format, addDays, parse } from 'date-fns';
export default class CowinDataAdapter {
    getFilteredSlots(centers: any) {
        let availableSlots: any = [];
        let doseNum = 1;
        let minAgeBooking = 45;
        let minimumSlots = 1;
        let feeTypes = ["Paid", "Free"];

        _.forEach(centers, (center: any) => {
            _.forEach(center.sessions, (session: any) => {
                // Cowin uses slot number for display post login, but checks available_capacity before booking appointment is allowed
                let availableCapacity = Math.min(
                    session[`available_capacity_dose${doseNum}`],
                    session["available_capacity"]
                );
                if (
                    availableCapacity >= minimumSlots &&
                    session["min_age_limit"] <= minAgeBooking &&
                    feeTypes.indexOf(center["fee_type"]) > -1
                ) {
                    let slot = {
                        name: center["name"],
                        district: center["district_name"],
                        pincode: center["pincode"],
                        center_id: center["center_id"],
                        vaccine: session["vaccine"],
                        fee_type: center["fee_type"],
                        available: availableCapacity,
                        date: session["date"],
                        slots: session["slots"],
                        session_id: session["session_id"],
                        id: session["session_id"],
                    };
                    availableSlots.push(slot);
                }
            });
        });
        return availableSlots;
    }
    refineBeneficiaries(beneficiaries: any) {
        return beneficiaries.map((beneficiary: any) => {
            let vaccinated = false;
            let tmp;
            beneficiary["age"] = new Date().getFullYear() - beneficiary["birth_year"];

            if (beneficiary["vaccination_status"] === "Partially Vaccinated") {
                vaccinated = true;
                let days_remaining: number = this.vaccine_dose2_duedate(beneficiary["vaccine"]);


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

    vaccine_dose2_duedate(vaccine_type: string): number {

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
    stripOTPFromText(text: string): string {
        let OTP = text;
        OTP = OTP.replace("Your OTP to register/access CoWIN is ", "");
        OTP = OTP.replace(". It will be valid for 3 minutes. - CoWIN", "");
        return OTP;
    }
};