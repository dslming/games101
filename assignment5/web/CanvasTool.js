export default class CanvasTool {
  static setPixel({ x, y, color, d, width }) {
    const w = width
    d[(y * w + x) * 4 + 0] = color[0]
    d[(y * w + x) * 4 + 1] = color[1]
    d[(y * w + x) * 4 + 2] = color[2]
    d[(y * w + x) * 4 + 3] = color[3]
  }

  static setPixelByIndex({ index, color, data, width }) {
     let rows = Math.floor(index / width)
     let columns = Math.max(index - rows * width, 0);
    CanvasTool.setPixel({ x: rows, y: columns, color, d: data, width })
  }
}
