export declare namespace Result {
    interface Ok<T> {
        _tag: "ok";
        value: T;
    }
    interface Err<E> {
        _tag: "err";
        error: E;
    }
}
export declare class Result<T, E> {
    private readonly inner;
    private constructor();
    map<B>(onOk: (value: T) => B): Result<B, E>;
    fold<R>(onOk: (value: T) => R, onErr: (error: E) => R): R;
    unwrap(): T;
    static ok<T, E>(value: T): Result<T, E>;
    static err<T, E>(error: E): Result<T, E>;
}
