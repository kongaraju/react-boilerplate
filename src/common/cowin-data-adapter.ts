import _ from "lodash";

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
};