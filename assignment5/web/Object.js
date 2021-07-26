import { MaterialType } from './global.js'
import { Vector3 } from './Vector3.js'

export default class Object {
  constructor() {
    this.materialType = MaterialType.DIFFUSE_AND_GLOSSY
    this.ior = 1.3
    this.Kd = 0.8
    this.Ks = 0.2
    this.diffuseColor = new Vector3(0.2,0.2,0.2)
    this.specularExponent = 25
    this.name = "object"
  }
  intersect() {
    //virtual
  }
  getSurfaceProperties() {
    //virtual
  }
  evalDiffuseColor() {
    return this.diffuseColor
  }
}
