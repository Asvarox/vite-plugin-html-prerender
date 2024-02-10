import type { Plugin } from "vite";
import { HtmlPrerenderOptions } from "./types";
declare const htmlPrerender: (options: HtmlPrerenderOptions) => Plugin;
export default htmlPrerender;
