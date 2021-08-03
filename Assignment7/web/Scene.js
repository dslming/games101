import { Vector3 } from './Vector3.js'
import BVHAccel from './BVH.js'

export default class Scene {
  constructor(w, h) {
    this.objects = []
    this.lights = []
    this.width = w||1280;
    this.height = h||960;
    this.fov = 90;
    this.backgroundColor = new Vector3(0.235294, 0.67451, 0.843137);
    // this.backgroundColor = new Vector3(1, 1, 1);
    this.maxDepth = 5;
    this.epsilon = 0.00001;
  }

  buildBVH() {
    this.bvh = new BVHAccel(this.objects)
    this.bvh.name = "scene"
  }

  intersect(orig, dir) {
    return this.bvh.Intersect(orig, dir);
  }

  AddObj(object) {
    this.objects.push(object)
  }
  AddLight(light) {
    this.lights.push(light)
  }

  get_objects() {
    return this.objects
  }

  get_lights() {
    return this.lights
  }

}
