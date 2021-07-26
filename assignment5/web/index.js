import Scene from './Scene.js'
import Sphere from './Sphere.js'
import { Vector3 } from './Vector3.js'
import { MaterialType } from './global.js'
import { Renderer, reflect } from './Renderer.js'
import CanvasTool from './CanvasTool.js'
import Light from './Light.js'
import Triangle from './Triangle.js'

export default class App {
  constructor() {
    window.lm = this
     const w = 512
     const h = w
    let scene = new Scene(w, h)
    let s1 = new Sphere(new Vector3(-3, 0, -7), 2)
    s1.name = "s1"
    s1.materialType = MaterialType.DIFFUSE_AND_GLOSSY
    s1.diffuseColor = new Vector3(0.6, 0.7, 0.8);
    scene.AddObj(s1)

    let s2 = new Sphere(new Vector3(0.5, -0.5, -8), 1.5)
    s2.name = "s2"
    s2.materialType = MaterialType.REFLECTION
    s2.diffuseColor = new Vector3(1, 0.7, 0.8);
    s2.ior = 1.5
    scene.AddObj(s2)

    let l1 = new Light(new Vector3(-20, 70, 20), 1)
    scene.AddLight(l1)
    this.light = l1

    var verts = [
      -5, -3, -6,  //[0]
      5, -3, -6,   //[1]
      5, -3, -16,  //[2]
      -5, -3, -16];//[3]
    var vertIndex = [
      0, 1, 3,
      1,2, 3
    ]
    var st =  [  0, 0 ,  1, 0 ,  1, 1 ,  0, 1 ];

    let t = new Triangle(verts, vertIndex, 2, st)
    t.diffuseColor = new Vector3(0.5, 0.8, 0.5);
    scene.AddObj(t)

    let renderer = new Renderer()
    this.scene = scene

    // show by canvas
    let canvas = document.querySelector("#canvas")
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    const ctx = canvas.getContext("2d")

    ctx.strokeStyle = "#0000ff";
    ctx.strokeRect(0, 0, w, h);

    this.ctx = ctx
    this.renderer = renderer
    this.w = w
    this.h = h
    this.update()
  }

  get lightPos() {
    return this.light.position
  }
  set lightPos(pos) {
    this.light.position.set(pos.x, pos.y, pos.z)
    this.update()
  }

  update() {
    const { w,h} = this
    let data = this.renderer.Render(this.scene)
    let imageData = this.ctx.getImageData(0, 0, w, h)
    for (let i = 0; i < data.length; i++) {
      const pixel = data[i]
      const color = [pixel.x * 255, pixel.y * 255, pixel.z * 255, 255]
      CanvasTool.setPixelByIndex({
        index: i,
        color,
        data: imageData.data,
        width: w,
        height: h,
      })
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
}


window.onload = () => {
  new App()
}
