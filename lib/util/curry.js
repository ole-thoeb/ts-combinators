"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curry = void 0;
function curry(fn) {
    switch (fn.length) {
        case 1: return fn;
        case 2: return (a) => (b) => fn(a, b);
        case 3: return (a) => (b) => (c) => fn(a, b, c);
        case 4: return (a) => (b) => (c) => (d) => fn(a, b, c, d);
        case 5: return (a) => (b) => (c) => (d) => (e) => fn(a, b, c, d, e);
        case 6: return (a) => (b) => (c) => (d) => (e) => (f) => fn(a, b, c, d, e, f);
        case 7: return (a) => (b) => (c) => (d) => (e) => (f) => (g) => fn(a, b, c, d, e, f, g);
        default: throw new Error(`Can't curry functions with more than ${fn.length} arguments`);
    }
}
exports.curry = curry;
//# sourceMappingURL=curry.js.map