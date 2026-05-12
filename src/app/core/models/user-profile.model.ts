export type PreferredLanguage = 'pl' | 'en';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  preferred_language: PreferredLanguage;
  created_at: string;
}
