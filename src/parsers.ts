import {LambdaParser, Location, Parser, ParserState, ParsStep} from "./parser";
import {Result} from "./result";
import {isDigit, isWhitespace} from "./util/stringUtil";
import {curry} from "./util/curry";

interface ExpectedToken {
    readonly _tag: "expectedToken"
    readonly expected: string
}

interface ExpectedInt {
    readonly _tag: "expectedInt"
}

export type ParsError = ExpectedToken | ExpectedInt

class TokenParser<E> extends Parser<string, E> {
    private readonly token: string
    private readonly expecting: E

    constructor(token: string, expecting: E) {
        super()
        this.token = token;
        this.expecting = expecting;
    }

    doPars(state: ParserState): ParsStep<string, E> {
        const newLocation = isSubString(state, this.token)
        if (newLocation)
            return {
                _tag: "good",
                value: this.token,
                backtrack: token.length == 0,
                state: state.updateLocation(newLocation)
            }
        return {
            _tag: "bad", backtrack: true, errors: [{
                ...this.expecting, location: state.location
            }]
        }
    }
}

export function token(token: string): Parser<string, ParsError> {
    return new TokenParser(token, {
        _tag: "expectedToken",
        expected: token
    })
}

export function int(): Parser<number, ParsError> {
    const expecting: ExpectedInt = {_tag: "expectedInt"}
    return number(Result.ok(n => n), Result.err(expecting), expecting)
}

class NumberParser<A, E> extends Parser<A, E> {
    private readonly int: Result<(n: number) => A, E>
    private readonly float: Result<(n: number) => A, E>
    private readonly expecting: E

    constructor(
        int: Result<(n: number) => A, E>,
        float: Result<(n: number) => A, E>,
        expecting: E
    ) {
        super();
        this.int = int
        this.float = float
        this.expecting = expecting
    }

    doPars(state: ParserState): ParsStep<A, E> {
        let i = 0
        let dotFound = false
        let consumedStr = ""

        let nextChar = state.charAt(i)
        while (true) {
            if (nextChar === null) {
                break
            } else if (isDigit(nextChar)) {
                consumedStr += nextChar
            } else if (!dotFound && nextChar === ".") {
                consumedStr += nextChar
                dotFound = true
            } else {
                break
            }
            i++
            nextChar = state.charAt(i)
        }

        // throw out trailing dot
        let numberStr = consumedStr
        if (consumedStr.charAt(consumedStr.length - 1) === '.') {
            i--
            dotFound = false
            consumedStr.substring(0, consumedStr.length - 1)
        }
        const newState = state.bumpBy(i)
        const madeProgress = i != 0
        if (!numberStr) {
            return {_tag: "bad", errors: [{...this.expecting, location: newState}], backtrack: !madeProgress}
        }

        const finalize = (result: Result<(n: number) => A, E>, number: number): ParsStep<A, E> => {
            return result.fold<ParsStep<A, E>>(
                func => ({_tag: "good", value: func(number), backtrack: false, state: newState}),
                expecting => ({_tag: "bad", errors: [{...expecting, location: newState.location}], backtrack: false})
            )
        }
        if (!dotFound)
            return finalize(this.int, Number.parseInt(numberStr))
        else
            return finalize(this.float, Number.parseFloat(numberStr))
    }

}

export function number<A, E>(
    int: Result<(n: number) => A, E>,
    float: Result<(n: number) => A, E>,
    expecting: E,
): Parser<A, E> {
    return new NumberParser(int, float, expecting)
}

export function chompWhile<E>(isGood: (char: string) => boolean): Parser<void, E> {
    return new LambdaParser("chompWhile", state => {
        let i = 0
        let row = state.row
        let col = state.col
        let nextChar = state.charAt(i)
        while (nextChar != null && isGood(nextChar)) {
            switch (state.charAt(i)) {
                case "\n": {
                    row++
                    col = 1
                    break
                }
                default: {
                    col++
                    break
                }
            }
            i++
            nextChar = state.charAt(i)
        }
        const newLocation = {offset: state.offset + i, row, col}
        return {_tag: "good", value: undefined, backtrack: i == 0, state: state.updateLocation(newLocation)}
    })
}

export function spaces<E>(): Parser<void, E> {
    return chompWhile(isWhitespace)
}

export function succeed<A>(value: A): Parser<A, never> {
    return new LambdaParser("succeed", state => ({_tag: "good", state, backtrack: true, value: value}))
}

export function succeed2<A, B, C>(fn: (a: A, b: B) => C): Parser<(a: A) => (b: B) => C, never> {
    return succeed(curry(fn))
}

function isSubString(state: ParserState, subString: string): Location | null {
    let i = 0
    let row = state.row
    let col = state.col
    while (i < subString.length && state.charAt(i) === subString[i]) {
        if (state.charAt(i) === "\n") {
            row++
            col = 1
        } else {
            col++
        }
        i++
    }
    if (i == subString.length)
        return {offset: state.offset + i, row, col}
    return null
}
