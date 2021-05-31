import './App.scss';
import React from 'react';
import { createStyles, makeStyles, Theme, fade } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import {
  TextField, Checkbox, Button, Switch, Select, MenuItem,
  Input, InputBase, InputLabel,
  RadioGroup, Radio,
  FormLabel, FormControlLabel, FormControl,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@material-ui/core';
// import { DataGrid, ColDef } from '@material-ui/data-grid';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

import DateFnsUtils from '@date-io/date-fns';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import CowinClient from './cowin-client';


interface Beneficiary {
  id: string;
  name: string;
  age: number;
  status: string;
  vaccine?: string;
  dose1_date?: string;
  dose2_due_date?: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    textField: {
    },
    table: {

    },
    pincodesRoot: {
      padding: "2px 4px",
      width: 400
    },
    pincodeInput: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    tableRow: {
      "&$selected, &$selected:hover": {
        backgroundColor: fade(theme.palette.primary.light, 0.08)
      }
    },
    tableCell: {
      "$selected &": {
        // color: theme.palette.primary.contrastText
      }
    },
    selected: {}

  }),
);

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
  return date
};

const cowinClient: CowinClient = new CowinClient({});

function App() {

  const classes = useStyles();
  // const theme = useTheme();
  const [mobile, setMobile] = React.useState<number | undefined>();
  const [automateOtp, setAutomateOTP] = React.useState<boolean>(true);
  const [otp, setOTP] = React.useState<number | undefined>();
  const [frequency, setFrequency] = React.useState<number>(10);
  const [beneficiaries, setBeneficiaries] = React.useState<Beneficiary[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [searchPreference, setSearchPreference] = React.useState<string>('stateanddistrict');
  const [state, setState] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [pincodes, setPincodes] = React.useState<number[]>([]);
  const [pincode, setPincode] = React.useState<number | undefined>();
  const [vaccinePreference, setVaccinePreference] = React.useState<string>('nopreference');
  const [paymentPreference, setPaymentPreference] = React.useState<string>('nopreference');
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(getTomorrow());
  const [automateCaptcha, setAutomateCaptcha] = React.useState<boolean>(true);

  const handleMobileChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMobile(event.target.value as number);
  };

  const handleOTPAutomationPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutomateOTP(event.target.checked as boolean);
  };

  const handleCaptchaAutomationPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutomateCaptcha(event.target.checked as boolean);
  };
  const handleOTPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 6) {
      cowinClient.validateOTP(event.target.value)
        .then(() => {
          return cowinClient.getBeneficiaries();
        })
        .then(loadBeneficiaries);
    }
    setOTP(parseInt(event.target.value) as number);
  };

  const loadBeneficiaries = (beneficiariesList: any) => {
    setBeneficiaries(beneficiariesList);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleVaccinePreferenceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setVaccinePreference(event.target.value as string);
  };

  const handlePaymentPreferenceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPaymentPreference(event.target.value as string);
  };

  const handlePincodeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 6) {
      setPincodes((pincodes) => [...pincodes, parseInt(event.target.value) as number]);
      setPincode(undefined);
      return;
    }
    setPincode(parseInt(event.target.value) as number);
  };
  const handlePincodeDelete = (pin: any) => {
    setPincodes((pins) => pins.filter((pinItem) => pinItem !== pin));
  };

  const districts: any = [];
  const numSelected = selected.length;
  const rowCount = beneficiaries.length;
  const isSelected = (name: string) => selected.indexOf(name) !== -1;
  const handleFreqChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFrequency(event.target.value as number);
  };
  const handleStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setState(event.target.value as string);
  };
  const handleDistrictChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDistrict(event.target.value as string);
  };
  const handleBeneficiariesSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = beneficiaries.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleBeneficiaryRowClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };
  const handleSearchOption = (event: React.MouseEvent<HTMLElement>, newSearchOption: string) => {
    setSearchPreference(newSearchOption);
  };

  const handleSavePreferences = () => {
    cowinClient.setConfig({ mobile: mobile });
    cowinClient.sendOTP();
  };

  return (
    <div className="App">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      <header className="App-header">
        Header
        <FormControl variant="filled" className={classes.formControl}>
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
      </header>
      <section>
        <div className="mobile-otp-block">
          <FormControl variant="filled" className={classes.formControl}>
            <TextField
              id="mobile-number"
              label="Mobile"
              type="number"
              value={mobile || ""}
              onChange={handleMobileChange}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{ maxLength: 10, minLength: 10 }}
              variant="outlined"
              className={classes.textField}
            />
          </FormControl>
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
          <FormControl variant="filled" className={classes.formControl}>
            <TextField
              id="mobile-otp"
              label="OTP"
              type="number"
              value={otp || ""}
              onChange={handleOTPChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{ maxLength: 6, minLength: 6 }}
              variant="standard"
              className={classes.textField}
            />
          </FormControl>
        </div>
        <div className="beneficiaries-list-block" style={{ height: 200, width: '100%' }}>

          <TableContainer component={Paper}>
            <Table className={classes.table} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={numSelected > 0 && numSelected < rowCount}
                      checked={rowCount > 0 && numSelected === rowCount}
                      onChange={handleBeneficiariesSelectAllClick}
                      inputProps={{ 'aria-label': 'select all beneficiaries' }}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Vaccine</TableCell>
                  <TableCell>Dose1 Date</TableCell>
                  <TableCell>Dose2 Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {beneficiaries.map((beneficiary: Beneficiary, index) => {
                  const isItemSelected = isSelected(beneficiary.name);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (<TableRow
                    hover
                    onClick={(event) => handleBeneficiaryRowClick(event, beneficiary.name)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={beneficiary.name}
                    selected={isItemSelected}
                    classes={{ selected: classes.selected }}
                    className={classes.tableRow}
                  >
                    <TableCell padding="checkbox" className={classes.tableCell}>
                      <Checkbox
                        checked={isItemSelected}
                        color="primary"
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row" className={classes.tableCell}>
                      {beneficiary.id}
                    </TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.name}</TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.age}</TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.status}</TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.vaccine}</TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.dose1_date}</TableCell>
                    <TableCell className={classes.tableCell}>{beneficiary.dose2_due_date}</TableCell>
                  </TableRow>)
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="search-criteria-block">
          <div className="search-preference-block">
            <ToggleButtonGroup
              value={searchPreference}
              exclusive
              onChange={handleSearchOption}
              aria-label="text alignment"
            >
              <ToggleButton value="pincode" aria-label="Pincodes">
                Pincodes
      </ToggleButton>
              <ToggleButton value="stateanddistrict" aria-label="State and District">
                State & Districts
      </ToggleButton>

            </ToggleButtonGroup>
          </div>
          <div className="search-controls-block">
            {
              searchPreference !== "stateanddistrict"
                ?
                <div className="seach-by-pincodes">
                  <Paper component="form" className={classes.pincodesRoot}>
                    {pincodes.map((pin) => {
                      return (
                        <Chip
                          label={pin}
                          clickable
                          color="primary"
                          onDelete={handlePincodeDelete.bind(null, pin)}
                          variant="outlined"
                        />
                      );
                    })}
                    <InputBase
                      value={pincode || ""}
                      type="number"
                      onChange={handlePincodeInputChange}
                      className={classes.pincodeInput}
                      placeholder="Enter Pincode"
                      inputProps={{
                        "aria-label": "search google maps",
                        maxLength: 6,
                        minLength: 6
                      }}
                    />
                  </Paper>

                </div>
                :
                <div className="search-by-state-district">
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="state-selection-label">State</InputLabel>
                    <Select
                      labelId="state-selection-label"
                      id="state-selection"
                      value={state}
                      onChange={handleStateChange}
                      label="State"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="districts-chip-label">District</InputLabel>
                    <Select
                      labelId="districts-chip-label"
                      id="district-chip"
                      multiple
                      value={district}
                      onChange={handleDistrictChange}
                      input={<Input id="district-chip" />}
                      renderValue={(selected) => (
                        <div className={classes.chips}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} className={classes.chip} />
                          ))}
                        </div>
                      )}
                      MenuProps={MenuProps}
                    >
                      {districts.map((districtItem: any) => (
                        <MenuItem key={districtItem.name} value={districtItem.value} >
                          {districtItem.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
            }
          </div>
        </div>
        <div className="vaccine-preference-block">
          <FormControl component="fieldset">
            <FormLabel component="legend">Vaccine</FormLabel>
            <RadioGroup aria-label="vaccine" name="vaccinePref" value={vaccinePreference} onChange={handleVaccinePreferenceChange}>
              <FormControlLabel value="nopreference" control={<Radio color="primary" />} label="Any" />
              <FormControlLabel value="covishield" control={<Radio />} label="Covishield" />
              <FormControlLabel value="covaxin" control={<Radio />} label="Covaxin" />
              <FormControlLabel value="sputnikv" control={<Radio />} label="Sputnik V" />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="payment-preference-block">
          <FormControl component="fieldset">
            <FormLabel component="legend">Payament</FormLabel>
            <RadioGroup aria-label="Payment" name="paymentPref" value={paymentPreference} onChange={handlePaymentPreferenceChange}>
              <FormControlLabel value="nopreference" control={<Radio color="primary" />} label="Any" />
              <FormControlLabel value="free" control={<Radio />} label="Free" />
              <FormControlLabel value="paid" control={<Radio />} label="Paid" />
            </RadioGroup>
          </FormControl>
        </div>
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
                'aria-label': 'Select Date',
              }}
            />
          </MuiPickersUtilsProvider>
        </div>
        <div className="captcha-control-block">
          <FormControlLabel
            control={
              <Switch
                checked={automateCaptcha}
                onChange={handleCaptchaAutomationPreferenceChange}
                name="automatecaptcha"
                color="primary"
              />
            }
            label="Auto Fill Captcha"
            labelPlacement="start"
          />
        </div>
        <div className="controls-block">
          <Button>Reset to Defaults</Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSavePreferences}
          >
            Save Preferences
        </Button>
        </div>
      </section>
    </div>
  );
}

export default App;
