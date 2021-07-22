import { MaterialType } from './global.js'

export default class Object {
  constructor() {
    this.materialType = MaterialType.DIFFUSE_AND_GLOSSY
    this.ior = 1.3
    this.Kd = 0.8
    this.Ks = 0.2
    this.diffuseColor = 0.2
    this.specularExponent = 25
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
