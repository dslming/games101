import Bounds3 from './Bounds3.js'

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

    this.root = this.recursiveBuild(primitives)
  }

  WorldBound() { }

  Intersect() { }

  getIntersection() { }

  IntersectP() { }

  recursiveBuild(objects) {
    if (!Array.isArray(objects)) return
    const node = new BVHBuildNode()

    // let bounds = new Bounds3()
    for (let i = 0; i < objects.length; ++i) {
      // bounds = Bounds3.Union(bounds, objects[i].getBounds());
      if (objects.length == 1) {
        node.bounds = objects[0].getBounds();
        node.object = objects[0];
        node.left = null;
        node.right = null;
        return node;
      } else if (objects.length == 2) {
        node.left = recursiveBuild([objects[0]]);
        node.right = recursiveBuild([objects[1]]);
        node.bounds = Bounds3.Union(node.left.bounds, node.right.bounds);
        return node;
      } else {
        let centroidBounds = new Bounds3()
        for (let i = 0; i < objects.length; ++i)
          centroidBounds = Bounds3.UnionVector3(centroidBounds, objects[i].getBounds().Centroid());
        let dim = centroidBounds.maxExtent();
        switch (dim) {
          case 0:
            objects.sort((a, b) => {
              return a.getBounds().x < b.getBounds().x
            })
            // std::sort(objects.begin(), objects.end(), [](auto f1, auto f2) {
            //   return f1 - > getBounds().Centroid().x <
            //     f2 - > getBounds().Centroid().x;
            // });
            break;
          case 1:
            // std::sort(objects.begin(), objects.end(), [](auto f1, auto f2) {
            //   return f1 - > getBounds().Centroid().y <
            //     f2 - > getBounds().Centroid().y;
            // });
            break;
          case 2:
            // std::sort(objects.begin(), objects.end(), [](auto f1, auto f2) {
            //   return f1 - > getBounds().Centroid().z <
            //     f2 - > getBounds().Centroid().z;
            // });
            break;
        }
      }
    }
  }

}
