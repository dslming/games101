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

  intersect( orig, dir, tnear ) {
    // analytic solution
    var L = new Vector3().subVectors(orig.center);
    var a = new Vector3().dotProduct(dir, dir);
    var b = 2 * new Vector3().dotProduct(dir, L);
    var c = new Vector3().dotProduct(L, L) - radius2;
    var t0, t1;
    if (!solveQuadratic(a, b, c, t0, t1))
      return false;
    if (t0 < 0)
      t0 = t1;
    if (t0 < 0)
      return false;
    tnear = t0;
    return true;
  }
}
