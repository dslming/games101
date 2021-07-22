import { Vector3 } from './Vector3.js'
import { solveQuadratic } from './global.js'
import Object from './Object.js'

export default class Sphere extends Object {
  constructor(c, r) {
    super()
    this.center = c
    this.radius = r
    this.radius2 = r*r
  }

  intersect( orig, dir, param ) {
    // analytic solution
    var L = new Vector3().subVectors(orig, this.center);
    var a = new Vector3().dotProduct(dir, dir);
    var b = 2 * new Vector3().dotProduct(dir, L);
    var c = new Vector3().dotProduct(L, L) - this.radius2;
    var options = {
      t0: 0,
      t1: 0
    }
    if (!solveQuadratic(a, b, c, options))
      return false;
    if (options.t0 < 0)
      options.t0 = options.t1;
    if (options.t0 < 0)
      return false;
    param.tNearK = options.t0;
    return true;
  }

  getSurfaceProperties(param) {
    param.N = new Vector3().subVectors(param.P, this.center).normalize();
  }
}
