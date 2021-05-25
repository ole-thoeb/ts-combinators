"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbgB = exports.dbg = exports.ignore = exports.keep = exports.LambdaParser = exports.Parser = exports.ParserState = void 0;
const result_1 = require("./result");
class ParserState {
    constructor(src, location) {
        this.src = src;
        this.location = location;
    }
    get offset() {
        return this.location.offset;
    }
    get row() {
        return this.location.row;
    }
    get col() {
        return this.location.col;
    }
    charAt(additionalOffset) {
        const targetOffset = this.offset + additionalOffset;
        if (targetOffset < this.src.length)
            return this.src[targetOffset];
        return null;
    }
    updateLocation(newLocation) {
        return new ParserState(this.src, newLocation);
    }
    bumpBy(n) {
        return new ParserState(this.src, { offset: this.offset + n, col: this.col + n, row: this.row });
    }
}
exports.ParserState = ParserState;
function foldParsStep(step, onGood, onBad) {
    switch (step._tag) {
        case "good": {
            return onGood(step);
        }
        case "bad": {
            return onBad(step);
        }
    }
}
class Parser {
    constructor() {
    }
    map(mapper) {
        return this.mapStepGood(step => (Object.assign(Object.assign({}, step), { value: mapper(step.value) })));
    }
    map2(parser2, mapper) {
        return new Map2Parser(this, parser2, mapper);
    }
    apply(f) {
        return f(this);
    }
    parse(src) {
        return foldParsStep(this.doPars(new ParserState(src, { offset: 0, row: 1, col: 1 })), good => result_1.Result.ok(good.value), bad => result_1.Result.err(bad.errors));
    }
    // =================
    // Utilities
    //=================
    mapStep(onGood, onBad) {
        return new MapParser(this, onGood, onBad);
    }
    mapStepGood(onGood) {
        return this.mapStep(onGood, step => step);
    }
}
exports.Parser = Parser;
class LambdaParser extends Parser {
    constructor(tag, func) {
        super();
        this.tag = tag;
        this.func = func;
    }
    doPars(state) {
        return this.func(state);
    }
}
exports.LambdaParser = LambdaParser;
function keep(argParser) {
    return funcParser => funcParser.map2(argParser, (func, arg) => func(arg));
}
exports.keep = keep;
function ignore(ignoreParser) {
    return resultParser => resultParser.map2(ignoreParser, (a) => a);
}
exports.ignore = ignore;
class MapParser extends Parser {
    constructor(inner, onGood, onBad) {
        super();
        this.inner = inner;
        this.onGood = onGood;
        this.onBad = onBad;
    }
    doPars(state) {
        return foldParsStep(this.inner.doPars(state), this.onGood, this.onBad);
    }
}
class Map2Parser extends Parser {
    constructor(first, second, mapper) {
        super();
        this.first = first;
        this.second = second;
        this.mapper = mapper;
    }
    doPars(state) {
        return foldParsStep(this.first.doPars(state), step1 => foldParsStep(this.second.doPars(step1.state), step2 => (Object.assign(Object.assign({}, step2), { value: this.mapper(step1.value, step2.value), backtrack: step1.backtrack && step2.backtrack })), step2 => (Object.assign(Object.assign({}, step2), { backtrack: step1.backtrack && step2.backtrack }))), bad => bad);
    }
}
class DebugParser extends Parser {
    constructor(inner, msgB, msg) {
        super();
        this.inner = inner;
        this.msgB = msgB;
        this.msg = msg;
    }
    doPars(state) {
        if (this.msgB)
            console.log(this.msgB(state));
        const step = this.inner.doPars(state);
        if (this.msg)
            console.log(this.msg(step));
        return step;
    }
}
function dbg(msg) {
    return parser => new DebugParser(parser, undefined, msg);
}
exports.dbg = dbg;
function dbgB(msg) {
    return parser => new DebugParser(parser, msg);
}
exports.dbgB = dbgB;
//# sourceMappingURL=parser.js.map