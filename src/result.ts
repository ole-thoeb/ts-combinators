export namespace Result {
    export interface Ok<T> {
        _tag: "ok"
        value: T
    }

    export interface Err<E> {
        _tag: "err"
        error: E
    }
}

type ResultInner<T, E> = Result.Ok<T> | Result.Err<E>

export class Result<T, E> {
    private readonly inner: ResultInner<T, E>

    private constructor(inner: ResultInner<T, E>) {
        this.inner = inner;
    }

    map<B>(onOk: (value: T) => B): Result<B, E> {
        return this.fold(value => Result.ok(onOk(value)), e => Result.err(e))
    }

    fold<R>(onOk: (value: T) => R, onErr: (error: E) => R): R {
        switch (this.inner._tag) {
            case "ok":
                return onOk(this.inner.value)
            case "err":
                return onErr(this.inner.error)
        }
    }

    unwrap(): T {
        return this.fold(t => t, e => {
            throw Error("Result is error: " + JSON.stringify(e))
        })
    }

    static ok<T, E>(value: T): Result<T, E> {
        return new Result({_tag: "ok", value})
    }

    static err<T, E>(error: E): Result<T, E> {
        return new Result({_tag: "err", error})
    }
}