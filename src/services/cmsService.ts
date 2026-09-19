/**
 * FEVIQO Central CMS & Production Persistent Storage Client
 * 
 * Interacts directly with backend Express API:
 * - Persistent CMS (Logos, Testimonials, Portfolio, Page Content)
 * - Persistent Clients & Projects
 * - Streaming Multipart Large File Uploads with true byte-level progress
 */

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
  badge: string;
  headline: string;
  highlightHeadline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroVideoUrl: string;
  heroVideoThumbnail: string;
  heroVideoEnabled: boolean;
  stats?: Array<{ label: string; value: string; subtext?: string }>;
  [key: string]: any;
}

export interface CmsStoreState {
  logos: LogoItem[];
  testimonials: TestimonialItem[];
  portfolio: PortfolioItem[];
  pages: Record<string, PageHeroContent>;
  isLoaded: boolean;
}

// Fallback seeds in case of initial offline/loading
export const DEFAULT_LOGOS: LogoItem[] = [
  { id: 'logo-1', name: 'Alex Tubio', image: '/images/logos/alex-tubio.webp', altText: 'Alex Tubio Media', displayOrder: 1, isActive: true, link: 'https://alextubio.com' },
  { id: 'logo-2', name: 'Jenna Kutcher', image: '/images/logos/jenna-kutcher.webp', altText: 'Jenna Kutcher Podcast', displayOrder: 2, isActive: true, link: 'https://jennakutcher.com' },
  { id: 'logo-3', name: 'Google', image: '/images/logos/google.webp', altText: 'Google', displayOrder: 3, isActive: true, link: 'https://google.com' },
  { id: 'logo-4', name: 'Jeff Walker', image: '/images/logos/jeff-walker.webp', altText: 'Jeff Walker', displayOrder: 4, isActive: true, link: 'https://jeffwalker.com' },
  { id: 'logo-5', name: 'Moolah', image: '/images/logos/moolah.webp', altText: 'Moolah', displayOrder: 5, isActive: true, link: '' },
  { id: 'logo-6', name: 'Lais', image: '/images/logos/lais.webp', altText: 'Lais', displayOrder: 6, isActive: true, link: '' },
  { id: 'logo-7', name: 'Logo-R', image: '/images/logos/logo-r.webp', altText: 'Logo-R', displayOrder: 7, isActive: true, link: '' },
  { id: 'logo-8', name: 'Ask a Concierge', image: '/images/logos/ask-a-concierge.webp', altText: 'Ask a Concierge', displayOrder: 8, isActive: true, link: '' },
  { id: 'logo-9', name: 'Canyon Ranch', image: '/images/logos/canyon-ranch.webp', altText: 'Canyon Ranch', displayOrder: 9, isActive: true, link: '' },
];

let memoryCache: CmsStoreState = {
  logos: DEFAULT_LOGOS,
  testimonials: [],
  portfolio: [],
  pages: {},
  isLoaded: false,
};

let fetchPromise: Promise<CmsStoreState> | null = null;

export const CMS_UPDATED_EVENT = 'feviqo_cms_updated';

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT, { detail: memoryCache }));
  }
}

/**
 * Fetch all CMS data from server
 */
export async function fetchAllCmsData(forceRefresh = false): Promise<CmsStoreState> {
  if (memoryCache.isLoaded && !forceRefresh) {
    return memoryCache;
  }

  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/cms/all');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          memoryCache = {
            logos: json.data.logos?.length ? json.data.logos : DEFAULT_LOGOS,
            testimonials: json.data.testimonials || [],
            portfolio: json.data.portfolio || [],
            pages: json.data.pages || {},
            isLoaded: true,
          };
          notifySubscribers();
          return memoryCache;
        }
      }
    } catch (err) {
      console.warn('[CMS Service] Backend fetch failed, using memory cache:', err);
    }
    return memoryCache;
  })();

  const result = await fetchPromise;
  fetchPromise = null;
  return result;
}

// Trigger initial load
if (typeof window !== 'undefined') {
  fetchAllCmsData();
}

export function getCachedCmsState(): CmsStoreState {
  return memoryCache;
}

// --- LOGO CMS ---
export async function getActiveLogos(): Promise<LogoItem[]> {
  const state = await fetchAllCmsData();
  return (state.logos || []).filter((l) => l.isActive);
}

export async function saveCmsLogo(logo: Partial<LogoItem>): Promise<LogoItem | null> {
  try {
    const isEdit = !!logo.id;
    const url = isEdit ? `/api/cms/logos/${logo.id}` : '/api/cms/logos';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
    if (res.ok) {
      const json = await res.json();
      await fetchAllCmsData(true);
      return json.logo;
    }
  } catch (err) {
    console.error('[CMS Service] Save logo error:', err);
  }
  return null;
}

export async function deleteCmsLogo(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cms/logos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAllCmsData(true);
      return true;
    }
  } catch (err) {
    console.error('[CMS Service] Delete logo error:', err);
  }
  return false;
}

export async function reorderCmsLogos(orderedIds: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/logos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (res.ok) {
      await fetchAllCmsData(true);
      return true;
    }
  } catch (err) {
    console.error('[CMS Service] Reorder logos error:', err);
  }
  return false;
}

// --- TESTIMONIAL CMS ---
export async function getActiveTestimonials(): Promise<TestimonialItem[]> {
  const state = await fetchAllCmsData();
  return (state.testimonials || []).filter((t) => t.isActive);
}

export async function saveCmsTestimonial(item: Partial<TestimonialItem>): Promise<TestimonialItem | null> {
  try {
    const isEdit = !!item.id;
    const url = isEdit ? `/api/cms/testimonials/${item.id}` : '/api/cms/testimonials';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const json = await res.json();
      await fetchAllCmsData(true);
      return json.testimonial;
    }
  } catch (err) {
    console.error('[CMS Service] Save testimonial error:', err);
  }
  return null;
}

export async function deleteCmsTestimonial(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cms/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAllCmsData(true);
      return true;
    }
  } catch (err) {
    console.error('[CMS Service] Delete testimonial error:', err);
  }
  return false;
}

// --- PORTFOLIO CMS ---
export async function getActivePortfolio(): Promise<PortfolioItem[]> {
  const state = await fetchAllCmsData();
  return (state.portfolio || []).filter((p) => p.isActive);
}

export async function saveCmsPortfolioItem(item: Partial<PortfolioItem>): Promise<PortfolioItem | null> {
  try {
    const isEdit = !!item.id;
    const url = isEdit ? `/api/cms/portfolio/${item.id}` : '/api/cms/portfolio';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const json = await res.json();
      await fetchAllCmsData(true);
      return json.item;
    }
  } catch (err) {
    console.error('[CMS Service] Save portfolio item error:', err);
  }
  return null;
}

export async function deleteCmsPortfolioItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cms/portfolio/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchAllCmsData(true);
      return true;
    }
  } catch (err) {
    console.error('[CMS Service] Delete portfolio item error:', err);
  }
  return false;
}

// --- PAGE CONTENT CMS ---
export async function getCmsPageContent(pageKey: string): Promise<PageHeroContent | null> {
  const state = await fetchAllCmsData();
  return state.pages?.[pageKey] || null;
}

export async function saveCmsPageContent(pageKey: string, content: Partial<PageHeroContent>): Promise<PageHeroContent | null> {
  try {
    const res = await fetch(`/api/cms/pages/${pageKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      const json = await res.json();
      await fetchAllCmsData(true);
      return json.page;
    }
  } catch (err) {
    console.error(`[CMS Service] Save page content ${pageKey} error:`, err);
  }
  return null;
}

// --- PRODUCTION CLIENTS & PROJECTS STORE ---
export async function fetchServerClients(): Promise<any[]> {
  try {
    const res = await fetch('/api/clients');
    if (res.ok) {
      const json = await res.json();
      return json.clients || [];
    }
  } catch (err) {
    console.error('[CMS Service] Fetch clients error:', err);
  }
  return [];
}

export async function saveServerClient(client: any): Promise<any> {
  try {
    const isEdit = !!client.id;
    const url = isEdit ? `/api/clients/${client.id}` : '/api/clients';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (res.ok) {
      const json = await res.json();
      return json.client;
    }
  } catch (err) {
    console.error('[CMS Service] Save client error:', err);
  }
  return null;
}

export async function deleteServerClient(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('[CMS Service] Delete client error:', err);
  }
  return false;
}

export async function fetchServerProjects(userEmail?: string, userRole?: string): Promise<any[]> {
  try {
    const headers: Record<string, string> = {};
    if (userEmail) headers['x-user-email'] = userEmail;
    if (userRole) headers['x-user-role'] = userRole;

    const res = await fetch('/api/projects', { headers });
    if (res.ok) {
      const json = await res.json();
      return json.projects || [];
    }
  } catch (err) {
    console.error('[CMS Service] Fetch projects error:', err);
  }
  return [];
}

export async function saveServerProject(project: any): Promise<any> {
  try {
    const isEdit = !!project.id;
    const url = isEdit ? `/api/projects/${project.id}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project;
    }
  } catch (err) {
    console.error('[CMS Service] Save project error:', err);
  }
  return null;
}

export async function addFilesToServerProject(projectId: string, files: any[]): Promise<any> {
  try {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project;
    }
  } catch (err) {
    console.error('[CMS Service] Add files to project error:', err);
  }
  return null;
}

export async function addRevisionToServerProject(projectId: string, revision: any): Promise<any> {
  try {
    const res = await fetch(`/api/projects/${projectId}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(revision),
    });
    if (res.ok) {
      const json = await res.json();
      return json.project;
    }
  } catch (err) {
    console.error('[CMS Service] Add revision error:', err);
  }
  return null;
}

// --- REAL STREAMING MULTIPART FILE UPLOAD WITH TRUE PROGRESS ---
export interface UploadProgressInfo {
  loaded: number;
  total: number;
  percent: number;
  speedMbps: number;
  speedFormatted: string;
  etaSeconds: number;
  etaFormatted: string;
}

export interface UploadFileOptions {
  onProgress?: (progress: UploadProgressInfo) => void;
  projectId?: string;
  userEmail?: string;
  userRole?: string;
  signal?: AbortSignal;
}

export function uploadFileWithStreamingProgress(
  file: File,
  options: UploadFileOptions = {}
): Promise<{ success: boolean; file?: any; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort();
        resolve({ success: false, error: 'Upload cancelled by user' });
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // seconds
        const bytesDiff = event.loaded - lastLoaded;

        // Instantaneous speed calculation
        let speedBytesPerSec = 0;
        if (timeDiff > 0.2) {
          speedBytesPerSec = bytesDiff / timeDiff;
          lastLoaded = event.loaded;
          lastTime = now;
        } else {
          // Average speed fallback
          const totalElapsed = (now - startTime) / 1000;
          if (totalElapsed > 0) speedBytesPerSec = event.loaded / totalElapsed;
        }

        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        const speedMbps = (speedBytesPerSec * 8) / (1024 * 1024);
        const speedFormatted = speedBytesPerSec > 1024 * 1024
          ? `${(speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
          : `${(speedBytesPerSec / 1024).toFixed(0)} KB/s`;

        const remainingBytes = event.total - event.loaded;
        const etaSeconds = speedBytesPerSec > 0 ? Math.round(remainingBytes / speedBytesPerSec) : 0;
        const etaMinutes = Math.floor(etaSeconds / 60);
        const etaSecs = etaSeconds % 60;
        const etaFormatted = `${etaMinutes.toString().padStart(2, '0')}:${etaSecs.toString().padStart(2, '0')}`;

        options.onProgress({
          loaded: event.loaded,
          total: event.total,
          percent,
          speedMbps,
          speedFormatted,
          etaSeconds,
          etaFormatted,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp.success && resp.file) {
            // Signal 100%
            if (options.onProgress) {
              options.onProgress({
                loaded: file.size,
                total: file.size,
                percent: 100,
                speedMbps: 0,
                speedFormatted: 'Complete',
                etaSeconds: 0,
                etaFormatted: '00:00',
              });
            }
            resolve({ success: true, file: resp.file });
          } else {
            resolve({ success: false, error: resp.error || 'Upload failed' });
          }
        } catch {
          resolve({ success: false, error: 'Invalid server response' });
        }
      } else {
        let errDesc = `HTTP ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.error) errDesc = parsed.error;
        } catch {}
        resolve({ success: false, error: errDesc });
      }
    };

    xhr.onerror = () => {
      resolve({ success: false, error: 'Network interruption during upload' });
    };

    xhr.ontimeout = () => {
      resolve({ success: false, error: 'Upload request timed out' });
    };

    const formData = new FormData();
    formData.append('file', file);
    if (options.projectId) formData.append('projectId', options.projectId);
    if (options.userEmail) formData.append('uploaderEmail', options.userEmail);
    if (options.userRole) formData.append('uploaderRole', options.userRole);

    xhr.open('POST', '/api/upload/file', true);
    if (options.userEmail) xhr.setRequestHeader('x-user-email', options.userEmail);
    if (options.userRole) xhr.setRequestHeader('x-user-role', options.userRole);
    if (options.projectId) xhr.setRequestHeader('x-project-id', options.projectId);

    xhr.send(formData);
  });
}
