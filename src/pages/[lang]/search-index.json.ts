import type { APIRoute, GetStaticPaths } from "astro";
import { localeSearchIndex } from "../../lib/search-index";
import { langPaths } from "../../lib/routes";
import type { Locale } from "../../lib/i18n";

export const getStaticPaths: GetStaticPaths = langPaths;

export const GET: APIRoute = ({ props }) =>
  localeSearchIndex(props.lang as Locale);
