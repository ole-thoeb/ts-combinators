import {describe, it} from 'mocha'
import {expect} from 'chai'
import {curry} from "../src/util/curry";

describe("curry variants", () => {
    it('should curry 2 args', () => {
        const fn = (a: number, b: string) => ({a, b})
        expect(curry(fn)(1)("2")).to.deep.equal({a: 1, b: "2"})
    })

    it('should curry 3 args', () => {
        const fn = (a: number, b: string, c: {}) => ({a, b, c})
        expect(curry(fn)(1)("2")({a: 2})).to.deep.equal({a: 1, b: "2", c: {a: 2}})
    })

    it('should curry 4 args', () => {
        const fn = (a: number, b: string, c: {}, d: never[]) => ({a, b, c, d})
        expect(curry(fn)(1)("2")({a: 2})([])).to.deep.equal({a: 1, b: "2", c: {a: 2}, d: []})
    })

    it('should curry 5 args', () => {
        const fn = (a: number, b: string, c: {}, d: never[], e: boolean) => ({a, b, c, d, e})
        expect(curry(fn)(1)("2")({a: 2})([])(false)).to.deep.equal({a: 1, b: "2", c: {a: 2}, d: [], e: false})
    })
})