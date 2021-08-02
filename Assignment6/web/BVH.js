import Bounds3 from './Bounds3.js'
import { Vector3 } from './Vector3.js'

const SplitMethod = {
  NAIVE: 0,
  SAH: 1
}

class BVHBuildNode {
  constructor() {
    this.bounds = new Bounds3()
    this.left = null
    this.right = null
    this.object = {}
  }
};


export default class BVHAccel {
  constructor(primitives, maxPrimsInNode = 1) {
    this.splitAxis = 0
    this.firstPrimOffset = 0
    this.nPrimitives = 0

    this.maxPrimsInNode = maxPrimsInNode
    this.primitives = primitives

    if (primitives.length == 0) {
      return
    }
    console.time("bvh build")
    this.root = this.recursiveBuild(primitives)
    console.error(this.root);

    console.timeEnd("bvh build")
  }


  Intersect(orig, dir) {
    return this.getIntersection(this.root,orig,dir)
  }

  getIntersection(node, orig, dir) {
    const dirisNeg = [
      dir.x > 0,
      dir.y > 0,
      dir.z > 0,
    ]
    const invDir = new Vector3(1/dir.x, 1/dir.y, 1/dir.z)
    const ray = {
      origin: orig,
    }

    if (node.bounds.IntersectP(ray, invDir, dirisNeg) == false) {
      return null
    }

    if (node.left == null && node.right == null) {
      return node.object.getIntersection(orig, dir);
    }

    const hit1 = this.getIntersection(node.left, orig, dir);
    const hit2 = this.getIntersection(node.right, orig, dir);
    if (hit1 && hit2) {
      return (hit1.distance < hit2.distance) ? hit1 : hit2;
    }
    if (hit2 || hit1) {
      debugger
    }
  }


  recursiveBuild(objects) {
    if (!Array.isArray(objects)) return
    const node = new BVHBuildNode()
    const size = objects.length
    let bounds = new Bounds3()
    for (let i = 0; i < objects.length; ++i) {
      bounds = Bounds3.Union(bounds, objects[i].getBounds());
    }

    if (objects.length == 1) {
      node.bounds = objects[0].getBounds();
      node.object = objects[0]
      node.left = null;
      node.right = null;
      return node;
    } else if (objects.length == 2) {
      node.left = this.recursiveBuild([objects[0]]);
      node.right = this.recursiveBuild([objects[1]]);
      node.bounds = Bounds3.Union(node.left.bounds, node.right.bounds);
      return node;
    } else {
      let centroidBounds = new Bounds3()
      for (let i = 0; i < objects.length; ++i) {
        centroidBounds = Bounds3.UnionVector3(centroidBounds, objects[i].getBounds().Centroid());
      }

      let dim = centroidBounds.maxExtent();
      switch (dim) {
        case 0:
          objects.sort((a, b) => {
            return a.getBounds().x - b.getBounds().x
          })
          break;
        case 1:
          objects.sort((a, b) => {
            return a.getBounds().y - b.getBounds().y
          })
          break;
        case 2:
          objects.sort((a, b) => {
            return a.getBounds().z - b.getBounds().z
          })
          break;
      }

      const leftshapes = []
      const rightshapes = []
      for (let j = 0; j < size; j++) {
        const obj = objects[j]
        if (j < size / 2) {
          leftshapes.push(obj)
        } else {
          rightshapes.push(obj)
        }
      }

      node.left = this.recursiveBuild(leftshapes);
      node.right = this.recursiveBuild(rightshapes);
      node.bounds = Bounds3.Union(node.left.bounds, node.right.bounds)
    }
    return node
  }

}
