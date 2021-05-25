"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDigit = exports.isWhitespace = void 0;
exports.isWhitespace = (c) => c === " " || c === "\n" || c === "\t" || c === "\r";
exports.isDigit = (c) => c >= '0' && c <= '9';
//# sourceMappingURL=stringUtil.js.map