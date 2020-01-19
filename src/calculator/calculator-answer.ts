export class CalculatorAnswer {
    public readonly answer: string;
    public readonly fullAnswer: string;

    public constructor(answer: string, fullAnswer: string) {
        this.answer = answer;
        this.fullAnswer = fullAnswer;
    }
}
