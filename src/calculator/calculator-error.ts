export class CalculateError extends Error {
    public readonly inputQuery: string;

    constructor(m: string, inputQuery: string) {
        super(m);
        this.inputQuery = inputQuery;
    }
}
