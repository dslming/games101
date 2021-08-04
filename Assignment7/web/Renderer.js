import { Vector3 } from './math/Vector3.js';
import { deg2rad } from './global.js'

// Compute reflection direction
export function reflect(I, N) {
  const temp = Vector3.dotProduct(I, N)
  const n = N.multiplyScalar(2 * temp)
  return I.sub(n).normalize();
}

function castRay(orig, dir, scene, depth) {
  if (depth > scene.maxDepth) {
    return new Vector3(0.0, 0.0, 0.0);
  }

  var hitColor = scene.backgroundColor;
  var payload = scene.intersect(orig.clone(), dir.clone())

  if (payload) {
    // var temp1 = new Vector3().copy(dir).multiplyScalar(payload.tNear);
    // var temp2 = new Vector3().copy(orig)
    // var hitPoint = new Vector3().addVectors(temp1, temp2)
    // // const N = payload.hitObj.normal
    // // var lightAmt = new Vector3()
    // // var specularColor = new Vector3()
    // // var ret1 = hitPoint.clone().add(N.clone().multiplyScalar(scene.epsilon))
    // // var ret2 = hitPoint.clone().sub(N.clone().multiplyScalar(scene.epsilon))
    // // var shadowPointOrig = (Vector3.dotProduct(dir, N) < 0) ? ret1 : ret2
    // // var light = scene.get_lights()[0]
    // // if (light) {
    // //   var lightDir = light.position.clone().sub(hitPoint)
    // //   var lightDistance2 = Vector3.dotProduct(lightDir, lightDir);
    // //   lightDir = lightDir.normalize()
    // //   var LdotN = Math.max(0, Vector3.dotProduct(lightDir, N));
    // //   var shadow_res = scene.intersect(shadowPointOrig, lightDir);
    // //   var inShadow = false
    // //   if (shadow_res && shadow_res.tNear * shadow_res.tNear < lightDistance2) {
    // //     inShadow = true
    // //   }

    // //   let retTTT = light.intensity * LdotN;
    // //   lightAmt.addScalar(inShadow ? 0 : retTTT)
    // //   var reflectionDirection = reflect(new Vector3().copy(lightDir).negate(), N.clone());
    // //   const ttt = Math.max(0, -Vector3.dotProduct(reflectionDirection, dir))
    // //   let ret = Math.pow(ttt, payload.hitObj.material.specularExponent) * light.intensity;
    // //   specularColor.addScalar(ret)
    // // }

    // // const obj = payload.hitObj
    // // const objColor = new Vector3(0.2,0.2,0.2)
    // // let ret1Color = lightAmt.clone().multiply(objColor)
    // // let ret2Color = specularColor.multiplyScalar(obj.Ks)
    // // hitColor = ret2Color.add(ret1Color)
    hitColor = new Vector3(0.2, 0.2, 0.2)
  }

  return hitColor;
}

export class Renderer {
  constructor() {
  }

  Render(scene) {
    const framebuffer = []
    var imageAspectRatio = scene.width / scene.height;
    var eye_pos = new Vector3(278, 273, -800)
    // Vector3f eye_pos(278, 273, -800);

    // var eye_pos = new Vector3(0, 0, 1)
    // var eye_pos = new Vector3(0, 0, 0)

    let m = 0
    const scale = Math.tan(deg2rad(scene.fov * 0.5));
    for (var j = 0; j < scene.height; ++j) {
      for (var i = 0; i < scene.width; ++i) {
        var x;
        var y;
        x = imageAspectRatio * (2 * (i + 0.5) / scene.width - 1) * scale
        y = 1 - (2 * (j + 0.5) / scene.height) * scale

        var dir = new Vector3(-x, y, 1).normalize()
        framebuffer[m++] = castRay(eye_pos, dir, scene, 0);
      }
    }
    return framebuffer

  }
}
