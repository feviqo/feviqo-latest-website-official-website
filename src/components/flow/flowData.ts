import { ClientProfile, ClientProject, LeadBooking, SimulatedEmail } from '../../types';

// Real production data stores - Clean state with zero mock/fake records
export const SEED_CLIENT_PROFILES: ClientProfile[] = [];

export const DEFAULT_PROJECTS: ClientProject[] = [];

export const SEED_LEADS: LeadBooking[] = [];

export const SEED_EMAILS: SimulatedEmail[] = [];

export interface AuthSession {
  role: 'client' | 'editor' | 'admin';
  email: string;
  name: string;
  company: string;
  clientId?: string;
  assignedEditor?: string;
}
