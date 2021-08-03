// 一个三角形mesh

import Object from './Object.js'
import { Vector3 } from './math/Vector3.js'

// Moller-Trumbore
function rayTriangleIntersect(v0, v1, v2, orig, dir) {
  var e1 = v1.sub(v0);
  var e2 = v2.sub(v0);
  var s = orig.clone().sub(v0);
  var s1 = Vector3.crossProduct(dir, e2);
  var s2 = Vector3.crossProduct(s, e1);

  var temp = 1 / Vector3.dotProduct(s1, e1);
  var t = Vector3.dotProduct(s2, e2) * temp;
  var b1 = Vector3.dotProduct(s1, s) * temp;
  var b2 = Vector3.dotProduct(s2, dir) * temp;

  let ret = null
  if (t > 0 && b1 > 0 && b2 > 0 && ((1 - b1 - b2) > 0)) {
    ret = {}
    ret.distance = t;
  }
  return ret;
}

export default class Triangle extends Object {
  constructor(param) {
    super()
    const { verts, bounds, name, material } = param
    this.name = name
    this.numTriangles
    this.vertices = verts
    this.bounds = bounds
    this.material = material
    this.normal = this.calcNormal()
  }

  calcNormal() {
    const [ v0, v1, v2 ] = this.vertices
    const e0 = v1.clone().sub(v0).normalize();
    const e1 = v2.clone().sub(v1).normalize();
    return Vector3.crossProduct(e0, e1).normalize()
  }

  getBounds() {
    return this.bounds
  }

  getIntersection(orig, dir) {
    const [v0, v1, v2] = this.vertices
    let ret = rayTriangleIntersect(v0, v1, v2, orig, dir)
    if (ret) {
      ret.hitObj = this
    }
    return ret
  }
}
