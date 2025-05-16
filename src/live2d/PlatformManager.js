/* global console, XMLHttpRequest, Image, Live2DModelWebGL, document */
/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class PlatformManager     extend IPlatformManager
//============================================================
//============================================================
class PlatformManager {
  //============================================================
  //    PlatformManager # loadBytes()
  //============================================================
  loadBytes(path /*String*/, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      switch (request.status) {
      case 200:
        callback(request.response);
        break;
      default:
        console.error('Failed to load (' + request.status + ') : ' + path);
        break;
      }
    };
    request.send(null);
    //return request;
  }

  //============================================================
  //    PlatformManager # loadString()
  //============================================================
  loadString(path /*String*/) {
    this.loadBytes(path, buf => {
      return buf;
    });
  }

  //============================================================
  //    PlatformManager # loadLive2DModel()
  //============================================================
  loadLive2DModel(path /*String*/, callback) {
    let model = null;

    // load moc
    this.loadBytes(path, buf => {
      model = Live2DModelWebGL.loadModel(buf);
      callback(model);
    });
  }

  //============================================================
  //    PlatformManager # loadTexture()
  //============================================================
  loadTexture(model /*ALive2DModel*/, no /*int*/, path /*String*/, callback) {
    // load textures
    const loadedImage = new Image();
    loadedImage.crossOrigin = 'anonymous';
    loadedImage.src = path;

    loadedImage.onload = () => {
      // create texture
      const canvas = document.getElementById('live2d');
      const gl = canvas.getContext('webgl', { premultipliedAlpha: true });
      let texture = gl.createTexture();
      if (!texture) {
        console.error('Failed to generate gl texture name.');
        return -1;
      }

      if (model.isPremultipliedAlpha() == false) {
        // 乗算済アルファテクスチャ以外の場合
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        loadedImage,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_NEAREST,
      );
      gl.generateMipmap(gl.TEXTURE_2D);

      model.setTexture(no, texture);

      // テクスチャオブジェクトを解放
      texture = null;

      if (typeof callback == 'function') callback();
    };

    loadedImage.onerror = () => {
      console.error('Failed to load image : ' + path);
    };
  }

  //============================================================
  //    PlatformManager # parseFromBytes(buf)

  //============================================================
  jsonParseFromBytes(buf) {
    let jsonStr;

    const bomCode = new Uint8Array(buf, 0, 3);
    if (bomCode[0] == 239 && bomCode[1] == 187 && bomCode[2] == 191) {
      jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf, 3));
    } else {
      jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    const jsonObj = JSON.parse(jsonStr);

    return jsonObj;
  }

  //============================================================
  //    PlatformManager # log()
  //============================================================
  log(txt /*String*/) {
    console.log(txt);
  }
}

export default PlatformManager;
