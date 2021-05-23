import {Result} from "./result";

export class ParserState {
    readonly location: Location
    readonly src: string

    constructor(src: string, location: Location) {
        this.src = src
        this.location = location
    }

    get offset() {
        return this.location.offset
    }

    get row() {
        return this.location.row
    }

    get col() {
        return this.location.col
    }

    charAt(additionalOffset: number): string | null {
        const targetOffset = this.offset + additionalOffset
        if (targetOffset < this.src.length)
            return this.src[targetOffset]
        return null
    }

    updateLocation(newLocation: Location): ParserState {
        return new ParserState(this.src, newLocation)
    }

    bumpBy(n: number): ParserState {
        return new ParserState(this.src, {offset: this.offset + n, col: this.col + n, row: this.row})
    }
}

export interface Location {
    readonly offset: number
    readonly row: number
    readonly col: number
}

export type Located<T extends {}> = T & { location: Location }

export interface BadStep<E extends object> {
    readonly _tag: "bad"
    readonly errors: Array<Located<E>>
    readonly backtrack: boolean
}

export interface GoodStep<T> {
    readonly _tag: "good"
    readonly value: T
    readonly state: ParserState
    readonly backtrack: boolean
}

export type ParsStep<T, E extends {}> = GoodStep<T> | BadStep<E>

function foldParsStep<T, E extends {}, R>(step: ParsStep<T, E>, onGood: (good: GoodStep<T>) => R, onBad: (bad: BadStep<E>) => R): R {
    switch (step._tag) {
        case "good": {
            return onGood(step)
        }
        case "bad": {
            return onBad(step)
        }
    }
}

export abstract class Parser<A, E extends {}> {
    protected constructor() {
    }

    abstract doPars(state: ParserState): ParsStep<A, E>

    map<B>(mapper: (value: A) => B): Parser<B, E> {
        return this.mapStepGood(step => ({...step, value: mapper(step.value)}))
    }

    map2<B, C>(parser2: Parser<B, E>, mapper: (value1: A, value2: B) => C): Parser<C, E> {
        return new Map2Parser(this, parser2, mapper)
    }

    apply<R>(f: (thisParser: Parser<A, E>) => R): R {
        return f(this)
    }

    parse(src: string): Result<A, Array<Located<E>>> {
        return foldParsStep(this.doPars(new ParserState(src, {offset: 0, row: 1, col: 1})),
            good => Result.ok(good.value),
            bad => Result.err(bad.errors)
        )
    }

    // =================
    // Utilities
    //=================

    protected mapStep<B>(
        onGood: (step: GoodStep<A>) => ParsStep<B, E>,
        onBad: (step: BadStep<E>) => ParsStep<B, E>
    ): Parser<B, E> {
        return new MapParser(this, onGood, onBad)
    }

    protected mapStepGood<B>(
        onGood: (step: GoodStep<A>) => ParsStep<B, E>,
    ): Parser<B, E> {
        return this.mapStep(onGood, step => step)
    }
}

export class LambdaParser<A, E> extends Parser<A, E> {
    private readonly tag: string
    private readonly func: (state: ParserState) => ParsStep<A, E>

    constructor(tag: string, func: (state: ParserState) => ParsStep<A, E>) {
        super();
        this.tag = tag
        this.func = func
    }

    doPars(state: ParserState): ParsStep<A, E> {
        return this.func(state)
    }
}

export function keep<A, B, E extends {}>(argParser: Parser<A, E>): (funcParser: Parser<(arg: A) => B, E>) => Parser<B, E> {
    return funcParser => funcParser.map2(argParser, (func, arg) => func(arg))
}

export function ignore<A, B, E extends {}>(ignoreParser: Parser<B, E>): (resultParser: Parser<A, E>) => Parser<A, E> {
    return resultParser => resultParser.map2(ignoreParser, (a) => a)
}

class MapParser<A, B, E extends {}> extends Parser<B, E> {
    readonly inner: Parser<A, E>
    readonly onGood: (step: GoodStep<A>) => ParsStep<B, E>
    readonly onBad: (step: BadStep<E>) => ParsStep<B, E>

    constructor(inner: Parser<A, E>, onGood: (step: GoodStep<A>) => ParsStep<B, E>, onBad: (step: BadStep<E>) => ParsStep<B, E>) {
        super();
        this.inner = inner
        this.onGood = onGood
        this.onBad = onBad
    }

    doPars(state: ParserState): ParsStep<B, E> {
        return foldParsStep(this.inner.doPars(state), this.onGood, this.onBad);
    }
}

class Map2Parser<A, B, C, E extends {}> extends Parser<C, E> {
    readonly first: Parser<A, E>
    readonly second: Parser<B, E>
    readonly mapper: (value1: A, value2: B) => C

    constructor(first: Parser<A, E>, second: Parser<B, E>, mapper: (value1: A, value2: B) => C) {
        super();
        this.first = first
        this.second = second
        this.mapper = mapper
    }

    doPars(state: ParserState): ParsStep<C, E> {
        return foldParsStep(this.first.doPars(state),
            step1 => foldParsStep<B, E, ParsStep<C, E>>(this.second.doPars(step1.state),
                step2 => ({
                    ...step2,
                    value: this.mapper(step1.value, step2.value),
                    backtrack: step1.backtrack && step2.backtrack
                }),
                step2 => ({...step2, backtrack: step1.backtrack && step2.backtrack})),
            bad => bad
        )
    }
}

class DebugParser<A, E> extends Parser<A, E> {
    private readonly inner: Parser<A, E>
    private readonly msgB?: (state: ParserState) => string
    private readonly msg?: (step: ParsStep<A, E>) => string

    constructor(inner: Parser<A, E>, msgB?: (state: ParserState) => string, msg?: (step: ParsStep<A, E>) => string) {
        super();
        this.inner = inner
        this.msgB = msgB
        this.msg = msg
    }

    doPars(state: ParserState): ParsStep<A, E> {
        if (this.msgB) console.log(this.msgB(state))
        const step = this.inner.doPars(state)
        if (this.msg) console.log(this.msg(step))
        return step
    }
}

export function dbg<A, E>(msg: (step: ParsStep<A, E>) => string): (resultParser: Parser<A, E>) => Parser<A, E> {
    return parser => new DebugParser(parser, undefined, msg)
}

export function dbgB<A, E>(msg: (state: ParserState) => string): (resultParser: Parser<A, E>) => Parser<A, E> {
    return parser => new DebugParser(parser, msg)
}