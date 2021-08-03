import OBJLoader from './lib/MyOBJLoader.js'

const M_PI = 3.14159265358979323846;

function deg2rad(deg = 0) {
  return deg * M_PI / 180.0;
}

function get_random_float() {
  return Math.random()
}

function loadObj(url) {
  const scale = 1
  return new Promise((resolve, rejuect) => {
    new OBJLoader().load(url, (ret) => {
      ret.verts.forEach(item => {
        item.x = item.x * scale
        item.y = item.y * scale
        item.z = item.z * scale
      });

      resolve({
        verts: ret.verts,
        faces: ret.faces
      })
    })
  })
}

const EPSILON = 0.00001;

export {
  deg2rad,
  EPSILON,
  get_random_float,
  M_PI,
  loadObj
}
