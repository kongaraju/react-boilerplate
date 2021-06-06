import "./App.scss";
import React, { useState } from "react";
import _ from "lodash";

import { AuthenticationForm, BeneficiariesTable, PincodesInput } from "./components";
import CowinDataAdapter from "./common/cowin-data-adapter";

import {
  createStyles,
  makeStyles,
  Theme,
  fade,
} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import SaveIcon from "@material-ui/icons/Save";
import { Settings } from '@material-ui/icons';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  Switch,
  Select,
  MenuItem,
  Input,
  InputBase,
  InputLabel,
  RadioGroup,
  Radio,
  FormGroup,
  FormLabel,
  FormControlLabel,
  FormControl,
  LinearProgress,
  CircularProgress,
  Chip,
  Paper,
  Snackbar
} from "@material-ui/core";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

import DateFnsUtils from "@date-io/date-fns";
import { format } from "date-fns";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import CowinClient from "./cowin-client";

import { Beneficiary, Preferences, District, State } from './common/interfaces';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    "mobile-otp-block": {
      maxWidth: "300px",
      padding: "10px"
    },
    "get-otp-btn": {
      // margin: "0px 5px"
    },
    formControl: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    textField: {},
    table: {},
    pincodesRoot: {
      padding: "2px 4px",
      width: 400,
    },
    pincodeInput: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    chips: {
      display: "flex",
      flexWrap: "wrap",
    },
    chip: {
      margin: 2,
    },
    tableRow: {
      "&$selected, &$selected:hover": {
        backgroundColor: fade(theme.palette.primary.light, 0.08),
      },
    },
    tableCell: {
      "$selected &": {
        // color: theme.palette.primary.contrastText
      },
    },
    selected: {},
    centersUpdate: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      justifyItems: "center",
    },
  })
);

const slotsColumns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "district", headerName: "District", flex: 1 },
  { field: "pincode", headerName: "Pincode" },
  { field: "date", headerName: "Date" },
  { field: "vaccine", headerName: "Vaccine" },
  { field: "fee_type", headerName: "Fee", width: 80 },
  { field: "available", headerName: "Available", width: 70 },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const getTomorrow = () => {
  var date: Date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

const validatePreferences = (prefs: Preferences): boolean => {
  return prefs.selectedDistricts !== undefined && prefs.selectedDistricts!.length > 0
    && prefs.selectedDate !== undefined
    && prefs.vaccinePreference !== undefined
    && prefs.paymentPreference !== undefined && prefs.paymentPreference!.length > 0
    && prefs.selectedBeneficiaries !== undefined && prefs.selectedBeneficiaries!.length > 0;
};

const cowinClient: CowinClient = new CowinClient({});
const cowinDataAdapter: CowinDataAdapter = new CowinDataAdapter();

function App() {
  const localStorageConfig = localStorage.getItem("cowinConfig");
  const preferences: Preferences = localStorageConfig
    ? JSON.parse(localStorageConfig as string)
    : {};
  let shouldPollSearchQueries: boolean = false;

  const classes = useStyles();
  // const theme = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    cowinClient.isAuthenticated()
  );
  const [isConfigured, setIsConfigured] = useState<boolean>(validatePreferences(preferences));

  const [frequency, setFrequency] = useState<number>(10);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<
    string[]
  >(preferences.selectedBeneficiaries || []);
  const [searchPreference, setSearchPreference] = useState<string>(
    "stateanddistrict"
  );
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState(
    preferences.selectedState || ""
  );
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>(
    preferences.selectedDistricts || []
  );

  const [vaccinePreference, setVaccinePreference] = useState<string>(
    "nopreference"
  );
  const [paymentPreference, setPaymentPreference] = useState<string[]>([
    "Free",
    "Paid",
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | number>(
    getTomorrow()
  );
  const [automateCaptcha, setAutomateCaptcha] = useState<boolean>(true);
  const [availableCenters, setAvaiableCenters] = useState([]);
  const [countDown, setCountDown] = useState<number>(0);
  const [countDownPercent, setCountDownPercent] = useState<number>(0);
  const [availableSlots, setAvaiableSlots] = useState([]);
  const [captcha, setCaptcha] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<any>("success");

  const showStatusUpdate = (msg: string, severity: string = "success") => {
    setAlertSeverity(severity)
    setOpenSnackbar(true);
    setStatusMessage(msg);

  }

  const handleCaptchaValueChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCaptchaValue(event.target.value as string);
  };



  const handleGetOTP = (mobile: number, automateOtp: boolean) => {
    if (cowinClient.isAuthenticated()) {
      return;
    }
    cowinClient.setConfig({
      mobile,
      automateOtp
    });
    if (!automateOtp) {
      sendOTP();
    } else {
      cowinClient.clearKvdbBucket()
        .then(sendOTP)
        .then(pollForOTP);
    }
  };

  const sendOTP = () => {
    return cowinClient.sendOTP()
      .then(() => showStatusUpdate("OTP sent to mobile successfully"));
  }

  const pollForOTP = () => {
    const interval = setInterval(() => {
      showStatusUpdate("Waiting for OTP...", "info")
      cowinClient.getKvdbOTP()
        .then((response: any) => {
          let text = "";
          if (response && response.Item && response.Item.text) {
            text = response.Item.text;
          }
          if (!text.length) {
            return;
          }
          clearInterval(interval);
          const otp = cowinDataAdapter.stripOTPFromText(text);
          handleOTPChange(otp);

        });
    }, 5 * 1000)
  };

  const handleCaptchaAutomationPreferenceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAutomateCaptcha(event.target.checked as boolean);
  };

  const handleOTPChange = (otp: number) => {

    cowinClient
      .validateOTP(otp)
      .then(() => {
        setIsAuthenticated(cowinClient.isAuthenticated());
        showStatusUpdate("Authenticated Successfully!");
        getBeneficiaries();
      });
  };

  const getBeneficiaries = () => {
    return cowinClient.getBeneficiaries()
      .then((beneficiaries) => cowinDataAdapter.refineBeneficiaries(beneficiaries))
      .then(loadBeneficiaries);
  };

  const loadBeneficiaries = (beneficiariesList: any) => {
    setBeneficiaries(beneficiariesList);
    return cowinClient.getStates().then(loadStates);
  };

  const loadStates = (states: State[]): any | State[] | Promise<District[]> => {
    setStates(states);
    if (selectedState) {
      return getDistricts(selectedState);
    }
    return states;
  };
  const handleStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedState(event.target.value as string);
    setSelectedDistricts([]);
    setDistricts([]);
    getDistricts(event.target.value as string);
  };

  const getDistricts = (stateId: string): Promise<District[]> => {
    return cowinClient.getDistricts(stateId).then(loadDistricts);
  };

  const loadDistricts = (districts: District[]): District[] => {
    setDistricts(districts);
    return districts;
  };
  const handleDistrictChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSelectedDistricts(event.target.value as number[]);
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };

  const handleVaccinePreferenceChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setVaccinePreference(event.target.value as string);
  };

  const isFeeTypeChecked = (type: string) =>
    paymentPreference.indexOf(type) !== -1;

  const handlePaymentPreferenceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const isChecked = event.target.checked;
    const selectedIndex = paymentPreference.indexOf(value);
    let newSelected: string[] = [];

    if (isChecked && selectedIndex === -1) {
      newSelected = newSelected.concat(paymentPreference, value);
    } else if (!isChecked && selectedIndex !== -1) {
      newSelected = newSelected.concat(_.pull(paymentPreference, value));
    } else {
      newSelected = paymentPreference;
    }

    setPaymentPreference(newSelected);
  };

  const handleFreqChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFrequency(event.target.value as number);
  };


  const handleSearchOption = (
    event: React.MouseEvent<HTMLElement>,
    newSearchOption: string
  ) => {
    setSearchPreference(newSearchOption);
  };

  const handleSavePreferences = () => {

    cowinClient.setConfig(getPreferences());
    setIsConfigured(validatePreferences(getPreferences()));
    shouldPollSearchQueries = true;
    getBeneficiaries()
      .then(pollSearchQueries);

  };

  const getCentersByDistrict = () => {
    if (!selectedDistricts.length || !selectedDate) {
      return;
    }
    return cowinClient
      .getCentersByDistrict(
        selectedDistricts[0],
        format(selectedDate, "dd-MM-yyyy")
      )
      .then((centers: any) => {
        setAvaiableCenters(centers);
        const tmpAvailableSlots = cowinDataAdapter.getFilteredSlots(centers);
        setAvaiableSlots(tmpAvailableSlots);
        if (tmpAvailableSlots.length) {
          shouldPollSearchQueries = false;
          tryAutoBook();
        }
      })
      .catch(() => {
        shouldPollSearchQueries = false;
      });
  };

  const pollSearchQueries = () => {
    if (!selectedDistricts.length || !selectedDate) {
      return;
    }
    getCentersByDistrict();
    let counter = 0;
    while (counter <= frequency) {
      // eslint-disable-next-line no-loop-func
      ((timer: any) => {
        setTimeout(() => {
          updateTimeProgress(timer);
          if (timer === frequency && shouldPollSearchQueries)
            pollSearchQueries();
        }, timer * 1000);
      })(counter);
      counter++;
    }
  };

  const tryAutoBook = () => {
    if (!selectedBeneficiaries.length) {
      return;
    }

    getCaptcha();
  };

  const getCaptcha = () => {
    return cowinClient.getCaptcha().then(loadCaptcha);
  };

  const loadCaptcha = (captcha: any) => {
    setCaptcha(captcha);
  };

  const handleBookAppointment = () => {
    //HAVE TO USE REDUCE TO TRY IN ALL CENTERS
    // _.forEach(availableSlots, (option: any) => {
    const option: any = availableSlots[0];
    const selectedSlot = _.shuffle(option.slots)[_.random(option.slots.length)];
    let doseNum =
      (_.find(beneficiaries, ["id", selectedBeneficiaries[0]]) as any)[
        "status"
      ] === "Partially Vaccinated"
        ? 2
        : 1;
    const new_req = {
      beneficiaries: [selectedBeneficiaries[0]],
      dose: doseNum,
      center_id: option["center_id"],
      session_id: option["session_id"],
      slot: selectedSlot,
      captcha: captchaValue,
    };

    // });
  };

  const updateTimeProgress = (tmpFreq: any) => {
    setCountDown(frequency - tmpFreq);
    console.log(toPercent(frequency, frequency - tmpFreq));
    setCountDownPercent(toPercent(frequency, frequency - tmpFreq));
  };

  const toPercent = (total: number, num: number) => {
    return (100 / total) * num;
  };

  const getDistrictNameById = (id: number) => {
    return (_.find(districts, ["district_id", id]) || {})["district_name"];
  };

  const onSlotRowSelected = () => { };
  const handleConfigureVisibility = () => { };


  const handleStartPolling = () => {
    cowinClient.setConfig(getPreferences());
    shouldPollSearchQueries = true;
    getBeneficiaries()
      .then(pollSearchQueries)
      .catch(() => {
        setIsAuthenticated(cowinClient.isAuthenticated());
      });
  };

  const getPreferences = (): Preferences => {
    return {
      selectedBeneficiaries,
      selectedState,
      selectedDistricts,
      selectedDate,
      vaccinePreference,
      paymentPreference,
    };
  };

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <AppBar position="static">
        <Toolbar variant="dense">
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" className={classes.title}>
            Photos
          </Typography>
          {isAuthenticated && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleConfigureVisibility}
                color="inherit"
              >
                <Settings />
              </IconButton>
            </div>)
          }
        </Toolbar>
      </AppBar>

      <section>
        {isAuthenticated && (<LinearProgress />)}
        <Snackbar open={openSnackbar} autoHideDuration={5000}>
          <Alert severity={alertSeverity}>
            {statusMessage}
          </Alert>
        </Snackbar>
        <Grid container>
          <Grid item xs={12} className="authentication-block">
            <AuthenticationForm classes={classes} isAuthenticated={isAuthenticated} handleGetOTP={handleGetOTP} handleOTPChange={handleOTPChange} />
          </Grid>
          {isAuthenticated && (
            <React.Fragment>
              {!isConfigured && (
                <Grid item xs={12} className="configuration-block">
                  <Grid container>
                    <Grid item xs={12}>
                      <BeneficiariesTable classes={classes} beneficiaries={beneficiaries} setSelectedBeneficiaries={setSelectedBeneficiaries} />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        justify="center"
                        className="search-criteria-block"
                      >
                        <Grid item xs={12} className="search-preference-block">
                          <Grid container justify="center">
                            <ToggleButtonGroup
                              value={searchPreference}
                              exclusive
                              onChange={handleSearchOption}
                              aria-label="text alignment"
                            >
                              <ToggleButton
                                value="pincode"
                                aria-label="Pincodes"
                              >
                                Pincodes
                              </ToggleButton>
                              <ToggleButton
                                value="stateanddistrict"
                                aria-label="State and District"
                              >
                                State & Districts
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} className="search-controls-block">
                          <Grid container justify="center">
                            {searchPreference !== "stateanddistrict" ? (
                              <Grid item className="seach-by-pincodes">
                                <PincodesInput classes={classes} />
                              </Grid>
                            ) : (
                              <Grid item className="search-by-state-district">
                                <FormControl
                                  variant="outlined"
                                  className={classes.formControl}
                                >
                                  <InputLabel id="state-selection-label">
                                    State
                                  </InputLabel>
                                  <Select
                                    labelId="state-selection-label"
                                    id="state-selection"
                                    value={states.length ? selectedState : ""}
                                    onChange={handleStateChange}
                                    label="State"
                                    fullWidth
                                  >
                                    {states.map((stateItem: State) => (
                                      <MenuItem
                                        key={stateItem.state_name}
                                        value={stateItem.state_id}
                                      >
                                        {stateItem.state_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <FormControl className={classes.formControl}>
                                  <InputLabel id="districts-chip-label">
                                    District
                                  </InputLabel>
                                  <Select
                                    labelId="districts-chip-label"
                                    id="district-chip"
                                    multiple
                                    fullWidth
                                    value={
                                      districts.length ? selectedDistricts : []
                                    }
                                    onChange={handleDistrictChange}
                                    input={<Input id="district-chip" />}
                                    renderValue={(selected) => (
                                      <div className={classes.chips}>
                                        {(selected as number[]).map((value) => (
                                          <Chip
                                            key={value}
                                            label={getDistrictNameById(value)}
                                            className={classes.chip}
                                          />
                                        ))}
                                      </div>
                                    )}
                                    MenuProps={MenuProps}
                                  >
                                    {districts.map((districtItem: District) => (
                                      <MenuItem
                                        key={districtItem.district_id}
                                        value={districtItem.district_id}
                                      >
                                        {districtItem.district_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        justify="space-evenly"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Grid item>
                          <div className="vaccine-preference-block">
                            <FormControl component="fieldset">
                              <FormLabel component="legend">Vaccine</FormLabel>
                              <RadioGroup
                                aria-label="vaccine"
                                name="vaccinePref"
                                value={vaccinePreference}
                                onChange={handleVaccinePreferenceChange}
                              >
                                <FormControlLabel
                                  value="nopreference"
                                  control={<Radio color="primary" />}
                                  label="Any"
                                />
                                <FormControlLabel
                                  value="covishield"
                                  control={<Radio />}
                                  label="Covishield"
                                />
                                <FormControlLabel
                                  value="covaxin"
                                  control={<Radio />}
                                  label="Covaxin"
                                />
                                <FormControlLabel
                                  value="sputnikv"
                                  control={<Radio />}
                                  label="Sputnik V"
                                />
                              </RadioGroup>
                            </FormControl>
                          </div>
                        </Grid>
                        <Grid item>
                          <div className="payment-preference-block">
                            <FormControl
                              component="fieldset"
                              className={classes.formControl}
                            >
                              <FormLabel component="legend">Fee</FormLabel>
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      color="primary"
                                      checked={isFeeTypeChecked("Free")}
                                      value="Free"
                                      onChange={handlePaymentPreferenceChange}
                                      name="Free"
                                    />
                                  }
                                  label="Free"
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      color="primary"
                                      checked={isFeeTypeChecked("Paid")}
                                      value="Paid"
                                      onChange={handlePaymentPreferenceChange}
                                      name="Paid"
                                    />
                                  }
                                  label="Paid"
                                />
                              </FormGroup>
                            </FormControl>
                          </div>
                        </Grid>
                        <Grid item>
                          <div className="date-preference-block">
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                margin="normal"
                                id="date-picker-dialog"
                                label="Date"
                                format="MM/dd/yyyy"
                                value={selectedDate}
                                onChange={handleDateChange}
                                KeyboardButtonProps={{
                                  "aria-label": "Select Date",
                                }}
                              />
                            </MuiPickersUtilsProvider>
                          </div>
                          <div className="captcha-control-block">
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={automateCaptcha}
                                  onChange={
                                    handleCaptchaAutomationPreferenceChange
                                  }
                                  name="automatecaptcha"
                                  color="primary"
                                />
                              }
                              label="Auto Fill Captcha"
                              labelPlacement="start"
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        justify="space-between"
                        className="controls-block"
                      >
                        <Button>Reset to Defaults</Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          disabled={!validatePreferences(getPreferences())}
                          startIcon={<SaveIcon />}
                          onClick={handleSavePreferences}
                        >
                          Save Preferences
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {isConfigured && (
                <Grid item xs={12} className="booking-block">
                  <Grid container>
                    <Grid item xs={12}>
                      <Grid
                        container
                        justify="space-between"
                        alignItems="center"
                        className="progress-block"
                      >
                        <Grid item>
                          <FormControl
                            variant="filled"
                            className={classes.formControl}
                          >
                            <TextField
                              id="filled-number"
                              label="Frequency"
                              type="number"
                              value={frequency}
                              onChange={handleFreqChange}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              variant="outlined"
                              color="secondary"
                              className={classes.textField}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item className={classes.centersUpdate}>
                          <Box position="relative" display="inline-flex">
                            <CircularProgress
                              variant="determinate"
                              value={countDownPercent}
                            />
                            <Box
                              top={0}
                              left={0}
                              bottom={0}
                              right={0}
                              position="absolute"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Typography
                                variant="caption"
                                component="div"
                                color="textSecondary"
                              >{`${countDown}s`}</Typography>
                            </Box>
                          </Box>
                          <span>
                            Centers Available: {availableCenters.length}
                          </span>
                        </Grid>
                        <Grid item>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleStartPolling}
                          >
                            Start Searching...
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} >
                      <Grid container>
                        <Grid item xs={12}>
                          <Grid container>
                            {availableSlots.length > 0 && (
                              <div
                                className="slots-available-block"
                                style={{ height: 200, width: "100%" }}
                              >
                                <DataGrid
                                  rows={availableSlots}
                                  columns={slotsColumns}
                                  pageSize={5}
                                  rowHeight={35}
                                  disableColumnMenu
                                  density="compact"
                                  onRowSelected={onSlotRowSelected}
                                />
                              </div>
                            )}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container>
                            {availableSlots.length > 0 && (
                              <div className="captch-block">
                                <span
                                  style={{ width: "150px", height: 50 }}
                                  dangerouslySetInnerHTML={{ __html: captcha }}
                                ></span>
                                <FormControl
                                  variant="filled"
                                  className={classes.formControl}
                                >
                                  <TextField
                                    id="captcha-input"
                                    label="Enter Security Code"
                                    value={captchaValue || ""}
                                    placeholder="XXXXX"
                                    onChange={handleCaptchaValueChange}
                                    inputProps={{ maxLength: 6, minLength: 6 }}
                                    variant="standard"
                                    className={classes.textField}
                                  />
                                </FormControl>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={handleBookAppointment}
                                >
                                  Book Appointment
                                </Button>
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </React.Fragment>
          )}
        </Grid>
      </section>
    </div>
  );
}

export default App;
