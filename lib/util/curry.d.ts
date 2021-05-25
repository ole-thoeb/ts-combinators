export declare function curry<A, B>(fn: (a: A) => B): (a: A) => B;
export declare function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (a: B) => C;
export declare function curry<A, B, C, D>(fn: (a: A, b: B, c: C) => D): (a: A) => (a: B) => (c: C) => D;
export declare function curry<A, B, C, D, E>(fn: (a: A, b: B, c: C, d: D) => E): (a: A) => (a: B) => (c: C) => (d: D) => E;
export declare function curry<A, B, C, D, E, F>(fn: (a: A, b: B, c: C, d: D, e: E) => F): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => F;
export declare function curry<A, B, C, D, E, F, G>(fn: (a: A, b: B, c: C, d: D, e: E, f: F) => G): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => (f: F) => G;
export declare function curry<A, B, C, D, E, F, G, H>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H): (a: A) => (a: B) => (c: C) => (d: D) => (e: E) => (f: F) => (g: G) => H;
