import { M_PI, clamp } from './global.js'

function deg2rad(deg) {
  return deg * M_PI / 180.0;
}

// Compute reflection direction
function reflect(I, N) {
  return I - 2 * dotProduct(I, N) * N;
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
  var tNear = kInfinity;
  var payload = {}
  for (let object in objects) {
    var tNearK = kInfinity;
    var indexK;
    var uvK;
    if (object.intersect(orig, dir, tNearK, indexK, uvK) && tNearK < tNear) {
      payload.hit_obj = object.get();
      payload.tNear = tNear
      payload.index = indexK
      payload.uv = uvK
      tNear = tNearK;
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
    var hitPoint = orig + dir * payload.tNear;
    var N; // normal
    var st; // st coordinates
    payload.hit_obj.getSurfaceProperties(hitPoint, dir, payload.index, payload.uv, N, st);
    switch (payload.hit_obj.materialType) {
      case REFLECTION_AND_REFRACTION: {
        var reflectionDirection = normalize(reflect(dir, N));
        var refractionDirection = normalize(refract(dir, N, payload.hit_obj.ior));
        var reflectionRayOrig = (dotProduct(reflectionDirection, N) < 0) ?
          hitPoint - N * scene.epsilon :
          hitPoint + N * scene.epsilon;
        var refractionRayOrig = (dotProduct(refractionDirection, N) < 0) ?
          hitPoint - N * scene.epsilon :
          hitPoint + N * scene.epsilon;
        var reflectionColor = castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1);
        var refractionColor = castRay(refractionRayOrig, refractionDirection, scene, depth + 1);
        var kr = fresnel(dir, N, payload.hit_obj.ior);
        hitColor = reflectionColor * kr + refractionColor * (1 - kr);
        break;
      }
      case REFLECTION: {
        var kr = fresnel(dir, N, payload.hit_obj.ior);
        var reflectionDirection = reflect(dir, N);
        var reflectionRayOrig = (dotProduct(reflectionDirection, N) < 0) ?
          hitPoint + N * scene.epsilon :
          hitPoint - N * scene.epsilon;
        hitColor = castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1) * kr;
        break;
      }
      default: {
        // [comment]
        // We use the Phong illumation model int the default case. The phong model
        // is composed of a diffuse and a specular reflection component.
        // [/comment]
        var lightAmt = 0, specularColor = 0;
        var shadowPointOrig = (dotProduct(dir, N) < 0) ?
          hitPoint + N * scene.epsilon :
          hitPoint - N * scene.epsilon;
        // [comment]
        // Loop over all lights in the scene and sum their contribution up
        // We also apply the lambert cosine law
        // [/comment]
        var light = scene.get_lights()
        if (light) {
          var lightDir = light.position.hitPoint;
          // square of the distance between hitPoint and the light
          var lightDistance2 = dotProduct(lightDir, lightDir);
          lightDir = normalize(lightDir);
          var LdotN = Math.max(0, dotProduct(lightDir, N));
          // is the point in shadow, and is the nearest occluding object closer to the object than the light itself?
          var shadow_res = trace(shadowPointOrig, lightDir, scene.get_objects());
          var inShadow = shadow_res && (shadow_res.tNear * shadow_res.tNear < lightDistance2);

          lightAmt += inShadow ? 0 : light.intensity * LdotN;
          var reflectionDirection = reflect(-lightDir, N);

          specularColor += powf(Math.max(0, -dotProduct(reflectionDirection, dir)),
            payload.hit_obj.specularExponent) * light.intensity;
        }

        hitColor = lightAmt * payload.hit_obj.evalDiffuseColor(st) * payload.hit_obj.Kd + specularColor *
          payload.hit_obj.Ks;
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
  constructor(scene) {

  }
}
