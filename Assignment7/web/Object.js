import { Vector3 } from './math/Vector3.js'

export default class Object {
  constructor() {
    this.name = "object"
  }

  intersect() {
    //virtual
  }
  getSurfaceProperties() {
    //virtual
  }
}
