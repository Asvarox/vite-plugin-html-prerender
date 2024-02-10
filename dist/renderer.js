"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Renderer {
    _browser;
    async init() {
        const options = {
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        };
        this._browser = await puppeteer_1.default.launch(options);
    }
    async destroy() {
        await this._browser?.close();
    }
    async renderRoute(basePath, route, port, selector) {
        if (!this._browser) {
            throw Error("Headless browser instance not started. Failed to prerender.");
        }
        const page = await this._browser.newPage();
        await page.goto(`http://localhost:${port}${path_1.default.join(basePath, route)}`);
        await page.waitForSelector(selector, { timeout: 10000 });
        const html = await page.content();
        return { route, html };
    }
    async saveToFile(staticDir, renderedRoute) {
        const target = path_1.default.join(staticDir, renderedRoute.route, "index.html");
        const directory = path_1.default.dirname(target);
        if (!fs_1.default.existsSync(directory)) {
            fs_1.default.mkdirSync(directory, { recursive: true });
        }
        fs_1.default.writeFileSync(target, renderedRoute.html);
    }
}
exports.default = Renderer;
