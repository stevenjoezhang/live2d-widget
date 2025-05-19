export default MatrixStack;
declare class MatrixStack {
    static reset(): void;
    static loadIdentity(): void;
    static push(): void;
    static pop(): void;
    static getMatrix(): number[];
    static multMatrix(matNew: any): void;
}
declare namespace MatrixStack {
    let depth: number;
    let matrixStack: number[];
    let currentMatrix: number[];
    let tmp: any[];
}
