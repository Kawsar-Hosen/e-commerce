/**
 * Bangladesh administrative data used by the checkout, address book and the
 * delivery-fee rules. Eight divisions, sixty-four districts, plus thana/area
 * lists for the districts where e-commerce delivery is densest.
 */

export interface BdArea {
  name: string;
  nameBn: string;
  postcode?: string;
}

export interface BdDistrict {
  name: string;
  nameBn: string;
  /** Thana / upazila list. Empty means "let the shopper type the area". */
  areas: BdArea[];
}

export interface BdDivision {
  id: string;
  name: string;
  nameBn: string;
  districts: BdDistrict[];
}

/** Areas for the districts where SHOBDOX delivers most often. */
const DH_AREAS: BdArea[] = [
  { name: 'Mirpur', nameBn: 'মিরপুর', postcode: '1216' },
  { name: 'Mohammadpur', nameBn: 'মোহাম্মদপুর', postcode: '1207' },
  { name: 'Dhanmondi', nameBn: 'ধানমন্ডি', postcode: '1205' },
  { name: 'Gulshan', nameBn: 'গুলশান', postcode: '1212' },
  { name: 'Banani', nameBn: 'বনানী', postcode: '1213' },
  { name: 'Uttara', nameBn: 'উত্তরা', postcode: '1230' },
  { name: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আ/এ', postcode: '1229' },
  { name: 'Motijheel', nameBn: 'মতিঝিল', postcode: '1000' },
  { name: 'Paltan', nameBn: 'পল্টন', postcode: '1000' },
  { name: 'Old Dhaka (Lalbagh)', nameBn: 'পুরান ঢাকা (লালবাগ)', postcode: '1211' },
  { name: 'Badda', nameBn: 'বাড্ডা', postcode: '1212' },
  { name: 'Rampura', nameBn: 'রামপুরা', postcode: '1219' },
  { name: 'Khilgaon', nameBn: 'খিলগাঁও', postcode: '1219' },
  { name: 'Jatrabari', nameBn: 'যাত্রাবাড়ী', postcode: '1204' },
  { name: 'Tejgaon', nameBn: 'তেজগাঁও', postcode: '1215' },
  { name: 'Shyamoli', nameBn: 'শ্যামলী', postcode: '1207' },
  { name: 'Kafrul', nameBn: 'কাফরুল', postcode: '1206' },
  { name: 'Cantonment', nameBn: 'ক্যান্টনমেন্ট', postcode: '1206' },
  { name: 'Savar', nameBn: 'সাভার', postcode: '1340' },
  { name: 'Dhamrai', nameBn: 'ধামরাই', postcode: '1350' },
  { name: 'Dohar', nameBn: 'দোহার', postcode: '1330' },
  { name: 'Keraniganj', nameBn: 'কেরানীগঞ্জ', postcode: '1310' },
  { name: 'Nawabganj', nameBn: 'নবাবগঞ্জ', postcode: '1320' },
];

const CTG_AREAS: BdArea[] = [
  { name: 'Agrabad', nameBn: 'আগ্রাবাদ', postcode: '4100' },
  { name: 'Chawkbazar', nameBn: 'চকবাজার', postcode: '4203' },
  { name: 'Nasirabad', nameBn: 'নাসিরাবাদ', postcode: '4210' },
  { name: 'Khulshi', nameBn: 'খুলশী', postcode: '4225' },
  { name: 'Panchlaish', nameBn: 'পাঁচলাইশ', postcode: '4203' },
  { name: 'Halishahar', nameBn: 'হালিশহর', postcode: '4216' },
  { name: 'Pahartali', nameBn: 'পাহাড়তলী', postcode: '4202' },
  { name: 'Patenga', nameBn: 'পতেঙ্গা', postcode: '4204' },
  { name: 'Sitakunda', nameBn: 'সীতাকুণ্ড', postcode: '4310' },
  { name: 'Hathazari', nameBn: 'হাটহাজারী', postcode: '4330' },
  { name: 'Mirsharai', nameBn: 'মীরসরাই', postcode: '4320' },
];

const SYLHET_AREAS: BdArea[] = [
  { name: 'Zindabazar', nameBn: 'জিন্দাবাজার', postcode: '3100' },
  { name: 'Ambarkhana', nameBn: 'আম্বরখানা', postcode: '3100' },
  { name: 'Subid Bazar', nameBn: 'সুবিদবাজার', postcode: '3100' },
  { name: 'Beanibazar', nameBn: 'বিয়ানীবাজার', postcode: '3170' },
  { name: 'Golapganj', nameBn: 'গোলাপগঞ্জ', postcode: '3160' },
];

const KHULNA_AREAS: BdArea[] = [
  { name: 'Sonadanga', nameBn: 'সোনাডাঙ্গা', postcode: '9100' },
  { name: 'Khalishpur', nameBn: 'খালিশপুর', postcode: '9000' },
  { name: 'Daulatpur', nameBn: 'দৌলতপুর', postcode: '9202' },
  { name: 'Boyra', nameBn: 'বয়রা', postcode: '9000' },
];

const RAJSHAHI_AREAS: BdArea[] = [
  { name: 'Boalia', nameBn: 'বোয়ালিয়া', postcode: '6000' },
  { name: 'Motihar', nameBn: 'মতিহার', postcode: '6202' },
  { name: 'Rajpara', nameBn: 'রাজপাড়া', postcode: '6000' },
  { name: 'Shaheb Bazar', nameBn: 'সাহেব বাজার', postcode: '6100' },
];

const RANGPUR_AREAS: BdArea[] = [
  { name: 'Dhap', nameBn: 'ধাপ', postcode: '5400' },
  { name: 'Jahaj Company More', nameBn: 'জাহাজ কোম্পানি মোড়', postcode: '5400' },
  { name: 'Mahiganj', nameBn: 'মাহিগঞ্জ', postcode: '5402' },
];

const MYMENSINGH_AREAS: BdArea[] = [
  { name: 'Ganginarpar', nameBn: 'গাঙ্গিনারপাড়', postcode: '2200' },
  { name: 'Charpara', nameBn: 'চরপাড়া', postcode: '2200' },
  { name: 'Trishal', nameBn: 'ত্রিশাল', postcode: '2220' },
];

const BARISHAL_AREAS: BdArea[] = [
  { name: 'Band Road', nameBn: 'বান্দ রোড', postcode: '8200' },
  { name: 'Nathullabad', nameBn: 'নথুল্লাবাদ', postcode: '8200' },
  { name: 'Babuganj', nameBn: 'বাবুগঞ্জ', postcode: '8210' },
];

/**
 * Every district has at least its sadar thana, which keeps the area dropdown
 * useful without shipping hundreds of upazila rows.
 */
const SADAR_AREA: BdArea = { name: 'Sadar', nameBn: 'সদর' };

/** `[English name, Bangla name]` pairs for the sixty-four districts. */
type DistrictPair = [string, string];

const DIVISION_DATA: Array<{
  id: string;
  name: string;
  nameBn: string;
  districts: DistrictPair[];
}> = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      ['Dhaka', 'ঢাকা'], ['Gazipur', 'গাজীপুর'], ['Narayanganj', 'নারায়ণগঞ্জ'],
      ['Narsingdi', 'নরসিংদী'], ['Manikganj', 'মানিকগঞ্জ'], ['Munshiganj', 'মুন্সিগঞ্জ'],
      ['Tangail', 'টাঙ্গাইল'], ['Kishoreganj', 'কিশোরগঞ্জ'], ['Faridpur', 'ফরিদপুর'],
      ['Gopalganj', 'গোপালগঞ্জ'], ['Madaripur', 'মাদারীপুর'], ['Rajbari', 'রাজবাড়ী'],
      ['Shariatpur', 'শরীয়তপুর'],
    ],
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      ['Chattogram', 'চট্টগ্রাম'], ["Cox's Bazar", 'কক্সবাজার'], ['Cumilla', 'কুমিল্লা'],
      ['Brahmanbaria', 'ব্রাহ্মণবাড়িয়া'], ['Chandpur', 'চাঁদপুর'], ['Feni', 'ফেনী'],
      ['Lakshmipur', 'লক্ষ্মীপুর'], ['Noakhali', 'নোয়াখালী'], ['Khagrachhari', 'খাগড়াছড়ি'],
      ['Rangamati', 'রাঙ্গামাটি'], ['Bandarban', 'বান্দরবান'],
    ],
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      ['Rajshahi', 'রাজশাহী'], ['Bogura', 'বগুড়া'], ['Joypurhat', 'জয়পুরহাট'],
      ['Naogaon', 'নওগাঁ'], ['Natore', 'নাটোর'], ['Chapainawabganj', 'চাঁপাইনবাবগঞ্জ'],
      ['Pabna', 'পাবনা'], ['Sirajganj', 'সিরাজগঞ্জ'],
    ],
  },
  {
    id: 'khulna',
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      ['Khulna', 'খুলনা'], ['Bagerhat', 'বাগেরহাট'], ['Chuadanga', 'চুয়াডাঙ্গা'],
      ['Jashore', 'যশোর'], ['Jhenaidah', 'ঝিনাইদহ'], ['Kushtia', 'কুষ্টিয়া'],
      ['Magura', 'মাগুরা'], ['Meherpur', 'মেহেরপুর'], ['Narail', 'নড়াইল'],
      ['Satkhira', 'সাতক্ষীরা'],
    ],
  },
  {
    id: 'barishal',
    name: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      ['Barishal', 'বরিশাল'], ['Barguna', 'বরগুনা'], ['Bhola', 'ভোলা'],
      ['Jhalokati', 'ঝালকাঠি'], ['Patuakhali', 'পটুয়াখালী'], ['Pirojpur', 'পিরোজপুর'],
    ],
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      ['Sylhet', 'সিলেট'], ['Habiganj', 'হবিগঞ্জ'],
      ['Moulvibazar', 'মৌলভীবাজার'], ['Sunamganj', 'সুনামগঞ্জ'],
    ],
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      ['Rangpur', 'রংপুর'], ['Dinajpur', 'দিনাজপুর'], ['Gaibandha', 'গাইবান্ধা'],
      ['Kurigram', 'কুড়িগ্রাম'], ['Lalmonirhat', 'লালমনিরহাট'], ['Nilphamari', 'নীলফামারী'],
      ['Panchagarh', 'পঞ্চগড়'], ['Thakurgaon', 'ঠাকুরগাঁও'],
    ],
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      ['Mymensingh', 'ময়মনসিংহ'], ['Jamalpur', 'জামালপুর'],
      ['Netrokona', 'নেত্রকোণা'], ['Sherpur', 'শেরপুর'],
    ],
  },
];

const AREA_OVERRIDES: Record<string, BdArea[]> = {
  Dhaka: DH_AREAS,
  Chattogram: CTG_AREAS,
  Sylhet: SYLHET_AREAS,
  Khulna: KHULNA_AREAS,
  Rajshahi: RAJSHAHI_AREAS,
  Rangpur: RANGPUR_AREAS,
  Mymensingh: MYMENSINGH_AREAS,
  Barishal: BARISHAL_AREAS,
};

export const BD_DIVISIONS: BdDivision[] = DIVISION_DATA.map((division) => ({
  ...division,
  districts: division.districts.map<BdDistrict>(([name, nameBn]) => ({
    name,
    nameBn,
    areas: AREA_OVERRIDES[name] ?? [SADAR_AREA],
  })),
}));

export function findDivision(divisionIdOrName: string): BdDivision | undefined {
  const needle = divisionIdOrName.trim().toLowerCase();
  return BD_DIVISIONS.find(
    (division) => division.id === needle || division.name.toLowerCase() === needle || division.nameBn === divisionIdOrName,
  );
}

export function findDistrict(divisionIdOrName: string, districtName: string): BdDistrict | undefined {
  return findDivision(divisionIdOrName)?.districts.find((district) => district.name === districtName);
}

export function districtNamesOf(divisionIdOrName: string): string[] {
  return findDivision(divisionIdOrName)?.districts.map((district) => district.name) ?? [];
}

export function areasOf(divisionIdOrName: string, districtName: string): BdArea[] {
  return findDistrict(divisionIdOrName, districtName)?.areas ?? [];
}

/**
 * Dhaka city orders are the cheapest and fastest to fulfil, so the whole
 * delivery-fee model keys off this single check.
 */
export function isInsideDhakaCity(divisionIdOrName: string, districtName: string): boolean {
  const division = findDivision(divisionIdOrName);
  if (!division || division.id !== 'dhaka') return false;
  if (districtName !== 'Dhaka') return false;

  return true;
}

export const BD_DIVISION_NAMES = BD_DIVISIONS.map((division) => division.name);
export const BD_DISTRICT_COUNT = BD_DIVISIONS.reduce((total, division) => total + division.districts.length, 0);
