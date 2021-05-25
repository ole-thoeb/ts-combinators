"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
class Result {
    constructor(inner) {
        this.inner = inner;
    }
    map(onOk) {
        return this.fold(value => Result.ok(onOk(value)), e => Result.err(e));
    }
    fold(onOk, onErr) {
        switch (this.inner._tag) {
            case "ok":
                return onOk(this.inner.value);
            case "err":
                return onErr(this.inner.error);
        }
    }
    unwrap() {
        return this.fold(t => t, e => {
            throw Error("Result is error: " + JSON.stringify(e));
        });
    }
    static ok(value) {
        return new Result({ _tag: "ok", value });
    }
    static err(error) {
        return new Result({ _tag: "err", error });
    }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map