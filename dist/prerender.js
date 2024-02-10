"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const renderer_1 = __importDefault(require("./renderer"));
const html_minifier_1 = require("html-minifier");
const path_1 = __importDefault(require("path"));
const port = 0;
const defaultSelector = "#root";
const htmlPrerender = (options) => {
    let config = null;
    return {
        configResolved: (resolvedConfig) => {
            config = resolvedConfig;
        },
        name: "vite-plugin-html-prerender",
        apply: "build",
        enforce: "post",
        async closeBundle() {
            await emitRendered(options, config);
        },
    };
};
const emitRendered = async (options, config) => {
    const server = new server_1.default(port);
    const renderer = new renderer_1.default();
    const basePath = config?.base && path_1.default.isAbsolute(config.base) ? config.base : "/";
    await server.init(options.staticDir, basePath).then(async () => {
        console.log("\n[vite-plugin-html-prerender] Starting headless browser...");
        return await renderer.init();
    }).then(async () => {
        const renderedRoutes = [];
        console.log("[vite-plugin-html-prerender] Base path for routes:", basePath);
        for (let route of options.routes) {
            console.log("[vite-plugin-html-prerender] Pre-rendering route:", route);
            renderedRoutes.push(await renderer.renderRoute(basePath, route, server.runningPort, options.selector || defaultSelector));
        }
        return renderedRoutes;
    }).then(renderedRoutes => {
        if (options.minify) {
            console.log("[vite-plugin-html-prerender] Minifying rendered HTML...");
            renderedRoutes.forEach(route => {
                route.html = (0, html_minifier_1.minify)(route.html, options.minify);
            });
        }
        return renderedRoutes;
    }).then(async (renderedRoutes) => {
        console.log("[vite-plugin-html-prerender] Saving pre-rendered routes to output...");
        for (let renderedRoute of renderedRoutes) {
            await renderer.saveToFile(options.staticDir, renderedRoute);
        }
    }).then(async () => {
        await renderer.destroy();
        await server.destroy();
        console.log("[vite-plugin-html-prerender] Pre-rendering routes completed.");
    }).catch(async (e) => {
        await renderer.destroy();
        await server.destroy();
        console.error("[vite-plugin-html-prerender] Failed to prerender routes:", e);
    });
};
exports.default = htmlPrerender;
