
export interface Beneficiary {
    id: string;
    name: string;
    age: number;
    status: string;
    vaccine?: string;
    dose1_date?: string;
    due_date?: string;
  }
  
  export interface State {
    state_id: number;
    state_name: string;
  }
  
  export interface District {
    district_id: number;
    district_name: string;
  }
  
  export interface Preferences {
    selectedBeneficiaries: string[];
    selectedDate: Date | number;
    selectedState: string;
    selectedDistricts: number[];
    vaccinePreference: string;
    paymentPreference: string[],
  
  }