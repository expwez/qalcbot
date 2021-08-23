import * as mathjs from "mathjs";
import {CalculatorAnswer} from "./calculator-answer";
import {CalculateError} from "./calculator-error";

export class Calculator {
    public calculate(query: string): CalculatorAnswer {
        let res: any;
        try {
            res = mathjs.eval(query);
        } catch (e) {
            throw new CalculateError(e.message, query);
        }

        if (res == null) {
            throw new CalculateError("Can't calculate input query.", query);
        }

        if (res.entries != null && res.entries.length === 0) {
            throw new CalculateError("There are nothing to calculate.", query);
        }

        const answer = res.entries ? res.entries[0] + "" : res + "";
        const fullAnswer = query + " = " + answer;

        return new CalculatorAnswer(answer, fullAnswer);
    }
}
