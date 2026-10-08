export type TrendingCategory = 
  | 'All' 
  | 'US News' 
  | 'Immigration' 
  | 'Technology' 
  | 'AI' 
  | 'Business' 
  | 'Jobs & Careers' 
  | 'Entertainment' 
  | 'Trending';

export interface ArticleSource {
  title: string;
  url: string;
}

export interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown or rich HTML-like formatted text
  category: TrendingCategory;
  featuredImage: string;
  imageCaption?: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  tags: string[];
  sources: ArticleSource[];
  featured?: boolean;
  factStatus: 'Confirmed Policy & Legal Update' | 'Official Government Announcement' | 'Industry & Tech Report' | 'Market Analysis & Data';
  keyTakeaways: string[];
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  relatedSlugs?: string[];
}

export const TRENDING_CATEGORIES: TrendingCategory[] = [
  'All',
  'US News',
  'Immigration',
  'Technology',
  'AI',
  'Business',
  'Jobs & Careers',
  'Entertainment',
  'Trending'
];

export const TRENDING_ARTICLES: TrendingArticle[] = [
  {
    id: 'h1b-visa-2026-latest-update',
    title: 'H-1B Visa 2026: Latest Rules, Fees and What Workers Need to Know',
    slug: 'h1b-visa-2026-latest-update',
    excerpt: 'A detailed breakdown of the latest USCIS rules, lottery registration guidelines, filing fee adjustments, and key compliance requirements for specialty occupation workers and US employers.',
    content: `
The United States Citizenship and Immigration Services (USCIS) has implemented updated regulatory frameworks governing the fiscal year (FY) 2026 H-1B cap season. These changes aim to modernize the specialty occupation visa process, improve selection integrity, and enforce stricter wage transparency.

### Key Regulatory Changes for FY 2026

1. **Beneficiary-Centric Selection Process**
USCIS continues its beneficiary-centric selection model. Under this system, each unique individual beneficiary is entered into the lottery selection pool exactly once, regardless of how many registrations are submitted on their behalf by different employers. This measure significantly reduces fraudulent multiple registrations and levels the playing field for qualified applicants.

2. **Updated Fee Structure & Asylum Program Fee**
Employers submitting H-1B petitions must account for adjusted filing fees, including the Asylum Program Fee mandated under recent USCIS fee schedule updates. Small businesses and non-profit organizations qualify for reduced fee tiers, while cap-subject employers should review the exact breakdown prior to petition submission.

3. **Specialty Occupation Criteria Clarifications**
The Department of Homeland Security (DHS) has provided updated guidance regarding the definition of a "specialty occupation." A bachelor's degree or higher (or equivalent) in a directly related specific specialty remains required. General degrees without specialized coursework may face heightened scrutiny during adjudication.

4. **Employer Compliance & Site Visits**
USCIS Fraud Detection and National Security (FDNS) directorate continues routine, unannounced workplace site visits—both physical and virtual—to verify remote work arrangements, wage compliance, and job duties outlined in the certified Labor Condition Application (LCA).

### Timeline for Employers and Applicants

- **March 2026**: Electronic registration window opens for employers.
- **Late March 2026**: USCIS conducts random lottery selection and notifies designated representatives.
- **April 1, 2026**: Earliest date for employers to file cap-subject H-1B petitions for selected beneficiaries.
- **October 1, 2026**: Earliest official start date for approved H-1B status for FY 2026.

### Summary Checklist for H-1B Applicants

Employers and international professionals should ensure that:
- Labor Condition Applications (LCAs) accurately reflect all work locations, including remote home offices.
- Educational credential evaluations match required US degree equivalencies.
- Filing fee checks or electronic payments align with the current USCIS Fee Schedule.
    `,
    category: 'Immigration',
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'USCIS Headquarters in Washington D.C. - Official immigration and visa regulations.',
    author: {
      name: 'FEVIQO Policy Research Team',
      role: 'Immigration & Regulatory Affairs Desk',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    },
    publishedAt: '2026-10-07',
    updatedAt: '2026-10-08',
    readingTime: '5 min read',
    tags: ['H-1B Visa', 'USCIS', 'US Immigration', 'Work Visa', 'Specialty Occupation'],
    sources: [
      { title: 'USCIS Official H-1B Specialty Occupations Guide', url: 'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations' },
      { title: 'U.S. Department of Homeland Security Fee Schedule', url: 'https://www.dhs.gov' }
    ],
    featured: true,
    factStatus: 'Confirmed Policy & Legal Update',
    keyTakeaways: [
      'Beneficiary-centric lottery selection prevents multiple registrations for a single individual.',
      'Updated USCIS fee schedule includes mandatory Asylum Program Fees for employers.',
      'Specialty occupation definitions require direct alignment between degree coursework and job duties.',
      'Remote work locations must be accurately documented on the LCA and petition.'
    ],
    seoTitle: 'H-1B Visa 2026: Latest Rules, Fees & What Workers Need to Know | FEVIQO Trending',
    seoDescription: 'Complete guide to H-1B Visa 2026 rules, USCIS registration dates, fee updates, and specialty occupation guidelines. Read official immigration policy analysis on FEVIQO.',
    focusKeyword: 'H-1B Visa 2026',
    relatedSlugs: ['us-immigration-updates-this-week', 'tech-job-market-2026-hiring-trends']
  },
  {
    id: 'us-immigration-updates-this-week',
    title: 'US Immigration Updates: What Changed This Week?',
    slug: 'us-immigration-updates-this-week',
    excerpt: 'A weekly roundup of federal policy updates, Department of State Visa Bulletin movements, processing time adjustments, and executive directives impacting international professionals.',
    content: `
This week brought key policy announcements and operational updates across multiple federal immigration agencies, affecting employment-based green cards, student visas, and travel authorization programs.

### 1. Department of State Visa Bulletin Trends
The Department of State (DOS) released the latest Visa Bulletin, detailing Final Action Dates and Dates for Filing across Employment-Based (EB-1, EB-2, EB-3) preference categories. Applicants holding approved I-140 petitions are advised to monitor priority date movements closely to determine eligibility for Form I-485 adjustment of status filings.

### 2. Premium Processing Expansion
USCIS has expanded expedited Premium Processing service options for additional Form I-539 applications (Change/Extension of Nonimmigrant Status) and Form I-765 Employment Authorization Documents (EADs) for specific F-1 OPT and STEM OPT students.

### 3. State Department Consular Scheduling
U.S. embassies and consulates worldwide report continued improvements in interview wait times for non-immigrant work visas (H-1B, L-1, O-1). However, applicants in high-volume consular posts are encouraged to schedule appointments well in advance of intended travel dates.

### Distinguishing Confirmed Rules from Proposed Policies

- **Confirmed Policy**: USCIS expansion of online filing and digital fee payment systems.
- **Pending/Proposed**: Legislative proposals in Congress regarding annual visa cap increases remain in committee review and are not yet law.
    `,
    category: 'Immigration',
    featuredImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'U.S. passport and official travel documents.',
    author: {
      name: 'FEVIQO Policy Research Team',
      role: 'Immigration & Policy Desk',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    publishedAt: '2026-10-06',
    updatedAt: '2026-10-08',
    readingTime: '4 min read',
    tags: ['US Immigration', 'Visa Bulletin', 'Green Card', 'USCIS', 'Work Permits'],
    sources: [
      { title: 'U.S. Department of State Official Visa Bulletin', url: 'https://travel.state.gov' },
      { title: 'USCIS Newsroom & Announcements', url: 'https://www.uscis.gov/newsroom' }
    ],
    featured: false,
    factStatus: 'Official Government Announcement',
    keyTakeaways: [
      'Latest Visa Bulletin shows priority date shifts for EB-2 and EB-3 employment-based categories.',
      'Premium Processing now available for select F-1 OPT and I-539 applicant pools.',
      'Consular interview wait times are stabilizing across major diplomatic missions.'
    ],
    seoTitle: 'US Immigration Updates: What Changed This Week? | FEVIQO Trending',
    seoDescription: 'Latest U.S. immigration news, Visa Bulletin priority dates, USCIS processing times, and employment-based policy updates analyzed by FEVIQO.',
    focusKeyword: 'US Immigration Updates',
    relatedSlugs: ['h1b-visa-2026-latest-update', 'tech-job-market-2026-hiring-trends']
  },
  {
    id: 'latest-ai-news-major-developments',
    title: 'Latest AI News and Major Developments: Multimodal Autonomous Agents',
    slug: 'latest-ai-news-major-developments',
    excerpt: 'An overview of technological breakthroughs in multimodal AI, autonomous reasoning agents, video generation pipelines, and enterprise deployment frameworks.',
    content: `
The artificial intelligence landscape continues to evolve rapidly, with breakthroughs in multimodal reasoning, real-time voice synthesis, and autonomous agent orchestration defining the current engineering state-of-the-art.

### 1. Multimodal Reasoning and Spatial Understanding
Leading AI research labs have released updated model architectures capable of processing text, code, high-resolution video, and audio streams in a single unified context window. These models enable complex visual analysis, legal document synthesis, and automated code refactoring with reduced hallucination rates.

### 2. Autonomous AI Agents in Creative Production
In creative industries and post-production, AI tools are transforming asset management, automated captioning, color grading, and localized audio dubbing. Rather than replacing human artistry, these systems act as force multipliers, allowing creative teams to iterate faster and produce localized content at scale.

### 3. Responsible AI & Governance Standards
International standards bodies and enterprise compliance teams are standardizing safety evaluations, watermark verification, and synthetic media provenance protocols (C2PA). These frameworks ensure ethical deployment while protecting copyright and intellectual property.

### Industry Impact Overview

- **Video & Media Creation**: Real-time rendering pipelines enable localized subtitle generation and automated scene segmentation.
- **Enterprise Automation**: API-driven AI workflows reduce manual data extraction time by over 70%.
- **Developer Ecosystems**: Open-weights models and specialized TypeScript SDKs lower the barrier to building custom enterprise agents.
    `,
    category: 'AI',
    featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Advanced neural network and artificial intelligence data processing visualization.',
    author: {
      name: 'FEVIQO Tech & AI Innovation Lab',
      role: 'AI & Media Production Desk',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
    },
    publishedAt: '2026-10-05',
    updatedAt: '2026-10-08',
    readingTime: '6 min read',
    tags: ['Artificial Intelligence', 'Multimodal AI', 'AI News', 'Machine Learning', 'Media Tech'],
    sources: [
      { title: 'Google AI Research Blog', url: 'https://ai.googleblog.com' },
      { title: 'C2PA Content Provenance Standards', url: 'https://c2pa.org' }
    ],
    featured: false,
    factStatus: 'Industry & Tech Report',
    keyTakeaways: [
      'Multimodal models now seamlessly process video, audio, code, and text in real-time.',
      'Autonomous AI workflows are accelerating post-production and creative editing timelines.',
      'Industry standards like C2PA provide verification and provenance for synthetic media.'
    ],
    seoTitle: 'Latest AI News & Major Developments 2026 | FEVIQO Trending',
    seoDescription: 'Explore the latest AI news, multimodal foundation models, autonomous agents, and media technology trends published on FEVIQO Trending.',
    focusKeyword: 'Latest AI News',
    relatedSlugs: ['tech-job-market-2026-hiring-trends', 'business-startup-funding-trends']
  },
  {
    id: 'tech-job-market-2026-hiring-trends',
    title: 'Tech & Remote Job Market 2026: Hiring Trends and In-Demand Skills',
    slug: 'tech-job-market-2026-hiring-trends',
    excerpt: 'Data-backed analysis of technology hiring, remote work compensation models, AI engineering demand, and key skills sought by top employers.',
    content: `
The technology employment sector has shifted toward specialized technical roles, hybrid operational frameworks, and productivity-focused engineering teams. This report highlights key hiring dynamics across software engineering, video production, and AI operations.

### High-Demand Technical Disciplines

1. **AI Operations & Full-Stack AI Engineers**
Organizations are heavily recruiting software engineers skilled in agentic frameworks, vector databases, and real-time API integrations.

2. **Digital Media & Video Content Producers**
With short-form and long-form video dominating brand marketing, companies are expanding dedicated internal and agency post-production pods to maintain consistent content velocity.

3. **Cybersecurity & Cloud Infrastructure**
Zero-trust security models, cloud cost optimization, and compliance automation remain top priorities for enterprise CTOs.

### Remote & Hybrid Work Policies

While many firms have established structured hybrid requirements (2-3 days in office), remote roles remain highly competitive for senior individual contributors and international specialized talent.
    `,
    category: 'Jobs & Careers',
    featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Modern technology team collaborating on software development and creative media.',
    author: {
      name: 'FEVIQO Careers Editorial Desk',
      role: 'Workforce & Talent Analytics',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'
    },
    publishedAt: '2026-10-04',
    updatedAt: '2026-10-08',
    readingTime: '5 min read',
    tags: ['Tech Jobs', 'Remote Work', 'Careers', 'AI Jobs', 'Hiring Trends'],
    sources: [
      { title: 'U.S. Bureau of Labor Statistics Employment Projections', url: 'https://www.bls.gov' }
    ],
    featured: false,
    factStatus: 'Market Analysis & Data',
    keyTakeaways: [
      'AI engineering, cloud security, and video production roles lead tech hiring growth.',
      'Hybrid work policies remain standard, with remote options offering competitive access to top talent.'
    ],
    seoTitle: 'Tech & Remote Job Market 2026: Hiring Trends & Skills | FEVIQO Trending',
    seoDescription: 'In-depth report on tech hiring, remote job opportunities, in-demand AI skills, and compensation trends on FEVIQO Trending.',
    focusKeyword: 'Tech Job Market 2026',
    relatedSlugs: ['latest-ai-news-major-developments', 'h1b-visa-2026-latest-update']
  },
  {
    id: 'business-startup-funding-trends',
    title: 'Business & Startup Funding Trends: What Investors Are Prioritizing',
    slug: 'business-startup-funding-trends',
    excerpt: 'An analysis of venture capital deployment, founder profitability metrics, B2B SaaS valuations, and media monetization models.',
    content: `
Venture capital and private equity investors are prioritizing sustainable unit economics, clear paths to profitability, and high customer retention over unconstrained top-line growth.

### What Investors Look For in 2026

- **Strong Retention & Low Churn**: High net revenue retention (NRR) and proven product-market fit.
- **AI Integration with Moats**: Proprietary datasets, specialized vertical workflows, and integrated user experience platforms.
- **Efficient Marketing & Video Content**: Lower customer acquisition cost (CAC) through high-retention video marketing and organic authority.
    `,
    category: 'Business',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    imageCaption: 'Financial growth charts and business analytics dashboard.',
    author: {
      name: 'FEVIQO Business Editorial Desk',
      role: 'Capital & Growth Intelligence',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop'
    },
    publishedAt: '2026-10-02',
    updatedAt: '2026-10-08',
    readingTime: '4 min read',
    tags: ['Business', 'Startups', 'Venture Capital', 'SaaS', 'Marketing CAC'],
    sources: [
      { title: 'NVCA National Venture Capital Association Reports', url: 'https://nvca.org' }
    ],
    featured: false,
    factStatus: 'Market Analysis & Data',
    keyTakeaways: [
      'Venture capital favors sustainable profitability and strong customer retention.',
      'High-converting video content lowers CAC for B2B and DTC brands.'
    ],
    seoTitle: 'Business & Startup Funding Trends 2026 | FEVIQO Trending',
    seoDescription: 'Discover latest venture capital insights, startup funding trends, and founder growth strategies on FEVIQO Trending.',
    focusKeyword: 'Startup Funding Trends',
    relatedSlugs: ['tech-job-market-2026-hiring-trends', 'latest-ai-news-major-developments']
  }
];

export function getArticleBySlug(slug: string): TrendingArticle | undefined {
  const cleanSlug = slug.toLowerCase().trim();
  return TRENDING_ARTICLES.find(article => article.slug.toLowerCase() === cleanSlug);
}

export function getArticlesByCategory(category: TrendingCategory): TrendingArticle[] {
  if (category === 'All' || category === 'Trending') {
    return TRENDING_ARTICLES;
  }
  return TRENDING_ARTICLES.filter(article => article.category === category);
}
