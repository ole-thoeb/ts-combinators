import {describe, it} from 'mocha'
import {expect} from 'chai'
import * as Parsers from '../src/parsers'
import {ignore, keep, Parser} from "../src/parser";

interface Dice {
    readonly count: number
    readonly sides: number
}

const constructDice = (count: number, sides: number) => ({count, sides})

const dice: Parser<Dice, Parsers.ParsError> = Parsers.succeed2(constructDice)
    .apply(keep(Parsers.int()))
    .apply(ignore(Parsers.token("d")))
    .apply(keep(Parsers.int()))

describe("Base parser", () => {
    describe("int", () => {
        it("should pars 1", () => {
            expect(Parsers.int().parse("1").unwrap())
                .to
                .equal(1)
        })
    })
    describe("combinators", () => {
        const doubleKeepParser = Parsers.succeed2((i: number, s: string) => ({i, s}))
            .apply(keep(Parsers.int()))
            .apply(keep(Parsers.token("d")))
        const keepIgnoreParser = Parsers.succeed((i: number) => i)
            .apply(keep(Parsers.int()))
            .apply(ignore(Parsers.token("d")))
        it("should keep both int and string", () => {
            expect(doubleKeepParser.parse("1d").unwrap()).to.deep.equal({i: 1, s: "d"})
        })
        it("should keep only int", () => {
            expect(keepIgnoreParser.parse("1d").unwrap()).to.deep.equal(1)
        })
    })
})

describe("Parsing a roll command", () => {
    describe("dice", () => {
        it('should parse the dice expression', () => {
            expect(dice.parse("1d6").unwrap())
                .to.deep
                .equal({count: 1, sides: 6})

            expect(dice.parse("5d100").unwrap())
                .to.deep
                .equal({count: 5, sides: 100})
        })
    })
})