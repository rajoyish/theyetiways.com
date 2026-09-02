import type { APIRoute } from "astro";
import { localeSearchIndex } from "../lib/search-index";
import { DEFAULT_LOCALE } from "../lib/i18n";

export const GET: APIRoute = () => localeSearchIndex(DEFAULT_LOCALE);
