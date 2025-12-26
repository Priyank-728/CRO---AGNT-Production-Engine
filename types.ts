// Input Types
export interface LandingPageInput {
  adPlatform: string;
  campaignObjective: 'purchase' | 'lead' | 'signup' | 'other';
  adCopy: string;
  keywords: string;
  audienceAttributes: string;
  productDetails: string;
  brandConstraints: string;
}

export interface ImageSpec {
  purpose: string;
  description: string;
}

// Output Types from AI
export interface SectionContent {
  headline: string;
  description?: string; 
  bullets?: string[];
  cta?: string;
  ribbon?: string; // Promotional banners/badges
  image?: ImageSpec; // Conceptual image placeholder
}

export interface PageSection {
  id: string; // Stable ID for feedback (e.g., "Hero", "SocialProof")
  type: string; // Semantic type
  layout: 'centered' | 'two-column' | 'grid' | 'feature-left' | 'feature-right'; // Visual hint
  content: SectionContent;
  isLocked?: boolean; // Human-in-the-loop lock
}

export interface DesignHints {
  visualStyle: string;
  contrastLevel: 'high' | 'medium' | 'low';
  spacing: 'compact' | 'generous';
  trustEmphasis: 'subtle' | 'high';
}

export interface LandingPageBlueprint {
  primaryIntent: string;
  designHints: DesignHints;
  sections: PageSection[];
}

// Feedback Schema
export interface Feedback {
  sectionId: string;
  feedbackType: 'copy_edit' | 'ux_issue' | 'clarity' | 'variant_request' | 'lock';
  comment?: string;
  priority: 'low' | 'medium' | 'high';
}

export const INITIAL_INPUT: LandingPageInput = {
  adPlatform: 'Google Ads',
  campaignObjective: 'purchase',
  adCopy: 'Stop overpaying for blades. Get a close shave for $5.',
  keywords: 'best razor for men, cheap razor blades, subscription shave',
  audienceAttributes: 'Men 25-45, value-conscious, currently using drugstore brands.',
  productDetails: 'The Executive Handle. Weighted zinc body, 5-blade german steel cartridges. Starter set $5. 100% money back guarantee.',
  brandConstraints: 'Direct, masculine but polite, minimalist design, no slang.',
};