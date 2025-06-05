import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
import * as LAppDefine from '@demo/lappdefine.js';
import { LAppModel } from '@demo/lappmodel.js';
import { LAppPal } from '@demo/lapppal';
import logger from '../logger.js';
LAppPal.printMessage = () => { };
class AppSubdelegate extends LAppSubdelegate {
    initialize(canvas) {
        if (!this._glManager.initialize(canvas)) {
            return false;
        }
        this._canvas = canvas;
        if (LAppDefine.CanvasSize === 'auto') {
            this.resizeCanvas();
        }
        else {
            canvas.width = LAppDefine.CanvasSize.width;
            canvas.height = LAppDefine.CanvasSize.height;
        }
        this._textureManager.setGlManager(this._glManager);
        const gl = this._glManager.getGl();
        if (!this._frameBuffer) {
            this._frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._view.initialize(this);
        this._view._gear = {
            render: () => { },
            isHit: () => { },
            release: () => { }
        };
        this._view._back = {
            render: () => { },
            release: () => { }
        };
        this._live2dManager._subdelegate = this;
        this._resizeObserver = new window.ResizeObserver((entries, observer) => this.resizeObserverCallback.call(this, entries, observer));
        this._resizeObserver.observe(this._canvas);
        return true;
    }
    onResize() {
        this.resizeCanvas();
        this._view.initialize(this);
    }
    update() {
        if (this._glManager.getGl().isContextLost()) {
            return;
        }
        if (this._needResize) {
            this.onResize();
            this._needResize = false;
        }
        const gl = this._glManager.getGl();
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearDepth(1.0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._view.render();
    }
}
export class AppDelegate extends LAppDelegate {
    run() {
        const loop = () => {
            LAppPal.updateTime();
            for (let i = 0; i < this._subdelegates.getSize(); i++) {
                this._subdelegates.at(i).update();
            }
            this._drawFrameId = window.requestAnimationFrame(loop);
        };
        loop();
    }
    stop() {
        if (this._drawFrameId) {
            window.cancelAnimationFrame(this._drawFrameId);
            this._drawFrameId = null;
        }
    }
    release() {
        this.stop();
        this.releaseEventListener();
        this._subdelegates.clear();
        this._cubismOption = null;
    }
    transformOffset(e) {
        const subdelegate = this._subdelegates.at(0);
        const rect = subdelegate.getCanvas().getBoundingClientRect();
        const localX = e.pageX - rect.left;
        const localY = e.pageY - rect.top;
        const posX = localX * window.devicePixelRatio;
        const posY = localY * window.devicePixelRatio;
        const x = subdelegate._view.transformViewX(posX);
        const y = subdelegate._view.transformViewY(posY);
        return {
            x, y
        };
    }
    onMouseMove(e) {
        const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
        const { x, y } = this.transformOffset(e);
        const model = lapplive2dmanager._models.at(0);
        lapplive2dmanager.onDrag(x, y);
        lapplive2dmanager.onTap(x, y);
        if (model.hitTest(LAppDefine.HitAreaNameBody, x, y)) {
            window.dispatchEvent(new Event('live2d:hoverbody'));
        }
    }
    onMouseEnd(e) {
        const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
        const { x, y } = this.transformOffset(e);
        lapplive2dmanager.onDrag(0.0, 0.0);
        lapplive2dmanager.onTap(x, y);
    }
    onTap(e) {
        const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
        const { x, y } = this.transformOffset(e);
        const model = lapplive2dmanager._models.at(0);
        if (model.hitTest(LAppDefine.HitAreaNameBody, x, y)) {
            window.dispatchEvent(new Event('live2d:tapbody'));
        }
    }
    initializeEventListener() {
        this.mouseMoveEventListener = this.onMouseMove.bind(this);
        this.mouseEndedEventListener = this.onMouseEnd.bind(this);
        this.tapEventListener = this.onTap.bind(this);
        document.addEventListener('mousemove', this.mouseMoveEventListener, {
            passive: true
        });
        document.addEventListener('mouseout', this.mouseEndedEventListener, {
            passive: true
        });
        document.addEventListener('pointerdown', this.tapEventListener, {
            passive: true
        });
    }
    releaseEventListener() {
        document.removeEventListener('mousemove', this.mouseMoveEventListener, {
            passive: true
        });
        this.mouseMoveEventListener = null;
        document.removeEventListener('mouseout', this.mouseEndedEventListener, {
            passive: true
        });
        this.mouseEndedEventListener = null;
        document.removeEventListener('pointerdown', this.tapEventListener, {
            passive: true
        });
    }
    initializeSubdelegates() {
        this._canvases.prepareCapacity(LAppDefine.CanvasNum);
        this._subdelegates.prepareCapacity(LAppDefine.CanvasNum);
        const canvas = document.getElementById('live2d');
        this._canvases.pushBack(canvas);
        canvas.style.width = canvas.width;
        canvas.style.height = canvas.height;
        for (let i = 0; i < this._canvases.getSize(); i++) {
            const subdelegate = new AppSubdelegate();
            const result = subdelegate.initialize(this._canvases.at(i));
            if (!result) {
                logger.error('Failed to initialize AppSubdelegate');
                return;
            }
            this._subdelegates.pushBack(subdelegate);
        }
        for (let i = 0; i < LAppDefine.CanvasNum; i++) {
            if (this._subdelegates.at(i).isContextLost()) {
                logger.error(`The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`);
            }
        }
    }
    changeModel(modelSettingPath) {
        const segments = modelSettingPath.split('/');
        const modelJsonName = segments.pop();
        const modelPath = segments.join('/') + '/';
        const live2dManager = this._subdelegates.at(0).getLive2DManager();
        live2dManager.releaseAllModel();
        const instance = new LAppModel();
        instance.setSubdelegate(live2dManager._subdelegate);
        instance.loadAssets(modelPath, modelJsonName);
        live2dManager._models.pushBack(instance);
    }
    get subdelegates() {
        return this._subdelegates;
    }
}
