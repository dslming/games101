import { Vector3 } from './Vector3.js';

export default class Bounds3 {
  constructor(pMin, pMax) {
    this.pMin = pMin || new Vector3(+Infinity, +Infinity, +Infinity);
    this.pMax = pMax || new Vector3(-Infinity, -Infinity, -Infinity);
  }

  // 对角线
  Diagonal() {
    return this.pMax.clone().sub(this.pMin)
  }

  // 最大范围的轴向,x,y,z
  maxExtent() {
    var d = this.Diagonal();
    if (d.x > d.y && d.x > d.z)
      return 0;
    else if (d.y > d.z)
      return 1;
    else
      return 2;
  }

  // 表面积
  SurfaceArea() {
    var d = this.Diagonal();
    return 2 * (d.x * d.y + d.x * d.z + d.y * d.z);
  }

  // 质心
  Centroid() {
    // return 0.5 * pMin + 0.5 * pMax;
    let a = this.pMin.clone()
    let b = this.pMax.clone()
    return a.add(b).multiplyScalar(0.5)
  }

  // 交集
  Intersect(b) {
    const min = new Vector3(Math.max(this.pMin.x, b.min.x), Math.max(this.pMin.x, b.min.x), Math.max(this.pMin.x, b.min.x))
    const max = new Vector3(Math.min(this.pMax.x, b.max.x), Math.min(this.pMax.x, b.max.x), Math.min(this.pMax.x, b.max.x))
    return new Bounds3(min,max);
  }

  Offset(p) {
    var o = p.sub(this.pMin);
    if (this.pMax.x > this.pMin.x)
      o.x /= this.pMax.x - this.pMin.x;
    if (this.pMax.y > this.pMin.y)
      o.y /= this.pMax.y - this.pMin.y;
    if (this.pMax.z > this.pMin.z)
      o.z /= this.pMax.z - this.pMin.z;
    return o;
  }

  // 重叠
  Overlaps( b1, b2) {
    var x = (b1.pMax.x >= b2.pMin.x) && (b1.pMin.x <= b2.pMax.x);
    var y = (b1.pMax.y >= b2.pMin.y) && (b1.pMin.y <= b2.pMax.y);
    var z = (b1.pMax.z >= b2.pMin.z) && (b1.pMin.z <= b2.pMax.z);
    return (x && y && z);
  }

  // 点是否在盒子里
  Inside(p, b) {
        return (p.x >= b.pMin.x && p.x <= b.pMax.x && p.y >= b.pMin.y &&
          p.y <= b.pMax.y && p.z >= b.pMin.z && p.z <= b.pMax.z);
  }

  /**
   * 判断包围盒 BoundingBox 与光线是否相交
   * @param invDir = (1.0 / x, 1.0 / y, 1.0 / z)
   * @param dirIsNeg: ray direction(x, y, z)
   */
  IntersectP(ray,invDir,dirIsNeg) {
    var t1 = 0;
    var t2 = 0;
    t1 = (this.pMin.x - ray.origin.x) * invDir.x;
    t2 = (this.pMax.x - ray.origin.x) * invDir.x;
    var txmin = (dirIsNeg[0] > 0) ? t1 : t2;
    var txmax = (dirIsNeg[0] > 0) ? t2 : t1;
    t1 = (this.pMin.y - ray.origin.y) * invDir.y;
    t2 = (this.pMax.y - ray.origin.y) * invDir.y;
    var tymin = (dirIsNeg[1] > 0) ? t1 : t2;
    var tymax = (dirIsNeg[1] > 0) ? t2 : t1;
    t1 = (this.pMin.z - ray.origin.z) * invDir.z;
    t2 = (this.pMax.z - ray.origin.z) * invDir.z;
    var tzmin = (dirIsNeg[2] > 0) ? t1 : t2;
    var tzmax = (dirIsNeg[2] > 0) ? t2 : t1;

    if (
      Math.max(Math.max(txmin, tymin), tzmin) <
      Math.min(Math.min(txmax, tymax), tzmax) &&
      Math.min(Math.min(txmax, tymax), tzmax))
      return true;
    else
      return false;
  }

  // 合并
  Union(b1,b2) {
    var ret;
    ret.min = b1.pMin.min(b2.pMin);
    ret.max = b1.pMax.min(b2.pMax);
    return ret;
  }
}
