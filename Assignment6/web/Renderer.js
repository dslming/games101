import { M_PI} from './global.js'
import { Vector3 } from './Vector3.js';
import { MaterialType } from './global.js'
import * as MathUtils from './MathUtils.js'
let only = false
let temp = 0

function deg2rad(deg) {
  return deg * M_PI / 180.0;
}

// Compute reflection direction
export function reflect(I, N) {
  // return I - 2 * I * N;
  const temp = new Vector3().dotProduct(I, N)
  const n = N.multiplyScalar(2 * temp)

  // const a = N.multiplyScalar(2 * temp)

  return I.sub(n).normalize();
}

function refract(I, N, ior) {
  var cosi = MathUtils.clamp(new Vector3().dotProduct(I, N), -1, 1);
  var etai = 1
  var etat = ior;
  var n = N.clone();
  if (cosi < 0) {
    cosi = -cosi;
  } else {
    var temp = etai
    etai = etat
    etat = temp
    n = N.clone().negate()
  }
  var eta = etai / etat;
  var k = 1 - eta * eta * (1 - cosi * cosi);
  let a1 = I.clone().multiplyScalar(eta)
  let a2 = eta * cosi - Math.sqrt(k)
  let a3 = n.multiplyScalar(a2)
  return k < 0 ? 0 : a1.add(a3)
}

// 计算菲涅耳方程
function fresnel(I, N, ior) {
  var cosi = MathUtils.clamp(new Vector3().dotProduct(I, N), -1, 1);
  var etai = 1
  var etat = ior;
  if (cosi > 0) {
    let temp = etai
    etai = etat
    etat = temp
  }
  // Compute sini using Snell's law
  var sint = etai / etat * Math.sqrt(Math.max(0, 1 - cosi * cosi));
  // Total internal reflection
  if (sint >= 1) {
    return 1;
  } else {
    var cost = Math.sqrt(Math.max(0, 1 - sint * sint));
    cosi = Math.abs(cosi);
    var Rs = ((etat * cosi) - (etai * cost)) / ((etat * cosi) + (etai * cost));
    var Rp = ((etai * cosi) - (etat * cost)) / ((etai * cosi) + (etat * cost));
    return (Rs * Rs + Rp * Rp) / 2;
  }
}

/**
 * 计算折射方向
 */
function getRefraction(i, n, r) {
  if (!i || !n || !r) {
    console.error("缺少参数...")
    return
  }

  i.normalize()
  n.normalize()

  if (i.clone().dot(n) < 0) {
    n.negate()
  }

  var cosi = i.clone().dot(n)
  var cosj2 = 1 - (1 - cosi * cosi) / (r * r)
  var cosj = Math.sqrt(cosj2)
  var thetai = Math.acos(cosi)
  var thetaj = Math.acos(cosj)
  var thetak = thetai - thetaj
  var cosk = Math.cos(thetak)

  var x = (cosj - cosi * cosk) / (1 - cosi * cosi)
  var y = (cosk - cosi * cosj) / (1 - cosi * cosi)
  return n.multiplyScalar(x).add(i.multiplyScalar(y))
}

function trace(orig, dir, objects) {
  let tNear = Infinity;
  var payload = null
  for (let i = 0; i < objects.length; i++) {
    var object = objects[i]
    const option = {
      tNearK: Infinity,
      indexK: 0,
      uvK: 0
    }
    const flag = object.intersect(orig, dir, option)
    if (flag && option.tNearK < tNear) {
      payload = {}
      payload.hit_obj = object;
      payload.tNear = option.tNearK
      payload.index = option.indexK
      payload.uv = option.uvK
      tNear = option.tNearK;
    }
  }
  return payload;
}

function castRay(orig, dir, scene, depth) {
  if (depth > scene.maxDepth) {
    return new Vector3(0.0, 0.0, 0.0);
  }

  var hitColor = scene.backgroundColor;
  var payload = trace(orig.clone(), dir.clone(), scene.get_objects());

  if (payload) {
    var temp1 = new Vector3().copy(dir).multiplyScalar(payload.tNear);
    var temp2 = new Vector3().copy(orig)
    var hitPoint = new Vector3().addVectors(temp1, temp2)
    // var N; // normal
    // var st; // st coordinates
    const param = {
      P: hitPoint,
      N: [],
      st: [],
      uv: payload.uv,
      index: payload.index,
    }
    payload.hit_obj.getSurfaceProperties(param);
    switch (payload.hit_obj.materialType) {
      case MaterialType.REFLECTION_AND_REFRACTION: {
        var ret1 = hitPoint.clone().add(param.N.clone().multiplyScalar(scene.epsilon))
        var ret2 = hitPoint.clone().sub(param.N.clone().multiplyScalar(scene.epsilon))

        // 反射
        var reflectionDirection = reflect(dir.clone(), param.N.clone()).normalize()
        var reflectionRayOrig = (new Vector3().dotProduct(reflectionDirection, param.N) < 0) ? ret2 : ret1;
        var reflectionColor = castRay(reflectionRayOrig.clone(), reflectionDirection.clone(), scene, depth + 1);
        // hitColor = reflectionColor //.add(r2)

        // 折射
        var refractionDirection = refract(dir.clone(), param.N.clone(), payload.hit_obj.ior).normalize();
        var refractionRayOrig = (new Vector3().dotProduct(refractionDirection, param.N) < 0) ? ret2 : ret1;
        var refractionColor = castRay(refractionRayOrig.clone(), refractionDirection.clone(), scene, depth + 1);
        // hitColor = refractionColor //.add(r2)

        var kr = fresnel(dir.clone(), param.N, payload.hit_obj.ior);
        // if (kr > 0.2) {
        //   // hitColor = new Vector3(1, 0, 0)
        //   hitColor = reflectionColor.clone().multiplyScalar(0.2)
        // } else {
        //   hitColor = new Vector3(0, 1, 0)
        //   hitColor= refractionColor.clone().multiplyScalar(1)
        // }
        let aaa = reflectionColor.clone().multiplyScalar(kr)
        let bbb = refractionColor.clone().multiplyScalar(1 - kr)
        hitColor = aaa.add(bbb)
        // hitColor = reflectionColor.add(refractionColor)
        // console.error(reflectionColor);

        break;
      }
      case MaterialType.REFLECTION: {
        var kr = fresnel(dir.clone(), param.N.clone(), payload.hit_obj.ior);

        var ret1 = hitPoint.clone().add(param.N.clone().multiplyScalar(scene.epsilon))
        var ret2 = hitPoint.clone().sub(param.N.clone().multiplyScalar(scene.epsilon))

        var reflectionDirection = reflect(dir.clone(), param.N.clone());
        let ttt = new Vector3().dotProduct(reflectionDirection, param.N)
        // console.error(ttt);
        if (ttt < 0) {
          debugger
        }
        // if()
        var reflectionRayOrig = ttt < 0 ? ret2 : ret1
        const aaa = castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1)
        hitColor = aaa.multiplyScalar(kr)

        break;
      }
      default: {
        var lightAmt = new Vector3()
        var specularColor = new Vector3()
        var ret1 = hitPoint.clone().add(param.N.clone().multiplyScalar(scene.epsilon))
        var ret2 = hitPoint.clone().sub(param.N.clone().multiplyScalar(scene.epsilon))
        var shadowPointOrig = (new Vector3().dotProduct(dir, param.N) < 0) ? ret1 : ret2
        var light = scene.get_lights()[0]
        if (light) {
          var lightDir = light.position.clone().sub(hitPoint)
          // square of the distance between hitPoint and the light
          var lightDistance2 = new Vector3().dotProduct(lightDir, lightDir);
          lightDir = lightDir.normalize()
          var LdotN = Math.max(0, new Vector3().dotProduct(lightDir, param.N));

          // is the point in shadow, and is the nearest occluding object closer to the object than the light itself?
          var shadow_res = trace(shadowPointOrig, lightDir, scene.get_objects());
          var inShadow = false
          if (shadow_res && shadow_res.tNear * shadow_res.tNear < lightDistance2) {
            // inShadow = true
          }
          if (payload.hit_obj.name == "plane") {
            // debugger
          }

          let retTTT = light.intensity * LdotN;

          lightAmt.addScalar(inShadow ? 0 : retTTT)
          var reflectionDirection = reflect(new Vector3().copy(lightDir).negate(), param.N.clone());

          const ttt = Math.max(0, -new Vector3().dotProduct(reflectionDirection, dir))
          let ret = Math.pow(ttt, payload.hit_obj.specularExponent) * light.intensity;
          specularColor.addScalar(ret)
        }

        const obj = payload.hit_obj
        const objColor = obj.evalDiffuseColor()
        let ret1Color = lightAmt.clone().multiply(objColor)
        let ret2Color = specularColor.multiplyScalar(obj.Ks)
        hitColor = ret2Color.add(ret1Color)
        break;
      }
    }
  }

  return hitColor;
}

export class Renderer {
  constructor() {

  }

  Render(scene) {
    const framebuffer = []
    var scale = Math.tan(deg2rad(scene.fov * 0.5));
    var imageAspectRatio = scene.width / scene.height;
    var eye_pos = new Vector3(-1, 5, 10)

    var m = 0;
    for (var j = 0; j < scene.height; ++j) {
      for (var i = 0; i < scene.width; ++i) {
        var x;
        var y;
        x = imageAspectRatio * (2 * (i + 0.5) / scene.width - 1);
        y = 1 - (2 * (j + 0.5) / scene.height);
        var dir = new Vector3(x, y, -1).normalize()
        framebuffer[m++] = castRay(eye_pos, dir, scene, 0);
      }
      // UpdateProgress(j / (var) scene.height);
    }
    return framebuffer

  }
}
