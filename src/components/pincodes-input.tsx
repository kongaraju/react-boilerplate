
import React from 'react';

import {Paper, Chip, InputBase} from "@material-ui/core";

const PincodesInput = (props: any) => {
    const [pincodes, setPincodes] = React.useState<number[]>([]);
    const [pincode, setPincode] = React.useState<number | undefined>();

    const handlePincodeInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        if (event.target.value.length === 6) {
          setPincodes((pincodes) => [
            ...pincodes,
            parseInt(event.target.value) as number,
          ]);
          setPincode(undefined);
          return;
        }
        setPincode(parseInt(event.target.value) as number);
      };
      const handlePincodeDelete = (pin: any) => {
        setPincodes((pins) => pins.filter((pinItem) => pinItem !== pin));
      };

    return (<Paper
        component="form"
        className={props.classes.pincodesRoot}
      >
        {pincodes.map((pin) => {
          return (
            <Chip
              label={pin}
              clickable
              color="primary"
              onDelete={handlePincodeDelete.bind(
                null,
                pin
              )}
              variant="outlined"
            />
          );
        })}
        <InputBase
          value={pincode || ""}
          type="number"
          onChange={handlePincodeInputChange}
          className={props.classes.pincodeInput}
          placeholder="Enter Pincodes"
          inputProps={{
            "aria-label": "enter pincodes",
            maxLength: 6,
            minLength: 6,
          }}
        />
      </Paper>);
};

export default PincodesInput;