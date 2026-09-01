/** Site-wide constants for The Yeti Ways. */

export const SITE = {
  name: "The Yeti Ways",
  domain: "theyetiways.com",
  url: "https://theyetiways.com",
  motto:
    "We might be Yetis, but our ways are warm. ❄️❤️ Big hearts. Thick fur. Good vibes.",
  tagline: "Warm life lessons from a family of Yetis.",
  description:
    "The Yeti Ways is a family blog co-authored by Papa, Mama, and Babu Yeti — warm, honest stories about family, relationships, parenting, and growing up, each one built around a video from our channels.",
} as const;

/**
 * How readers reach the family, and when the legal pages were last reviewed.
 * Both the contact page and the policy pages read from here, so the address
 * and the "last updated" line only ever change in one place.
 */
export const CONTACT = {
  email: "hello@theyetiways.com",
  legalUpdated: new Date("2026-08-30T00:00:00Z"),
} as const;

/**
 * Story dates read in the family's own timezone, so a post never looks like it
 * landed a day early. Both `FormattedDate` and the search index use this.
 */
export function formatStoryDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Stories", href: "/blog" },
  { label: "The Family", href: "/authors" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const CATEGORIES = [
  "Family",
  "Relationships",
  "Parenting",
  "Growing Up",
  "Life Lessons",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** URL-safe slug for a category ("Growing Up" -> "growing-up"). */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

/** Reverse of `categorySlug` against the known list. */
export function categoryFromSlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => categorySlug(c) === slug);
}

export const SOCIAL_CHANNELS = [
  { label: "Facebook", href: "https://www.facebook.com/TheYetiWays" },
  { label: "YouTube", href: "https://www.youtube.com/@TheYetiWays" },
  { label: "TikTok", href: "https://www.tiktok.com/@the.yeti.ways" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { label: "All stories", href: "/blog" },
      { label: "Search", href: "/search" },
      { label: "Family", href: "/categories/family" },
      { label: "Relationships", href: "/categories/relationships" },
      { label: "Parenting", href: "/categories/parenting" },
      { label: "Growing Up", href: "/categories/growing-up" },
      { label: "Life Lessons", href: "/categories/life-lessons" },
    ],
  },
  {
    heading: "The Family",
    links: [
      { label: "Papa Yeti", href: "/authors/papa-yeti" },
      { label: "Mama Yeti", href: "/authors/mama-yeti" },
      { label: "Babu Yeti", href: "/authors/babu-yeti" },
    ],
  },
  {
    heading: "Follow",
    links: [...SOCIAL_CHANNELS],
  },
  {
    heading: "More",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "RSS feed", href: "/rss.xml" },
    ],
  },
] as const;
