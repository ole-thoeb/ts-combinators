import { Parser } from "./parser";
import { Result } from "./result";
interface ExpectedToken {
    readonly _tag: "expectedToken";
    readonly expected: string;
}
interface ExpectedInt {
    readonly _tag: "expectedInt";
}
export declare type ParsError = ExpectedToken | ExpectedInt;
export declare function token(token: string): Parser<string, ParsError>;
export declare function int(): Parser<number, ParsError>;
export declare function number<A, E>(int: Result<(n: number) => A, E>, float: Result<(n: number) => A, E>, expecting: E): Parser<A, E>;
export declare function chompWhile<E>(isGood: (char: string) => boolean): Parser<void, E>;
export declare function spaces<E>(): Parser<void, E>;
export declare function succeed<A>(value: A): Parser<A, never>;
export declare function succeed2<A, B, C>(fn: (a: A, b: B) => C): Parser<(a: A) => (b: B) => C, never>;
export {};
