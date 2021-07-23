import Scene from './Scene.js'
import Sphere from './Sphere.js'
import { Vector3 } from './Vector3.js'
import { MaterialType } from './global.js'
import { Renderer, reflect } from './Renderer.js'
import CanvasTool from './CanvasTool.js'
import Light from './Light.js'
export default class App {
  constructor() {
    window.lm = this
     const w = 32
     const h = w
    let scene = new Scene(w, h)
    let s1 = new Sphere(new Vector3(0, 0, -8), 1)
    // s1.materialType = MaterialType.REFLECTION
    s1.diffuseColor = new Vector3(0.6, 0.7, 0.8);
    // scene.AddObj(s1)

    let s2 = new Sphere(new Vector3(0, -1.5, -10), 1)
    s2.materialType = MaterialType.REFLECTION
    s2.diffuseColor = new Vector3(1, 0.7, 0.8);
    // s2.diffuseColor = MaterialType.REFLECTION_AND_REFRACTION
    s2.ior = 1.5
    scene.AddObj(s2)

    let l1 = new Light(new Vector3(-10, 10, 10), 1)
    // let l2 = new Light(new Vector3(30, 50, -12), 0.5)
    scene.AddLight(l1)
    this.light = l1
    // scene.AddLight(l2)

    let renderer = new Renderer()
    this.scene = scene
    // let data = renderer.Render(scene)

    // show by canvas
    let canvas = document.querySelector("#canvas")
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    const ctx = canvas.getContext("2d")

    // let imageData = ctx.getImageData(0, 0, w, h)
    // for (let i = 0; i < data.length; i++) {
    //   const pixel = data[i]
    //   const color = [pixel.x * 255, pixel.y * 255, pixel.z * 255, 255]
    //   CanvasTool.setPixelByIndex(
    //     {
    //       index: i,
    //       color, data: imageData.data,
    //       width: w
    //     })
    // }
    // ctx.putImageData(imageData, 0, 0);
    ctx.strokeStyle = "#0000ff";
    ctx.strokeRect(0, 0, w, h);

    this.ctx = ctx
    this.renderer = renderer
    this.w = w
    this.h = h
    this.update()

    // let ret = new Vector3(1, 0, 0).reflect(new Vector3(0, -1, 0))
    // // let ret = reflect(new Vector3(-1, 1, 0), new Vector3(0, 1, 0))
    // console.error(ret);

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
        width: w
      })
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
}


window.onload = () => {
  new App()
}
