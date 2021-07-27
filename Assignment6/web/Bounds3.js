import { Vector3 } from './Vector3.js';

export default class Bounds3 {
  constructor(min,max) {
    this.min = min || new Vector3(+Infinity, +Infinity, +Infinity);
    this.max = max || new Vector3(-Infinity, -Infinity, -Infinity);
  }

  // 对角线
  Diagonal() {
    return this.max.clone().sub(this.min)
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
    let a = this.min.clone()
    let b = this.max.clone()
    return a.add(b).multiplyScalar(0.5)
  }

  // 交集
  Intersect(b) {
    const min = new Vector3(Math.max(this.min.x, b.min.x), Math.max(this.min.x, b.min.x), Math.max(this.min.x, b.min.x))
    const max = new Vector3(Math.min(this.max.x, b.max.x), Math.min(this.max.x, b.max.x), Math.min(this.max.x, b.max.x))
    return new Bounds3(min,max);
  }

  Offset(p) {
    var o = p.sub(this.min);
    if (this.max.x > this.min.x)
      o.x /= this.max.x - this.min.x;
    if (this.max.y > this.min.y)
      o.y /= this.max.y - this.min.y;
    if (this.max.z > this.min.z)
      o.z /= this.max.z - this.min.z;
    return o;
  }

  // 重叠
  Overlaps( b1, b2) {
    var x = (b1.max.x >= b2.min.x) && (b1.min.x <= b2.max.x);
    var y = (b1.max.y >= b2.min.y) && (b1.min.y <= b2.max.y);
    var z = (b1.max.z >= b2.min.z) && (b1.min.z <= b2.max.z);
    return (x && y && z);
  }

  // 点是否在盒子里
  Inside(p, b) {
    return (p.x >= b.pMin.x && p.x <= b.pMax.x && p.y >= b.pMin.y &&
      p.y <= b.pMax.y && p.z >= b.pMin.z && p.z <= b.pMax.z);
  }


    /**
     * 判断包围盒 BoundingBox 与光线是否相交
     * @param invDir: ray direction(x, y, z
     */
  IntersectP(ray,invDir,dirIsNeg) {
    // ), invDir=(1.0/x,1.0/y,1.0/z), use this because Multiply is faster that Division
    // dirIsNeg: ray direction(x,y,z), dirIsNeg=[int(x>0),int(y>0),int(z>0)], use this to simplify your logic
    // TODO test if ray bound intersects

    //t  = (px - ox) / dx
    double t1 = 0;
    double t2 = 0;
    t1 = (pMin.x - ray.origin.x) * invDir.x;
    t2 = (pMax.x - ray.origin.x) * invDir.x;
    double txmin = (dirIsNeg[0] > 0) ? t1 : t2;
    double txmax = (dirIsNeg[0] > 0) ? t2 : t1;
    t1 = (pMin.y - ray.origin.y) * invDir.y;
    t2 = (pMax.y - ray.origin.y) * invDir.y;
    double tymin = (dirIsNeg[1] > 0) ? t1 : t2;
    double tymax = (dirIsNeg[1] > 0) ? t2 : t1;
    t1 = (pMin.z - ray.origin.z) * invDir.z;
    t2 = (pMax.z - ray.origin.z) * invDir.z;
    double tzmin = (dirIsNeg[2] > 0) ? t1 : t2;
    double tzmax = (dirIsNeg[2] > 0) ? t2 : t1;

    if (std::max(std::max(txmin, tymin), tzmin) < std::min(std::min(txmax, tymax), tzmax) && std::min(std::min(txmax, tymax), tzmax))
      return true;
    else
      return false;
  }
}
