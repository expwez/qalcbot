// Copyright 2018 Bogdan Danylchenko
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as mathjs from "mathjs"

export class CalculateError extends Error {
    public readonly inputQuery: string

    constructor(m: string, inputQuery: string) {
        super(m);
        this.inputQuery = inputQuery;
    }
}

export class CalculatorAnswer {
    public readonly answer: string
    public readonly fullAnswer: string

    public constructor(answer: string, fullAnswer: string) {
        this.answer = answer;
        this.fullAnswer = fullAnswer;
    }
}

export class Calculator {
    public static calculate(query: string): CalculatorAnswer {
        let res: any
        try {
            res = mathjs.eval(query);
        } catch (e) {
            throw new CalculateError(e.message, query);
        }

        if (res == undefined) {
            throw new CalculateError("Can't calculate input query.", query);
        } else if (res.entries && res.entries.length == 0) {
            throw new CalculateError("There are nothing to calculate.", query);
        } else {
            let answer = res.entries ? res.entries[0] + "" : res + "";
            let fullAnswer = query + " = " + answer;
            return new CalculatorAnswer(answer, fullAnswer);
        }
    }
}