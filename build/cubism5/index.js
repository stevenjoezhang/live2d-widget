import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
import * as LAppDefine from '@demo/lappdefine.js';
import { LAppModel } from '@demo/lappmodel.js';
import { LAppPal } from '@demo/lapppal';
import logger from '../logger.js';
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
    releaseEventListener() {
        document.removeEventListener('pointerdown', this.pointBeganEventListener, {
            passive: true
        });
        this.pointBeganEventListener = null;
        document.removeEventListener('pointermove', this.pointMovedEventListener, {
            passive: true
        });
        this.pointMovedEventListener = null;
        document.removeEventListener('pointerup', this.pointEndedEventListener, {
            passive: true
        });
        this.pointEndedEventListener = null;
        document.removeEventListener('pointercancel', this.pointCancelEventListener, {
            passive: true
        });
        this.pointCancelEventListener = null;
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
