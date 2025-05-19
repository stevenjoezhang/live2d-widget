class MatrixStack {
    static reset() {
        this.depth = 0;
    }
    static loadIdentity() {
        for (let i = 0; i < 16; i++) {
            this.currentMatrix[i] = i % 5 == 0 ? 1 : 0;
        }
    }
    static push() {
        const offset = this.depth * 16;
        const nextOffset = (this.depth + 1) * 16;
        if (this.matrixStack.length < nextOffset + 16) {
            this.matrixStack.length = nextOffset + 16;
        }
        for (let i = 0; i < 16; i++) {
            this.matrixStack[nextOffset + i] = this.currentMatrix[i];
        }
        this.depth++;
    }
    static pop() {
        this.depth--;
        if (this.depth < 0) {
            this.depth = 0;
        }
        const offset = this.depth * 16;
        for (let i = 0; i < 16; i++) {
            this.currentMatrix[i] = this.matrixStack[offset + i];
        }
    }
    static getMatrix() {
        return this.currentMatrix;
    }
    static multMatrix(matNew) {
        let i, j, k;
        for (i = 0; i < 16; i++) {
            this.tmp[i] = 0;
        }
        for (i = 0; i < 4; i++) {
            for (j = 0; j < 4; j++) {
                for (k = 0; k < 4; k++) {
                    this.tmp[i + j * 4] +=
                        this.currentMatrix[i + k * 4] * matNew[k + j * 4];
                }
            }
        }
        for (i = 0; i < 16; i++) {
            this.currentMatrix[i] = this.tmp[i];
        }
    }
}
MatrixStack.matrixStack = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
MatrixStack.depth = 0;
MatrixStack.currentMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
MatrixStack.tmp = new Array(16);
export default MatrixStack;
