import Object from './Object.js'
import {Vector3} from './Vector3.js'
import { Vector2 } from './Vector2.js'

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
  constructor(verts, vertsIndex, numTris,st) {
    super()
    this.name = "plane"
    this.numTriangles
    this.vertices = []
    this.vertexIndex = []
    this.stCoordinates = []
    this.getMeshTriangle(verts, vertsIndex, numTris,st)
  }

  getMeshTriangle( verts, vertsIndex,numTris,st) {
    var maxIndex = 0;
    for (var i = 0; i < numTris * 3; ++i)
      if (vertsIndex[i] > maxIndex)
        maxIndex = vertsIndex[i];
    maxIndex += 1;
    this.vertices = verts
    this.vertexIndex = vertsIndex //std::unique_ptr < var[] > (new var[numTris * 3]);
    this.numTriangles = numTris;
    this.stCoordinates = st
  }
  getVertsByIndex(index) {
    let x = this.vertices[index*3]
    let y = this.vertices[index*3+1]
    let z = this.vertices[index*3 + 2]
    return new Vector3(x,y,z)
  }

   getStCoordByIndex(index) {
     let x = this.stCoordinates[index]
     let y = this.stCoordinates[index + 1]
     return new Vector2(x, y)
   }

  intersect(orig, dir, param) {
    const { tNearK:tnear } = param
    var intersect = false;
    for (var k = 0; k < this.numTriangles; ++k) {
      const v0 = this.getVertsByIndex(this.vertexIndex[k * 3]);
      const v1 = this.getVertsByIndex(this.vertexIndex[k * 3 + 1]);
      const v2 = this.getVertsByIndex(this.vertexIndex[k * 3 + 2]);
      // var t, u, v;
      const obj = {
        tNear: 0,
        uv: {},
      }
      let ret = rayTriangleIntersect(v0, v1, v2, orig, dir, obj)
      if (ret && obj.tNear < tnear) {
        param.tNearK = obj.tNear;
        param.uvK = obj.uv
        param.indexK = k;
        intersect |= true;
      }
    }

    return intersect;
  }

  getSurfaceProperties(param) {
    const { index,uv } = param
    const { vertexIndex } = this
    const v0 = this.getVertsByIndex(vertexIndex[index * 3])
    const v1 = this.getVertsByIndex(vertexIndex[index * 3 + 1])
    const v2 = this.getVertsByIndex(vertexIndex[index * 3 + 2])
    var e0 = v1.clone().sub(v0).normalize();
    var e1 = v2.clone().sub(v1).normalize();
    param.N = new Vector3().crossProduct(e0, e1).normalize()
    const st0 = this.getStCoordByIndex(vertexIndex[index * 3])
    const st1 = this.getStCoordByIndex(vertexIndex[index * 3 + 1])
    const st2 = this.getStCoordByIndex(vertexIndex[index * 3 + 2])
    const ret1 = st0.multiplyScalar((1 - uv.x - uv.y))
    const ret2 = st1.multiplyScalar(uv.x)
    const ret3 = st2.multiplyScalar(uv.y)
    param.st = ret1.add(ret2).add(ret3)
  }

  // evalDiffuseColor( st) {
  //   // var scale = 5;
  //   // var pattern = (fmodf(st.x * scale, 1) > 0.5) ^ (fmodf(st.y * scale, 1) > 0.5);

  //   // return lerp(Vector3f(0.815, 0.235, 0.031), Vector3f(0.937, 0.937, 0.231), pattern);
  //   return new Vector3(0,1,0)
  // }
}
