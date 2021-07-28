import Bounds3 from './Bounds3'

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

    this.root = this.recursiveBuild()
  }

  WorldBound() { }

  Intersect() { }

  getIntersection() { }

  IntersectP() { }

  recursiveBuild(objects) {
    if (!Array.isArray(objects)) return


  }

}
