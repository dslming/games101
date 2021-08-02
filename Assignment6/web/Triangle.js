// 一个三角形网格

import Object from './Object.js'
import { Vector3 } from './Vector3.js'
import { Vector2 } from './Vector2.js'
import Bounds3 from './Bounds3.js'

// Moller-Trumbore
function rayTriangleIntersect(v0, v1, v2, orig, dir, param) {
  var e1 = v1.sub(v0);
  var e2 = v2.sub(v0);
  var s = orig.clone().sub(v0);
  var s1 = new Vector3().crossProduct(dir, e2);
  var s2 = new Vector3().crossProduct(s, e1);

  var temp = 1 / new Vector3().dotProduct(s1, e1);
  var t = new Vector3().dotProduct(s2, e2) * temp;
  var b1 = new Vector3().dotProduct(s1, s) * temp;
  var b2 = new Vector3().dotProduct(s2, dir) * temp;

  if (t > 0 && b1 > 0 && b2 > 0 && ((1 - b1 - b2) > 0)) {
    //std::cout << "inside triangle"<<'\n';
    param.tNear = t;
    param.uv = {
      x: b1,
      y: b2
    };
    return true;
  }
  return false;
}

export default class Triangle extends Object {
  constructor(verts, vertsIndex, numTris, st, bounds3,i) {
    super()
    this.bounds3 = bounds3
    this.name = "triangle_"+i
    this.numTriangles
    this.vertices = []
    this.vertexIndex = []
    this.stCoordinates = []
    this.getMeshTriangle(verts, vertsIndex, numTris, st)
  }

  getMeshTriangle(verts, vertsIndex, numTris, st) {
    this.vertices = verts
    this.vertexIndex = vertsIndex //std::unique_ptr < var[] > (new var[numTris * 3]);
    this.numTriangles = numTris;
    this.stCoordinates = st
  }
  getVertsByIndex(index) {
    let x = this.vertices[index * 3]
    let y = this.vertices[index * 3 + 1]
    let z = this.vertices[index * 3 + 2]
    return new Vector3(x, y, z)
  }

  getStCoordByIndex(index) {
    let x = this.stCoordinates[index]
    let y = this.stCoordinates[index + 1]
    return new Vector2(x, y)
  }

  getSurfaceProperties(param) {
    const { vertexIndex } = this
    const v0 = this.getVertsByIndex(vertexIndex[0])
    const v1 = this.getVertsByIndex(vertexIndex[1])
    const v2 = this.getVertsByIndex(vertexIndex[2])
    var e0 = v1.clone().sub(v0).normalize();
    var e1 = v2.clone().sub(v1).normalize();
    param.N = new Vector3().crossProduct(e0, e1).normalize()
  }

  getBounds() {
    return this.bounds3
  }

  getIntersection(orig, dir) {
    // const { tNearK: tnear } = param
    const param = {}
    for (var k = 0; k < this.numTriangles; ++k) {
      const v0 = this.getVertsByIndex(this.vertexIndex[k * 3]);
      const v1 = this.getVertsByIndex(this.vertexIndex[k * 3 + 1]);
      const v2 = this.getVertsByIndex(this.vertexIndex[k * 3 + 2]);

      const obj = {
        tNear: 0,
        uv: {},
      }
      let ret = rayTriangleIntersect(v0, v1, v2, orig, dir, obj)
      if (ret) {
        param.distance = obj.tNear;
        param.tNear = obj.tNear;
        param.uvK = obj.uv
        param.indexK = k;
        param.hit_obj = this

        return param
      } else {
        return null
      }
    }
  }
}
