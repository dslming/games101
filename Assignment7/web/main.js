import Scene from './Scene.js'
import { Vector3 } from './math/Vector3.js'
import { loadObj } from './global.js'
import { Renderer } from './Renderer.js'
import CanvasTool from './tool/CanvasTool.js'
import Light from './Light.js'
import TrialgleMesh from './TrialglesMesh.js'
import Material from './Material.js'

export default class App {
  constructor() {
    const size = 256
    this.buildScene(size, size)
  }

  async buildScene(w, h) {
    this.scene = new Scene(w, h)
    this.renderer = new Renderer()
    this.initCanvas(w, h)



    // 创建材质
    const red = new Material(new Vector3(0,0,0));
    red.Kd = new Vector3(0.63, 0.065, 0.05);

    // 加载模型
    const left = await loadObj("../models/cornellbox/left.obj")
    const shortbox = await loadObj("../models/cornellbox/shortbox.obj")
    const right = await loadObj("../models/cornellbox/right.obj")

    /**
     * [1]     [2]
     *
     *
     *
     * [0]
     */
    // const z = -10
    // var verts = [
    //   { x: 5, y: -5, z: z },  //[0]
    //   { x: 5, y: 5, z: z },   //[1]
    //   { x: 8, y: 5, z: z },   //[2]
    // ];
    // const a = [
    //   // [2, 1, 0], //ok
    //   // [1, 0, 2] //no
    //   // [0, 2, 1],   //ok
    // ]

    const shortboxMesh = new TrialgleMesh(shortbox.verts, shortbox.faces, red)
    const leftMesh = new TrialgleMesh(left.verts, left.faces, red)
    const rightMesh = new TrialgleMesh(right.verts, right.faces, red)
    // const bunnyMesh = new TrialgleMesh(bunny.verts, bunny.faces, red)

    this.scene.AddObj(leftMesh)
    this.scene.AddObj(shortboxMesh)
    this.scene.AddObj(rightMesh)


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
