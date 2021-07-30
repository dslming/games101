import Triangle from './Triangle.js'
import Bounds3 from './Bounds3.js'
import { MaterialType } from './global.js'
import { Vector3 } from './Vector3.js'
import BVHAccel from './BVH.js'

// 三角形组成的网格
export default class TrialgleMesh {
  constructor(verts, faces) {
    this.triangles = []
    // 计算aabb
    const bounds3 = new Bounds3()
    verts.forEach(item => {
      const x = item.x * 50
      const y = item.y * 50
      const z = item.z * 50
      bounds3.pMin.min({ x, y, z })
      bounds3.pMax.max({ x, y, z })
    });

    for (let i = 0; i < faces.length; i++) {
      const bounds3 = new Bounds3()
      const indexes = faces[i]
      const v0 = verts[indexes[0]]
      const v1 = verts[indexes[1]]
      const v2 = verts[indexes[2]]
      bounds3.pMin.min(v0)
      bounds3.pMin.min(v1)
      bounds3.pMin.min(v2)

      bounds3.pMax.max(v0)
      bounds3.pMax.max(v1)
      bounds3.pMax.max(v2)

      const triangleVerts = [
        v0.x,
        v0.y,
        v0.z,
        v1.x,
        v1.y,
        v1.z,
        v2.x,
        v2.y,
        v2.z,
      ]
      const t = new Triangle(triangleVerts, [0, 1, 2], 1, [], bounds3)
      t.diffuseColor = new Vector3(0.5, 0.5, 0.5);
      t.materialType = MaterialType.DIFFUSE_AND_GLOSSY
      t.Ks = 1
      this.triangles.push(t)
    }

    new BVHAccel(this.triangles)
  }
}
