/**
 * Official List of States and Union Territories in the Republic of India
 * Sourced from Ministry of Home Affairs (MHA) & Government of India Portal.
 * 28 States + 8 Union Territories = 36 Total Administrative Units
 */

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const INDIAN_UNION_TERRITORIES: string[] = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

/**
 * All 36 States & UTs in India sorted alphabetically
 */
export const ALL_INDIAN_STATES_AND_UTS: string[] = [
  ...INDIAN_STATES,
  ...INDIAN_UNION_TERRITORIES,
].sort((a, b) => a.localeCompare(b));

/**
 * Grouped structure for clean optgroup select dropdowns
 */
export const INDIAN_ADMINISTRATIVE_DIVISIONS = [
  {
    group: 'States (28)',
    items: INDIAN_STATES,
  },
  {
    group: 'Union Territories (8)',
    items: INDIAN_UNION_TERRITORIES,
  },
];
