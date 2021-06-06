
import React from 'react';

import { Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Checkbox, Paper } from "@material-ui/core";
import { Beneficiary } from '../common/interfaces';

interface BeneficiariesTableProps{
    classes: any;
    beneficiaries: Beneficiary[];
    setSelectedBeneficiaries: Function
};

interface BeneficiariesTableState{
    selectedBeneficiaries: string[]
};

class BeneficiariesTable extends React.Component<BeneficiariesTableProps, BeneficiariesTableState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedBeneficiaries: [],
        };
    }
    handleBeneficiariesSelectAllClick(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        if (event.target.checked) {
            const newSelecteds = this.props.beneficiaries.map((n: any) => n.name);
            this.setSelectedBeneficiaries(newSelecteds);
            return;
        }
        this.setSelectedBeneficiaries([]);
    }
    handleBeneficiaryRowClick(event: React.MouseEvent<unknown>, name: string) {
        const selectedBeneficiaries = this.state.selectedBeneficiaries;
        const selectedIndex = selectedBeneficiaries.indexOf(name);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedBeneficiaries, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedBeneficiaries.slice(1));
        } else if (selectedIndex === selectedBeneficiaries.length - 1) {
            newSelected = newSelected.concat(selectedBeneficiaries.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedBeneficiaries.slice(0, selectedIndex),
                selectedBeneficiaries.slice(selectedIndex + 1)
            );
        }

        this.setSelectedBeneficiaries(newSelected);
    }
    setSelectedBeneficiaries(beneficiaries: string[]) {
        this.setState({ selectedBeneficiaries: beneficiaries });
        this.props.setSelectedBeneficiaries(beneficiaries);
    }
    render() {
        const numSelected = this.state.selectedBeneficiaries.length;
        const rowCount = this.props.beneficiaries.length;
        const isBeneficiarySelected = (id: string) => this.state.selectedBeneficiaries.indexOf(id) !== -1;
        return (
            <Grid container>
                {this.props.beneficiaries.length > 0 && (
                    <div
                        className="beneficiaries-list-block"
                        style={{ height: 200, width: "100%" }}
                    >
                        <TableContainer component={Paper}>
                            <Table
                                className={this.props.classes.table}
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                indeterminate={
                                                    numSelected > 0 &&
                                                    numSelected < rowCount
                                                }
                                                checked={
                                                    rowCount > 0 &&
                                                    numSelected === rowCount
                                                }
                                                onChange={
                                                    this.handleBeneficiariesSelectAllClick
                                                }
                                                inputProps={{
                                                    "aria-label":
                                                        "select all beneficiaries",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Age</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Vaccine</TableCell>
                                        <TableCell>Dose1 Date</TableCell>
                                        <TableCell>Due Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.props.beneficiaries.map(
                                        (beneficiary: Beneficiary, index: any) => {
                                            const isItemSelected = isBeneficiarySelected(
                                                beneficiary.id
                                            );
                                            const labelId = `enhanced-table-checkbox-${index}`;
                                            return (
                                                <TableRow
                                                    hover
                                                    onClick={(event) =>
                                                        this.handleBeneficiaryRowClick(
                                                            event,
                                                            beneficiary.id
                                                        )
                                                    }
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    key={beneficiary.id}
                                                    selected={isItemSelected}
                                                    classes={{
                                                        selected: this.props.classes.selected,
                                                    }}
                                                    className={this.props.classes.tableRow}
                                                >
                                                    <TableCell
                                                        padding="checkbox"
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        <Checkbox
                                                            checked={isItemSelected}
                                                            color="primary"
                                                            inputProps={{
                                                                "aria-labelledby": labelId,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        component="th"
                                                        scope="row"
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.id}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.name}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.age}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.status}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.vaccine}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.dose1_date}
                                                    </TableCell>
                                                    <TableCell
                                                        className={this.props.classes.tableCell}
                                                    >
                                                        {beneficiary.due_date}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </Grid>
        );
    }
}

export default BeneficiariesTable;