/**
 * Site-wide constants for The Yeti Ways.
 *
 * Only things that are the same in every language live here: the name, the
 * domain, the email, the channel URLs, the category keys. Everything a reader
 * actually reads comes from `src/lib/ui/<locale>.ts`, and the localized nav and
 * footer are assembled in `src/lib/nav.ts`.
 */

export const SITE = {
  name: "The Yeti Ways",
  domain: "theyetiways.com",
  url: "https://theyetiways.com",
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
 * Category keys. These are the English names, stored verbatim in post
 * frontmatter and used as the lookup key for every locale's label and slug.
 * Renaming one is a content migration, not a translation.
 */
export const CATEGORIES = [
  "Family",
  "Relationships",
  "Parenting",
  "Growing Up",
  "Life Lessons",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SOCIAL_CHANNELS = [
  { label: "Facebook", href: "https://www.facebook.com/TheYetiWays" },
  { label: "YouTube", href: "https://www.youtube.com/@TheYetiWays" },
  { label: "TikTok", href: "https://www.tiktok.com/@the.yeti.ways" },
] as const;

/** Family member ids, in the order they appear in the footer. */
export const FAMILY_IDS = ["papa-yeti", "mama-yeti", "babu-yeti"] as const;
