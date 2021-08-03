import {Vector3} from './math/Vector3.js'
import { EPSILON, get_random_float, M_PI } from './global.js'

export default class Material {
  constructor(e) {
    this.m_emission = e || new Vector3()
    this.ior = 0
    this.specularExponent = 0
    this.Kd = new Vector3()
    this.Ks = new Vector3()
   }

  toWorld(a, N) {
    var B, C;
    if (Math.abs(N.x) > Math.abs(N.y)) {
      var invLen = 1.0/ Math.sqrt(N.x * N.x + N.z * N.z);
      C = new Vector3(N.z * invLen, 0.0, -N.x * invLen);
    } else {
      var invLen = 1.0/ Math.sqrt(N.y * N.y + N.z * N.z);
      C = new Vector3(0.0, N.z * invLen, -N.y * invLen);
    }
    B = Vector3.crossProduct(C, N);
    const t1 = B.multiplyScalar(a.x)
    const t2 = C.multiplyScalar(a.y)
    const t3 = N.multiplyScalar(a.z)
    return t1.add(t2).add(t3)
  }

  getEmission() {
    return this.m_emission
  }

  hasEmission() {
    if (this.m_emission.length() > EPSILON) return true
    else return false
  }

  sample(wi, N) {
     // uniform sample on the hemisphere
    var x_1 = get_random_float()
    var x_2 = get_random_float();
    var z = Math.abs(1.0 - 2.0 * x_1);
    var r = Math.sqrt(1.0 - z * z)
    var phi = 2 * M_PI * x_2;
    var localRay = new Vector3(r * Math.cos(phi), r * Math.sin(phi), z);
    return this.toWorld(localRay, N);
  }

  pdf(wi, wo, N) {
     if (Vector3.dotProduct(wo, N) > 0.0)
       return 0.5/ M_PI;
     else
       return 0.0;
  }

  eval(wi, wo, N) {
    // calculate the contribution of diffuse   model
    var cosalpha = Vector3.dotProduct(N, wo);
    if (cosalpha > 0.0) {
      const v = this.Kd / M_PI;
      var diffuse = new Vector3(v,v,v)
      return diffuse;
    } else
      return Vector3f(0.0);
  }
}
