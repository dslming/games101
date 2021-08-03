import Triangle from './Triangle.js'
import Bounds3 from './matg/Bounds3.js'
import { MaterialType } from './global.js'
import { Vector3 } from './Vector3.js'
import BVHAccel from './BVH.js'

// 三角形组成的mesh
export default class TrialgleMesh {

  constructor(verts, faces, material) {
    this.triangles = []

    // 计算mesh aabb
    const bounds3 = new Bounds3()
    verts.forEach(item => {
      const x = item.x
      const y = item.y
      const z = item.z
      bounds3.pMin.min({ x, y, z })
      bounds3.pMax.max({ x, y, z })
    });

    // 创建三角形
    for (let i = 0; i < faces.length; i++) {
      const indexes = faces[i]
      const v0 = verts[indexes[0]]
      const v1 = verts[indexes[1]]
      const v2 = verts[indexes[2]]

      // 计算三角形的包围盒
      const bounds3 = new Bounds3()
      bounds3.pMin.min(v0)
      bounds3.pMin.min(v1)
      bounds3.pMin.min(v2)
      bounds3.pMax.max(v0)
      bounds3.pMax.max(v1)
      bounds3.pMax.max(v2)

      // 三角形的顶点
      const triangleVerts = [
        new Vector3(v0.x, v0.y, v0.z),
        new Vector3(v1.x, v1.y, v1.z),
        new Vector3(v2.x, v2.y, v2.z),
      ]
      const t = new Triangle({
        verts: triangleVerts,
        vertsIndex: [0, 1, 2],
        bounds: bounds3,
        name: "triangle_" + i,
        material
      })
      this.triangles.push(t)
    }

    this.bvh = new BVHAccel(this.triangles)
    this.bvh.name = "triangles"
    this.bounds3 = bounds3
  }

  getBounds() {
    return this.bounds3
  }

  getIntersection(orig, dir) {
    if (this.bvh) {
      return this.bvh.Intersect(orig, dir);
    }
  }
}
