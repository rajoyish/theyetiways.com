import type { APIRoute, GetStaticPaths } from "astro";
import { localeFeed } from "../../lib/feed";
import { langPaths } from "../../lib/routes";
import type { Locale } from "../../lib/i18n";

export const getStaticPaths: GetStaticPaths = langPaths;

export const GET: APIRoute = ({ props, site }) =>
  localeFeed(props.lang as Locale, site);
