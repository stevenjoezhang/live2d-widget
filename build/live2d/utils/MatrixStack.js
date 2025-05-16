var MatrixStack = (function () {
    function MatrixStack() {
    }
    MatrixStack.reset = function () {
        this.depth = 0;
    };
    MatrixStack.loadIdentity = function () {
        for (var i = 0; i < 16; i++) {
            this.currentMatrix[i] = i % 5 == 0 ? 1 : 0;
        }
    };
    MatrixStack.push = function () {
        var offset = this.depth * 16;
        var nextOffset = (this.depth + 1) * 16;
        if (this.matrixStack.length < nextOffset + 16) {
            this.matrixStack.length = nextOffset + 16;
        }
        for (var i = 0; i < 16; i++) {
            this.matrixStack[nextOffset + i] = this.currentMatrix[i];
        }
        this.depth++;
    };
    MatrixStack.pop = function () {
        this.depth--;
        if (this.depth < 0) {
            this.depth = 0;
        }
        var offset = this.depth * 16;
        for (var i = 0; i < 16; i++) {
            this.currentMatrix[i] = this.matrixStack[offset + i];
        }
    };
    MatrixStack.getMatrix = function () {
        return this.currentMatrix;
    };
    MatrixStack.multMatrix = function (matNew) {
        var i, j, k;
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
    };
    return MatrixStack;
}());
MatrixStack.matrixStack = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
MatrixStack.depth = 0;
MatrixStack.currentMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
MatrixStack.tmp = new Array(16);
export default MatrixStack;
