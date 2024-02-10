"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class Server {
    runningPort = 0;
    _port;
    _server;
    _instance;
    constructor(port) {
        this._port = port;
        this._server = (0, express_1.default)();
    }
    init(dir, basePath) {
        this._server.use(basePath, express_1.default.static(dir, { dotfiles: "allow" }));
        this._server.get("*", (_req, res) => res.sendFile(path_1.default.join(dir, "index.html")));
        return new Promise(resolve => {
            this._instance = this._server.listen(this._port, () => {
                this.runningPort = (this._instance?.address()).port;
                resolve();
            });
        });
    }
    async destroy() {
        return new Promise(resolve => {
            this._instance?.close(() => resolve());
        });
    }
}
exports.default = Server;
