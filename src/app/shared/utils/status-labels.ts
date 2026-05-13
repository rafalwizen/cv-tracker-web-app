import { ApplicationStatus } from '../../core/models/application.model';

export interface StatusConfig {
  label: string;
  color: 'primary' | 'accent' | 'warn';
}

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  applied: { label: $localize`:@@status.applied:Applied`, color: 'primary' },
  phone_screen: { label: $localize`:@@status.phone_screen:Phone Screen`, color: 'primary' },
  interview: { label: $localize`:@@status.interview:Interview`, color: 'accent' },
  technical: { label: $localize`:@@status.technical:Technical Interview`, color: 'accent' },
  offer: { label: $localize`:@@status.offer:Offer`, color: 'primary' },
  rejected: { label: $localize`:@@status.rejected:Rejected`, color: 'warn' },
  withdrawn: { label: $localize`:@@status.withdrawn:Withdrawn`, color: 'warn' },
};

export const ALL_STATUSES: ApplicationStatus[] = [
  'applied',
  'phone_screen',
  'interview',
  'technical',
  'offer',
  'rejected',
  'withdrawn',
];
