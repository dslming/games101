import Scene from './Scene.js'
import Sphere from './Sphere.js'
import { Vector3 } from './Vector3.js'
import { MaterialType } from './global.js'
import { Renderer, reflect } from './Renderer.js'
import CanvasTool from './CanvasTool.js'
import Light from './Light.js'
import MeshTriangle from './Triangle.js'
import B from './Bounds3.js'
import OBJLoader from './MyOBJLoader.js'

export default class App {
  constructor() {
    this.buildScene(256)
  }

  initCanvas(w,h) {
    let canvas = document.querySelector("#canvas")
    canvas.width = w
    canvas.height = h
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    const ctx = canvas.getContext("2d")

    ctx.strokeStyle = "#0000ff";
    ctx.strokeRect(0, 0, w, h);
    this.ctx = ctx
  }

  getTrangeMesh() {
    return new Promise((resolve, rejuect) => {
      new OBJLoader().load("../models/bunny/bunny.obj", (ret) => {
        const count = ret.faces.length
        const indexes = []
        ret.faces.forEach(item => {
          indexes.push(...item)
        });
        const verts = []
        ret.verts.forEach(item => {
          verts.push(item.x*50)
          verts.push(item.y * 50)
          verts.push(item.z * 50)
        });
        resolve({
          indexes,
          count,
          verts,
          st: []
        })
      })
    })
  }

  async buildScene(_w) {
    const objInfo = await this.getTrangeMesh()
    console.error(objInfo);

    const w = _w
    const h = w
    this.w = w
    this.h = h
    this.scene = new Scene(w, h)
    this.initCanvas(w, h)

    this.renderer = new Renderer()

    const mesh = new MeshTriangle(objInfo.verts, objInfo.indexes, objInfo.count, objInfo.st)
    mesh.diffuseColor = new Vector3(0.5, 0.5, 0.5);
    mesh.materialType = MaterialType.DIFFUSE_AND_GLOSSY
    mesh.Ks = 1
    this.scene.AddObj(mesh)

    const light = new Light(new Vector3(20, 20, -10), 1)
    this.scene.AddLight(light)
    this.update()
  }

  update() {
    console.time("render")
    const { w,h} = this
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
