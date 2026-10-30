export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string | null;
  credentialUrl?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'technical' | 'soft';
  level?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string | null;
}

export interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  relationship?: string;
  company?: string;
  contact?: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  links: ProfileLink[] | null;
  experiences?: ExperienceItem[] | null;
  educations?: EducationItem[] | null;
  certifications?: CertificationItem[] | null;
  skills?: SkillItem[] | null;
  languages?: LanguageItem[] | null;
  projects?: ProjectItem[] | null;
  achievements?: AchievementItem[] | null;
  references?: ReferenceItem[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface PhotoResponse {
  photoUrl: string | null;
  success?: boolean;
}

export interface CVPersonalInfo {
  fullName: string;
  headline?: string;
  email: string;
  phone?: string;
  location?: string;
  photoUrl?: string | null;
  links?: ProfileLink[];
}

export interface GenericSectionItem {
  id?: string;
  role?: string;
  company?: string;
  period?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  institution?: string;
  degree?: string;
  name?: string;
  category?: 'technical' | 'soft';
  level?: string;
  title?: string;
  language?: string;
  proficiency?: string;
  issuer?: string;
  issueDate?: string;
  relationship?: string;
  date?: string;
  contact?: string;
  url?: string;
}

export interface CVSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  paginationRule: string;
  content?: string;
  items?: GenericSectionItem[];
}

export interface CVHeader {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  template: string;
  personalInfo: CVPersonalInfo;
  sections: CVSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CVListResponse {
  cvs: CVHeader[];
}

export interface CVResponse {
  cv: CV;
}
