import React, { useState } from "react";
import { Grid, FormControl, TextField, Button, FormControlLabel, Switch } from "@material-ui/core";
const MOBILE_INPUT_ERROR_TEXT = "Enter a valid mobile number!";
const OTP_INPUT_ERROR_TEXT = "Enter a valid OTP!";

const AuthenticationForm = (props: any) => {
    const [mobile, setMobile] = useState<number>();
    const [automateOtp, setAutomateOTP] = useState<boolean>(true);
    const [otp, setOTP] = useState<number | undefined>();
    const [mobileInputErrorText, setMobileInputErrorText] = useState<string>("");
    const [otpInputErrorText, setOtpInputErrorText] = useState<string>("");

    const handleOTPAutomationPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutomateOTP(event.target.checked as boolean);
    };

    const handleMobileChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        let value = event.target.value as number;
        setMobile(value);
        const isValidMobile = validateMobile(value);
        const hasError = mobileInputErrorText !== "";
        if (isValidMobile && hasError) {
            let errorText = isValidMobile ? "" : MOBILE_INPUT_ERROR_TEXT;
            setMobileInputErrorText(errorText);
        }
    };

    const handleGetOTP = () => {
        const isValidMobile = validateMobile(mobile);
        let errorText = isValidMobile ? "" : MOBILE_INPUT_ERROR_TEXT;
        setMobileInputErrorText(errorText);
        if (!isValidMobile) {
            return;
        }
        props.handleGetOTP(mobile, automateOtp);
    };

    const validateMobile = (mobile: number | undefined) => {
        return mobile !== undefined && mobile.toString().length === 10;
    };

    const validateOTP = (otp: number | undefined) => {
        return otp !== undefined && otp.toString().length === 6;
    };

    const handleOTPValidation = () => {
        const isValidOTP = validateOTP(otp);
        let errorText = isValidOTP ? "" : OTP_INPUT_ERROR_TEXT;
        setOtpInputErrorText(errorText);
    };

    const handleOTPChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as number;
        const isValidOTP = validateOTP(value);
        if (isValidOTP) {
            props.handleOTPChange(value)
        }
        setOTP(value);
    };


    return (
        <Grid
            container
            justify="center"
            alignItems="center"
            spacing={0}
            direction="column"
        >
            <Grid item xs={3}>

                <FormControl fullWidth variant="filled" className={props.classes.formControl}>
                    <TextField
                        id="mobile-number"
                        label="Mobile"
                        type="tel"
                        disabled={props.isAuthenticated}
                        required
                        error={mobileInputErrorText !== ""}
                        helperText={mobileInputErrorText}
                        placeholder="99xxxxxxxx"
                        value={mobile || ""}
                        onChange={handleMobileChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            maxLength: 10,
                            minLength: 10,
                            readOnly: props.isAuthenticated
                        }}
                        variant="outlined"
                        fullWidth
                        className={props.classes.textField}
                    />
                </FormControl>
                <FormControl className={props.classes["get-otp-btn"]} fullWidth variant="outlined">
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={props.isAuthenticated}
                        onClick={handleGetOTP}
                    >
                        Get OTP
                </Button>
                </FormControl>
                <FormControl variant="filled">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={automateOtp}
                                onChange={handleOTPAutomationPreferenceChange}
                                name="automateotp"
                                color="primary"
                            />
                        }
                        label="Automate OTP Feed"
                        labelPlacement="start"
                    />
                </FormControl>
                {!automateOtp && validateMobile(mobile) &&
                    <FormControl fullWidth variant="filled" className={props.classes.formControl}>
                        <TextField
                            id="mobile-otp"
                            label="OTP"
                            type="number"
                            required
                            error={otpInputErrorText !== ""}
                            helperText={otpInputErrorText}
                            disabled={props.isAuthenticated}
                            value={otp || ""}
                            placeholder="******"
                            onChange={handleOTPChange}
                            onBlur={handleOTPValidation}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{ 
                                maxLength: 6, 
                                minLength: 6 
                            }}
                            variant="standard"
                            fullWidth
                            className={props.classes.textField}
                        />
                    </FormControl>
                }
            </Grid>
        </Grid>
    );
};

export default AuthenticationForm;