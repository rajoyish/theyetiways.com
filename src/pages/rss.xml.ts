import type { APIRoute } from "astro";
import { localeFeed } from "../lib/feed";
import { DEFAULT_LOCALE } from "../lib/i18n";

export const GET: APIRoute = ({ site }) => localeFeed(DEFAULT_LOCALE, site);
