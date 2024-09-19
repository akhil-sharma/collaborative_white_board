/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("http");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
tslib_1.__exportStar(__webpack_require__(8), exports);
tslib_1.__exportStar(__webpack_require__(9), exports);
tslib_1.__exportStar(__webpack_require__(10), exports);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToolTypes = void 0;
var ToolTypes;
(function (ToolTypes) {
    ToolTypes["LINE"] = "line";
    ToolTypes["RECTANGLE"] = "rectangle";
    ToolTypes["FREE_HAND"] = "free_hand";
    ToolTypes["CIRCLE"] = "circle";
    ToolTypes["ERASER"] = "eraser";
})(ToolTypes || (exports.ToolTypes = ToolTypes = {}));


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasEvents = void 0;
var CanvasEvents;
(function (CanvasEvents) {
    CanvasEvents["INITIALIZE_CANVAS"] = "initialize_canvas";
    CanvasEvents["UPDATE_CANVAS"] = "update_canvas";
})(CanvasEvents || (exports.CanvasEvents = CanvasEvents = {}));


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.API_URL = exports.WEB_PORT = exports.API_PORT = void 0;
exports.API_PORT = process.env['PORT_API'] || 3333;
exports.WEB_PORT = process.env['PORT_WEB'] || 3000;
exports.API_URL = `http://127.0.0.1:${exports.API_PORT}`;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const path = tslib_1.__importStar(__webpack_require__(3));
const http_1 = __webpack_require__(4);
const socket_io_1 = __webpack_require__(5);
const cors_1 = tslib_1.__importDefault(__webpack_require__(6));
const shared_1 = __webpack_require__(7);
const shared_2 = __webpack_require__(7);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*", credentials: false } });
app.use('/assets', express_1.default.static(path.join(__dirname, 'assets')));
// TODO: Move to a database
const elements = [];
// Sockets
io.on('connection', (clientSocket) => {
    console.log(`New client connected the server.`);
    clientSocket.emit(shared_2.CanvasEvents.INITIALIZE_CANVAS, elements);
    clientSocket.on(shared_2.CanvasEvents.UPDATE_CANVAS, (data) => {
        elements.push(data);
        clientSocket.broadcast.emit(shared_2.CanvasEvents.UPDATE_CANVAS, data);
    });
    clientSocket.on('disconnect', () => {
        console.log(`Client disconnected.`);
    });
});
// APIs
app.get('/api', (req, res) => {
    res.send({ message: 'Welcome to server!' });
});
httpServer.listen(shared_1.API_PORT, () => {
    console.log(`Listening at http://localhost:${shared_1.API_PORT}/api`);
});

})();

/******/ })()
;