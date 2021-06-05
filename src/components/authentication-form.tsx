import React from "react";
import { Grid, FormControl, TextField, Button, FormControlLabel, Switch } from "@material-ui/core";
const MOBILE_INPUT_ERROR_TEXT = "Enter a valid mobile number!";

const AuthenticationForm = (props: any) => {
    const [mobile, setMobile] = React.useState<number | undefined>();
    const [automateOtp, setAutomateOTP] = React.useState<boolean>(true);
    const [otp, setOTP] = React.useState<number | undefined>();
    const [mobileInputErrorText, setMobileInputErrorText] = React.useState<string>("");

    const handleOTPAutomationPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutomateOTP(event.target.checked as boolean);
    };

    const handleMobileChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setMobile(event.target.value as number);
        const isValidMobile = validateMobile();
        const hasError = mobileInputErrorText !== ""; 
        if(isValidMobile && hasError){
            let errorText = isValidMobile ? "" : MOBILE_INPUT_ERROR_TEXT;
            setMobileInputErrorText(errorText);
        }
    };

    const handleGetOTP = () => {
        const isValidMobile = validateMobile();
        let errorText = isValidMobile ? "" : MOBILE_INPUT_ERROR_TEXT;
        setMobileInputErrorText(errorText);
        if(!isValidMobile){
            return; 
        }
        props.handleGetOTP(mobile);
    };

    const validateMobile = () => (mobile !== undefined && mobile.toString().length < 10);

    const handleOTPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length === 6) {
            props.handleOTPChange(parseInt(event.target.value) as number)
        }
        setOTP(parseInt(event.target.value) as number);
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
                        hidden={props.isAuthenticated}
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
                <FormControl fullWidth variant="filled" className={props.classes.formControl}>
                    <TextField
                        id="mobile-otp"
                        label="OTP"
                        type="number"
                        required
                        disabled={props.isAuthenticated}
                        value={otp || ""}
                        placeholder="******"
                        onChange={handleOTPChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{ maxLength: 6, minLength: 6 }}
                        variant="standard"
                        fullWidth
                        className={props.classes.textField}
                    />
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default AuthenticationForm;