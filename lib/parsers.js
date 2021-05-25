"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.succeed2 = exports.succeed = exports.spaces = exports.chompWhile = exports.number = exports.int = exports.token = void 0;
const parser_1 = require("./parser");
const result_1 = require("./result");
const stringUtil_1 = require("./util/stringUtil");
const curry_1 = require("./util/curry");
class TokenParser extends parser_1.Parser {
    constructor(token, expecting) {
        super();
        this.token = token;
        this.expecting = expecting;
    }
    doPars(state) {
        const newLocation = isSubString(state, this.token);
        if (newLocation)
            return {
                _tag: "good",
                value: this.token,
                backtrack: token.length == 0,
                state: state.updateLocation(newLocation)
            };
        return {
            _tag: "bad", backtrack: true,
            errors: [Object.assign(Object.assign({}, this.expecting), { location: state.location })]
        };
    }
}
function token(token) {
    return new TokenParser(token, {
        _tag: "expectedToken",
        expected: token
    });
}
exports.token = token;
function int() {
    const expecting = { _tag: "expectedInt" };
    return number(result_1.Result.ok(n => n), result_1.Result.err(expecting), expecting);
}
exports.int = int;
class NumberParser extends parser_1.Parser {
    constructor(int, float, expecting) {
        super();
        this.int = int;
        this.float = float;
        this.expecting = expecting;
    }
    doPars(state) {
        let i = 0;
        let dotFound = false;
        let consumedStr = "";
        let nextChar = state.charAt(i);
        while (true) {
            if (nextChar === null) {
                break;
            }
            else if (stringUtil_1.isDigit(nextChar)) {
                consumedStr += nextChar;
            }
            else if (!dotFound && nextChar === ".") {
                consumedStr += nextChar;
                dotFound = true;
            }
            else {
                break;
            }
            i++;
            nextChar = state.charAt(i);
        }
        // throw out trailing dot
        let numberStr = consumedStr;
        if (consumedStr.charAt(consumedStr.length - 1) === '.') {
            i--;
            dotFound = false;
            consumedStr.substring(0, consumedStr.length - 1);
        }
        const newState = state.bumpBy(i);
        const madeProgress = i != 0;
        if (!numberStr) {
            return { _tag: "bad", errors: [Object.assign(Object.assign({}, this.expecting), { location: newState })], backtrack: !madeProgress };
        }
        const finalize = (result, number) => {
            return result.fold(func => ({ _tag: "good", value: func(number), backtrack: false, state: newState }), expecting => ({ _tag: "bad", errors: [Object.assign(Object.assign({}, expecting), { location: newState.location })], backtrack: false }));
        };
        if (!dotFound)
            return finalize(this.int, Number.parseInt(numberStr));
        else
            return finalize(this.float, Number.parseFloat(numberStr));
    }
}
function number(int, float, expecting) {
    return new NumberParser(int, float, expecting);
}
exports.number = number;
function chompWhile(isGood) {
    return new parser_1.LambdaParser("chompWhile", state => {
        let i = 0;
        let row = state.row;
        let col = state.col;
        let nextChar = state.charAt(i);
        while (nextChar != null && isGood(nextChar)) {
            switch (state.charAt(i)) {
                case "\n": {
                    row++;
                    col = 1;
                    break;
                }
                default: {
                    col++;
                    break;
                }
            }
            i++;
            nextChar = state.charAt(i);
        }
        const newLocation = { offset: state.offset + i, row, col };
        return { _tag: "good", value: undefined, backtrack: i == 0, state: state.updateLocation(newLocation) };
    });
}
exports.chompWhile = chompWhile;
function spaces() {
    return chompWhile(stringUtil_1.isWhitespace);
}
exports.spaces = spaces;
function succeed(value) {
    return new parser_1.LambdaParser("succeed", state => ({ _tag: "good", state, backtrack: true, value: value }));
}
exports.succeed = succeed;
function succeed2(fn) {
    return succeed(curry_1.curry(fn));
}
exports.succeed2 = succeed2;
function isSubString(state, subString) {
    let i = 0;
    let row = state.row;
    let col = state.col;
    while (i < subString.length && state.charAt(i) === subString[i]) {
        if (state.charAt(i) === "\n") {
            row++;
            col = 1;
        }
        else {
            col++;
        }
        i++;
    }
    if (i == subString.length)
        return { offset: state.offset + i, row, col };
    return null;
}
//# sourceMappingURL=parsers.js.map