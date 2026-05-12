export type ApplicationStatus =
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'technical'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  status: ApplicationStatus;
  job_link: string | null;
  screenshot_path: string | null;
  salary_range: string | null;
  location: string | null;
  notes: string | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  company_name: string;
  position: string;
  status?: ApplicationStatus;
  job_link?: string | null;
  screenshot_path?: string | null;
  salary_range?: string | null;
  location?: string | null;
  notes?: string | null;
  applied_at?: string;
}

export interface ApplicationUpdate extends Partial<ApplicationCreate> {
  id: string;
}
