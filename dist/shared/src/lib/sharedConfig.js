"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = exports.WEB_PORT = exports.API_PORT = void 0;
exports.API_PORT = process.env['PORT_API'] || 3333;
exports.WEB_PORT = process.env['PORT_WEB'] || 3000;
exports.API_URL = `http://127.0.0.1:${exports.API_PORT}`;
//# sourceMappingURL=sharedConfig.js.map