import { Result } from "./result";
export declare class ParserState {
    readonly location: Location;
    readonly src: string;
    constructor(src: string, location: Location);
    get offset(): number;
    get row(): number;
    get col(): number;
    charAt(additionalOffset: number): string | null;
    updateLocation(newLocation: Location): ParserState;
    bumpBy(n: number): ParserState;
}
export interface Location {
    readonly offset: number;
    readonly row: number;
    readonly col: number;
}
export declare type Located<T extends {}> = T & {
    location: Location;
};
export interface BadStep<E extends object> {
    readonly _tag: "bad";
    readonly errors: Array<Located<E>>;
    readonly backtrack: boolean;
}
export interface GoodStep<T> {
    readonly _tag: "good";
    readonly value: T;
    readonly state: ParserState;
    readonly backtrack: boolean;
}
export declare type ParsStep<T, E extends {}> = GoodStep<T> | BadStep<E>;
export declare abstract class Parser<A, E extends {}> {
    protected constructor();
    abstract doPars(state: ParserState): ParsStep<A, E>;
    map<B>(mapper: (value: A) => B): Parser<B, E>;
    map2<B, C>(parser2: Parser<B, E>, mapper: (value1: A, value2: B) => C): Parser<C, E>;
    apply<R>(f: (thisParser: Parser<A, E>) => R): R;
    parse(src: string): Result<A, Array<Located<E>>>;
    protected mapStep<B>(onGood: (step: GoodStep<A>) => ParsStep<B, E>, onBad: (step: BadStep<E>) => ParsStep<B, E>): Parser<B, E>;
    protected mapStepGood<B>(onGood: (step: GoodStep<A>) => ParsStep<B, E>): Parser<B, E>;
}
export declare class LambdaParser<A, E> extends Parser<A, E> {
    private readonly tag;
    private readonly func;
    constructor(tag: string, func: (state: ParserState) => ParsStep<A, E>);
    doPars(state: ParserState): ParsStep<A, E>;
}
export declare function keep<A, B, E extends {}>(argParser: Parser<A, E>): (funcParser: Parser<(arg: A) => B, E>) => Parser<B, E>;
export declare function ignore<A, B, E extends {}>(ignoreParser: Parser<B, E>): (resultParser: Parser<A, E>) => Parser<A, E>;
export declare function dbg<A, E>(msg: (step: ParsStep<A, E>) => string): (resultParser: Parser<A, E>) => Parser<A, E>;
export declare function dbgB<A, E>(msg: (state: ParserState) => string): (resultParser: Parser<A, E>) => Parser<A, E>;
