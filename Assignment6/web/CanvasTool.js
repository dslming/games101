// canvas 绘制图片工具
export default class CanvasTool {
  // 设置像素根据线线x,y
  static setPixel({ x, y, color, d, width }) {
    const w = width
    d[(y * w + x) * 4 + 0] = color[0]
    d[(y * w + x) * 4 + 1] = color[1]
    d[(y * w + x) * 4 + 2] = color[2]
    d[(y * w + x) * 4 + 3] = color[3]
  }

  // 设置像素根据索引
  static setPixelByIndex({ index, color, data }) {
     data[index * 4 + 0] = color[0]
     data[index * 4 + 1] = color[1]
     data[index * 4 + 2] = color[2]
     data[index * 4 + 3] = color[3]
  }
}
