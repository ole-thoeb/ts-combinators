export function curry<A, B>(fn: (a: A) => B): (a: A) => B
export function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (a: B) => C
export function curry<A, B, C, D>(fn: (a: A, b: B, c: C) => D): (a: A) => (a: B) => (c: C) => D
export function curry<A, B, C, D, E>(fn: (a: A, b: B, c: C, d: D) => E): (a: A) => (a: B) => (c: C) => (d: D) => E
export function curry<A, B, C, D, E, F>(fn: (a: A, b: B, c: C, d: D, e: E) => F): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => F
export function curry<A, B, C, D, E, F, G>(fn: (a: A, b: B, c: C, d: D, e: E, f: F) => G): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => (f: F) => G
export function curry<A, B, C, D, E, F, G, H>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => (f: F) => (g: G) => H

export function curry(fn: Function): Function {
    switch (fn.length) {
        case 1: return fn
        case 2: return (a: any) => (b: any) => fn(a, b)
        case 3: return (a: any) => (b: any) => (c: any) => fn(a, b, c)
        case 4: return (a: any) => (b: any) => (c: any) => (d: any) => fn(a, b, c, d)
        case 5: return (a: any) => (b: any) => (c: any) => (d: any) => (e: any) => fn(a, b, c, d, e)
        case 6: return (a: any) => (b: any) => (c: any) => (d: any) => (e: any) => (f: any) => fn(a, b, c, d, e, f)
        case 7: return (a: any) => (b: any) => (c: any) => (d: any) => (e: any) => (f: any) => (g: any) => fn(a, b, c, d, e, f, g)
        default: throw new Error(`Can't curry functions with more than ${fn.length} arguments`)
    }
}