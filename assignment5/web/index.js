import Scene from './Scene.js'
import Sphere from './Sphere.js'
import { Vector3 } from './Vector3.js'
import { MaterialType } from './global.js'
import Renderer from './Renderer.js'

export default class App {
  constructor() {
    console.error(123);
    let scene = new Scene()
    let s1 = new Sphere(new Vector3(-1, 0, -12), 2)
    s1.diffuseColor = MaterialType.DIFFUSE_AND_GLOSSY
    scene.AddObj(s1)
  }
}


window.onload = () => {
  new App()
}
