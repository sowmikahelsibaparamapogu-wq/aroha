import { AuthUser, UserRole } from '../types/scholarship';

export const DEMO_APPLICANTS: AuthUser[] = [
  {
    id: 'user_sowmika',
    role: 'applicant',
    name: 'Sowmika Helsiba Paramapogu',
    email: 'sowmikahelsibaparamapogu@gmail.com',
    identifier: 'NFST/2025/0812',
    community: 'Gond',
    state: 'Telangana',
    designation: 'Ph.D. Scholar in Biotechnology, Univ. of Hyderabad',
    scheme: 'NFST',
    associatedAppId: 'app_nfst_001',
    avatarType: 'scholar_female',
    department: 'Tribal Pharmacognosy & Indigenous Medicine',
  },
  {
    id: 'user_birsa',
    role: 'applicant',
    name: 'Birsa Dev Munda',
    email: 'birsa.munda.nos@gov.in',
    identifier: 'NOS/2025/0419',
    community: 'Munda',
    state: 'Jharkhand',
    designation: 'M.Sc. Scholar (University of Oxford, QS #3)',
    scheme: 'NOS',
    associatedAppId: 'app_nos_002',
    avatarType: 'scholar_male',
    department: 'Advanced Materials & Sustainable Mining',
  },
  {
    id: 'user_jemimah',
    role: 'applicant',
    name: 'Jemimah Khasi',
    email: 'jemimah.khasi@nehu.ac.in',
    identifier: 'NFST/2025/1104',
    community: 'Khasi',
    state: 'Meghalaya',
    designation: 'Ph.D. Scholar, NEHU Shillong',
    scheme: 'NFST',
    associatedAppId: 'app_nfst_004',
    avatarType: 'scholar_researcher',
    department: 'Mon-Khmer Endangered Dialects Documentation',
  },
  {
    id: 'user_fresh',
    role: 'applicant',
    name: 'Arjun Oraon',
    email: 'arjun.oraon.st@gmail.com',
    identifier: 'ST-REG-2025-009',
    community: 'Oraon',
    state: 'Odisha',
    designation: 'Prospective M.Phil / Ph.D. Candidate',
    scheme: 'NFST',
    avatarType: 'scholar_fresh',
    department: 'Tribal Agroforestry & Ecology',
  },
];

export const DEMO_ADMINS: AuthUser[] = [
  {
    id: 'admin_soren',
    role: 'admin',
    name: 'Dr. Rajeshwar Soren, IES',
    email: 'soren.r@mota.gov.in',
    identifier: 'MOTA-DESK4-092',
    designation: 'Senior Scrutiny Officer (Desk-IV)',
    department: 'Ministry of Tribal Affairs, Shastri Bhawan, New Delhi',
    avatarType: 'officer_senior',
  },
  {
    id: 'admin_lakra',
    role: 'admin',
    name: 'Deepa Lakra, Director',
    email: 'lakra.d@tribal.gov.in',
    identifier: 'MOTA-MERIT-DIR',
    designation: 'Director of Scholarships & National Merit Board',
    department: 'Tribal Welfare Division, MoTA, New Delhi',
    avatarType: 'officer_director',
  },
  {
    id: 'admin_rathod',
    role: 'admin',
    name: 'Vikram Rathod, Joint Secy',
    email: 'rathod.v@pfms.gov.in',
    identifier: 'PFMS-MOTA-DBT',
    designation: 'PFMS Direct Benefit Transfer Comptroller',
    department: 'Public Financial Management System (PFMS)',
    avatarType: 'officer_finance',
  },
];

const AUTH_STORAGE_KEY = 'aroha_current_auth_user';

export class AuthService {
  public static getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    // Default to Sowmika Helsiba as benchmark user
    return DEMO_APPLICANTS[0];
  }

  public static setCurrentUser(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  public static loginAs(user: AuthUser): void {
    this.setCurrentUser(user);
  }

  public static logout(): void {
    this.setCurrentUser(null);
  }
}
