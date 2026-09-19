import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms_data.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const UPLOADS_FILE = path.join(DATA_DIR, 'upload_records.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[CMS] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[CMS] Error writing ${filePath}:`, err);
    return false;
  }
}

// CMS Data Types
export interface LogoItem {
  id: string;
  name: string;
  image: string;
  altText: string;
  displayOrder: number;
  isActive: boolean;
  link?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  vimeoId: string;
  rating: number;
  highlight: string;
  subscribers?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  videoUrl: string;
  clientOrCompany: string;
  platform: string;
  metrics: string;
  displayOrder: number;
  isActive: boolean;
}

export interface PageHeroContent {
  badge?: string;
  headline?: string;
  highlightHeadline?: string;
  description?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  heroVideoUrl?: string;
  heroVideoThumbnail?: string;
  heroVideoEnabled?: boolean;
  stats?: Array<{ label: string; value: string; subtext?: string }>;
  [key: string]: any;
}

export interface CmsData {
  logos: LogoItem[];
  testimonials: TestimonialItem[];
  portfolio: PortfolioItem[];
  pages: Record<string, PageHeroContent>;
}

// --- CMS STORE METHODS ---
export function getCmsData(): CmsData {
  return readJsonFile<CmsData>(CMS_FILE, {
    logos: [],
    testimonials: [],
    portfolio: [],
    pages: {},
  });
}

export function saveCmsData(data: CmsData): boolean {
  return writeJsonFile(CMS_FILE, data);
}

// Logos
export function getLogos(): LogoItem[] {
  const cms = getCmsData();
  return (cms.logos || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function saveLogo(logo: LogoItem): LogoItem {
  const cms = getCmsData();
  const existingIdx = cms.logos.findIndex((l) => l.id === logo.id);
  if (existingIdx >= 0) {
    cms.logos[existingIdx] = { ...cms.logos[existingIdx], ...logo };
  } else {
    cms.logos.push(logo);
  }
  saveCmsData(cms);
  return logo;
}

export function deleteLogo(id: string): boolean {
  const cms = getCmsData();
  const filtered = cms.logos.filter((l) => l.id !== id);
  cms.logos = filtered;
  return saveCmsData(cms);
}

// Testimonials
export function getTestimonials(): TestimonialItem[] {
  const cms = getCmsData();
  return (cms.testimonials || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function saveTestimonial(item: TestimonialItem): TestimonialItem {
  const cms = getCmsData();
  const existingIdx = cms.testimonials.findIndex((t) => t.id === item.id);
  if (existingIdx >= 0) {
    cms.testimonials[existingIdx] = { ...cms.testimonials[existingIdx], ...item };
  } else {
    cms.testimonials.push(item);
  }
  saveCmsData(cms);
  return item;
}

export function deleteTestimonial(id: string): boolean {
  const cms = getCmsData();
  cms.testimonials = cms.testimonials.filter((t) => t.id !== id);
  return saveCmsData(cms);
}

// Portfolio
export function getPortfolio(): PortfolioItem[] {
  const cms = getCmsData();
  return (cms.portfolio || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function savePortfolioItem(item: PortfolioItem): PortfolioItem {
  const cms = getCmsData();
  const existingIdx = cms.portfolio.findIndex((p) => p.id === item.id);
  if (existingIdx >= 0) {
    cms.portfolio[existingIdx] = { ...cms.portfolio[existingIdx], ...item };
  } else {
    cms.portfolio.push(item);
  }
  saveCmsData(cms);
  return item;
}

export function deletePortfolioItem(id: string): boolean {
  const cms = getCmsData();
  cms.portfolio = cms.portfolio.filter((p) => p.id !== id);
  return saveCmsData(cms);
}

// Page Content
export function getPageContent(pageKey: string): PageHeroContent | null {
  const cms = getCmsData();
  return cms.pages?.[pageKey] || null;
}

export function updatePageContent(pageKey: string, content: Partial<PageHeroContent>): PageHeroContent {
  const cms = getCmsData();
  if (!cms.pages) cms.pages = {};
  cms.pages[pageKey] = {
    ...(cms.pages[pageKey] || {}),
    ...content,
  };
  saveCmsData(cms);
  return cms.pages[pageKey];
}

// --- CRYPTO & SECURITY UTILITIES ---
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  try {
    const [salt, storedHash] = combinedHash.split(':');
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch (err) {
    return false;
  }
}

export function sanitizeClient(client: any): any {
  if (!client) return null;
  const { password, passwordHash, ...safeClient } = client;
  return safeClient;
}

// Auto-migrate any legacy plaintext passwords on startup
function autoMigratePlaintextPasswords(): void {
  try {
    const rawClients = readJsonFile<any[]>(CLIENTS_FILE, []);
    let modified = false;
    for (const c of rawClients) {
      if (c.password && !c.passwordHash) {
        c.passwordHash = hashPassword(c.password);
        delete c.password;
        modified = true;
      }
      if (!c.status) {
        c.status = 'Active';
        modified = true;
      }
    }
    if (modified) {
      writeJsonFile(CLIENTS_FILE, rawClients);
      console.log('[CMS Security] Migrated legacy plaintext passwords to salted PBKDF2 hashes.');
    }
  } catch (err) {
    console.error('[CMS Security] Migration error:', err);
  }
}

// Run migration once on module import
autoMigratePlaintextPasswords();

// --- CLIENTS & PROJECTS STORE METHODS ---
export function getRawClients(): any[] {
  return readJsonFile<any[]>(CLIENTS_FILE, []);
}

export function getClients(): any[] {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  return clients.map(sanitizeClient);
}

export function getClientById(id: string): any {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  const found = clients.find((c) => c.id === id);
  return found ? sanitizeClient(found) : null;
}

export function getClientByEmail(email: string): any {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  return clients.find((c) => c.email?.toLowerCase() === email?.toLowerCase()) || null;
}

export function saveClient(clientData: any): { client: any; oneTimePassword?: string } {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  const idx = clients.findIndex((c) => c.id === clientData.id || c.email?.toLowerCase() === clientData.email?.toLowerCase());

  let oneTimePassword: string | undefined = undefined;
  let passwordHash = idx >= 0 ? clients[idx].passwordHash : undefined;

  // If a password was provided or is newly generated
  if (clientData.password) {
    oneTimePassword = clientData.password;
    passwordHash = hashPassword(clientData.password);
  } else if (!passwordHash) {
    // Generate secure temporary initial password for new client
    oneTimePassword = `Fv-${crypto.randomBytes(4).toString('hex')}!`;
    passwordHash = hashPassword(oneTimePassword);
  }

  // Remove plaintext password property
  const { password, ...rest } = clientData;

  const record = {
    ...(idx >= 0 ? clients[idx] : {}),
    ...rest,
    passwordHash,
    status: rest.status || (idx >= 0 ? clients[idx].status : 'Active') || 'Active',
    joinedDate: rest.joinedDate || (idx >= 0 ? clients[idx].joinedDate : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    activeProjectsCount: rest.activeProjectsCount ?? (idx >= 0 ? clients[idx].activeProjectsCount : 0),
  };

  if (idx >= 0) {
    clients[idx] = record;
  } else {
    clients.unshift(record);
  }

  writeJsonFile(CLIENTS_FILE, clients);
  return { client: sanitizeClient(record), oneTimePassword };
}

export function updateClientStatus(id: string, status: 'Active' | 'Paused' | 'Archived' | 'Disabled'): any {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx >= 0) {
    clients[idx].status = status;
    writeJsonFile(CLIENTS_FILE, clients);
    return sanitizeClient(clients[idx]);
  }
  return null;
}

export function resetClientPassword(id: string, customPassword?: string): { success: boolean; temporaryPassword?: string; error?: string } {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx < 0) {
    return { success: false, error: 'Client not found' };
  }

  const temporaryPassword = customPassword && customPassword.trim().length >= 6
    ? customPassword.trim()
    : `Fv-${crypto.randomBytes(4).toString('hex')}!`;

  clients[idx].passwordHash = hashPassword(temporaryPassword);
  delete clients[idx].password;

  writeJsonFile(CLIENTS_FILE, clients);
  return { success: true, temporaryPassword };
}

export function deleteClient(id: string, permanent: boolean = false): boolean {
  const clients = readJsonFile<any[]>(CLIENTS_FILE, []);
  if (permanent) {
    const filtered = clients.filter((c) => c.id !== id);
    return writeJsonFile(CLIENTS_FILE, filtered);
  } else {
    // Safe archive by default
    const idx = clients.findIndex((c) => c.id === id);
    if (idx >= 0) {
      clients[idx].status = 'Archived';
      return writeJsonFile(CLIENTS_FILE, clients);
    }
    return false;
  }
}

export function getProjects(clientEmail?: string, role?: string): any[] {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  if (role === 'client' && clientEmail) {
    return projects.filter((p) => p.clientEmail?.toLowerCase() === clientEmail.toLowerCase());
  }
  return projects;
}

export function saveProject(project: any): any {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], ...project, lastUpdated: 'Just now' };
  } else {
    projects.unshift({
      ...project,
      createdAt: project.createdAt || new Date().toISOString(),
      lastUpdated: 'Just now',
    });
  }
  writeJsonFile(PROJECTS_FILE, projects);
  return idx >= 0 ? projects[idx] : project;
}

export function deleteProject(id: string): boolean {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []).filter((p) => p.id !== id);
  return writeJsonFile(PROJECTS_FILE, projects);
}

export function addFilesToProject(projectId: string, files: any[]): any {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx >= 0) {
    if (!projects[idx].rawFootageFiles) {
      projects[idx].rawFootageFiles = [];
    }
    // Avoid duplicate file entries
    for (const f of files) {
      const existing = projects[idx].rawFootageFiles.find((ef: any) => ef.name === f.name);
      if (!existing) {
        projects[idx].rawFootageFiles.push(f);
      }
    }
    projects[idx].lastUpdated = 'Just now';
    writeJsonFile(PROJECTS_FILE, projects);
    return projects[idx];
  }
  return null;
}

export function addRevisionToProject(projectId: string, revision: any): any {
  const projects = readJsonFile<any[]>(PROJECTS_FILE, []);
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx >= 0) {
    if (!projects[idx].revisionNotes) {
      projects[idx].revisionNotes = [];
    }
    projects[idx].revisionNotes.push(revision);
    projects[idx].lastUpdated = 'Just now';
    writeJsonFile(PROJECTS_FILE, projects);
    return projects[idx];
  }
  return null;
}

// Upload Records
export function logUploadRecord(record: any): void {
  try {
    const records = readJsonFile<any[]>(UPLOADS_FILE, []);
    records.unshift(record);
    if (records.length > 500) records.slice(0, 500);
    writeJsonFile(UPLOADS_FILE, records);
  } catch (err) {
    console.warn('[CMS] Failed to log upload record:', err);
  }
}
