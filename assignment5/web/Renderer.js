import { M_PI, clamp, kInfinity } from './global.js'
import { Vector3 } from './Vector3.js';

function deg2rad(deg) {
  return deg * M_PI / 180.0;
}

// Compute reflection direction
function reflect(I, N) {
  // return I - 2 * temp * N;
  const temp = new Vector3().dotProduct(I, N)
  const a = N.multiplyScalar(2*temp)
  return I.sub(a);
}

function refract(I, N, ior) {
  var cosi = clamp(-1, 1, dotProduct(I, N));
  var etai = 1, etat = ior;
  var n = N;
  if (cosi < 0) {
    cosi = -cosi;
  } else {
    // std:: swap(etai, etat);
    n = -N;
  }
  var eta = etai / etat;
  var k = 1 - eta * eta * (1 - cosi * cosi);
  return k < 0 ? 0 : eta * I + (eta * cosi - Math.sqrtf(k)) * n;
}

function fresnel( I, N,ior) {
  var cosi = clamp(-1, 1, dotProduct(I, N));
  var etai = 1, etat = ior;
  if (cosi > 0) {
    // std:: swap(etai, etat);
  }
  // Compute sini using Snell's law
  var sint = etai / etat * sqrtf(Math.max(0, 1 - cosi * cosi));
  // Total internal reflection
  if (sint >= 1) {
    return 1;
  } else {
    var cost = sqrtf(Math.max(0, 1 - sint * sint));
    cosi = Math.abs(cosi);
    var Rs = ((etat * cosi) - (etai * cost)) / ((etat * cosi) + (etai * cost));
    var Rp = ((etai * cosi) - (etat * cost)) / ((etai * cosi) + (etat * cost));
    return (Rs * Rs + Rp * Rp) / 2;
  }
}

function trace( orig, dir,objects) {
  let tNear = kInfinity;
  var payload = null
  for (let i = 0; i < objects.length; i++) {
    var object = objects[i]
    const option = {
      tNearK: kInfinity,
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

function castRay( orig, dir, scene, depth) {
  if (depth > scene.maxDepth) {
    return Vector3f(0.0, 0.0, 0.0);
  }

  var hitColor = scene.backgroundColor;
  var payload = trace(orig, dir, scene.get_objects());

  if (payload) {
    var temp1 = new Vector3().copy(dir).multiplyScalar(payload.tNear);
    var temp2 = new Vector3().copy(orig)
    var hitPoint = new Vector3().addVectors(temp1,temp2)
    // var N; // normal
    // var st; // st coordinates
    const param = {
      P: hitPoint,
      N: [],
      st: []
    }
    payload.hit_obj.getSurfaceProperties(param);
    switch (payload.hit_obj.materialType) {
      // case REFLECTION_AND_REFRACTION: {
      //   var reflectionDirection = normalize(reflect(dir, N));
      //   var refractionDirection = normalize(refract(dir, N, payload.hit_obj.ior));
      //   var reflectionRayOrig = (dotProduct(reflectionDirection, N) < 0) ?
      //     hitPoint - N * scene.epsilon :
      //     hitPoint + N * scene.epsilon;
      //   var refractionRayOrig = (dotProduct(refractionDirection, N) < 0) ?
      //     hitPoint - N * scene.epsilon :
      //     hitPoint + N * scene.epsilon;
      //   var reflectionColor = castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1);
      //   var refractionColor = castRay(refractionRayOrig, refractionDirection, scene, depth + 1);
      //   var kr = fresnel(dir, N, payload.hit_obj.ior);
      //   hitColor = reflectionColor * kr + refractionColor * (1 - kr);
      //   break;
      // }
      // case REFLECTION: {
      //   var kr = fresnel(dir, N, payload.hit_obj.ior);
      //   var reflectionDirection = reflect(dir, N);
      //   var reflectionRayOrig = (dotProduct(reflectionDirection, N) < 0) ?
      //     hitPoint + N * scene.epsilon :
      //     hitPoint - N * scene.epsilon;
      //   hitColor = castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1) * kr;
      //   break;
      // }
      default: {
        // [comment]
        // We use the Phong illumation model int the default case. The phong model
        // is composed of a diffuse and a specular reflection component.
        // [/comment]
        var lightAmt = new Vector3()
        var specularColor = new Vector3()
        var ret1 = hitPoint.add(param.N.multiplyScalar(scene.epsilon))
        var ret2 = hitPoint.sub(param.N.multiplyScalar(scene.epsilon))
        var shadowPointOrig = (new Vector3().dotProduct(dir, param.N) < 0) ? ret1:ret2
        var light = scene.get_lights()[0]
        if (light) {
          var lightDir = light.position.clone().sub(hitPoint).normalize()
          // square of the distance between hitPoint and the light
          var lightDistance2 = new Vector3().dotProduct(lightDir, lightDir);
          // lightDir = normalize(lightDir);
          var LdotN = Math.max(0, new Vector3().dotProduct(lightDir, param.N));
          // is the point in shadow, and is the nearest occluding object closer to the object than the light itself?
          var shadow_res = trace(shadowPointOrig, lightDir, scene.get_objects());
          var inShadow = shadow_res && (shadow_res.tNear * shadow_res.tNear < lightDistance2);

          let retTTT = inShadow ? 0 : light.intensity * LdotN;
          if (1) console.error(light.intensity * LdotN);

          lightAmt.addScalar(retTTT)
          var reflectionDirection = reflect(new Vector3().copy(lightDir).negate(), param.N);

          const ttt = Math.max(0, -new Vector3().dotProduct(reflectionDirection, dir))
          let ret = Math.pow(ttt, payload.hit_obj.specularExponent) * light.intensity;
          specularColor.addScalar(ret)
        }

        const obj = payload.hit_obj
        const objColor = obj.evalDiffuseColor(obj.Kd)
        //console.error(lightAmt);
        let ret1Color = lightAmt.multiply(objColor)
        let ret2Color = specularColor.multiplyScalar(obj.Ks)
        hitColor = ret1Color + ret2Color
        break;
      }
    }
  }

  return hitColor;
}

class hit_payload {
  constructor() {
    this.tNear;
    this.index;
    this.uv;
    this.hit_obj;
  }
};

export default class Renderer {
  constructor() {

  }

  Render(scene) {
    const framebuffer = []
    var scale = Math.tan(deg2rad(scene.fov * 0.5));
    var imageAspectRatio = scene.width / scene.height;
    var eye_pos = new Vector3()

    var m = 0;
    for (var j = 0; j < scene.height; ++j) {
      for (var i = 0; i < scene.width; ++i) {
        var x;
        var y;
        x = imageAspectRatio * (2 * (i + 0.5) / scene.width - 1);
        y = 1 - (2 * (j + 0.5 ) / scene.height);
        var dir = new Vector3(x, y, -1).normalize()
        framebuffer[m++] = castRay(eye_pos, dir, scene, 0);
      }
      // UpdateProgress(j / (var) scene.height);
    }
    return framebuffer

  }
}
