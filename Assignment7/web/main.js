import Scene from './Scene.js'
import { Vector3 } from './Vector3.js'
import { loadObj } from './global.js'
import { Renderer } from './Renderer.js'
import CanvasTool from './CanvasTool.js'
import Light from './Light.js'
import TrialgleMesh from './TrialglesMesh.js'
import Material from './Material.js'

export default class App {
  constructor() {
    this.buildScene(256)
  }

  async buildScene(w, h) {
    // 加载模型
    const left = await loadObj("../models/cornellbox/left.obj")

    // 创建材质
    const red = new Material(Vector3(0.0));
    red.Kd = Vector3(0.63, 0.065, 0.05);

    this.scene = new Scene(w, h)
    this.initCanvas(w, h)
    this.renderer = new Renderer()
    const mesh = new TrialgleMesh(objInfo.verts, objInfo.faces)
    this.scene.AddObj(mesh)
    this.scene.buildBVH()

    const light = new Light(new Vector3(20, 20, 10), 1)
    this.scene.AddLight(light)
    this.update()
  }

  initCanvas(w, h) {
    let canvas = document.querySelector("#canvas")
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    const ctx = canvas.getContext("2d")

    ctx.strokeStyle = "#0000ff";
    ctx.strokeRect(0, 0, w, h);
    this.ctx = ctx
    this.w = w
    this.h = h
  }

  update() {
    console.time("render")
    const { w, h } = this
    const data = this.renderer.Render(this.scene)
    const imageData = this.ctx.getImageData(0, 0, w, h)
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
    console.timeEnd("render")
  }
}


window.onload = () => {
  new App()
}
