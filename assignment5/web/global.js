// 包含了整个框架中会使用的基本函数和变量
const M_PI = 3.14159265358979323846;
let kInfinity = Infinity

function clamp(lo, hi, v) {
  return Math.max(lo, Math.min(hi, v));
}

function solveQuadratic(a, b, c, options) {
  var discr = b * b - 4 * a * c;
  if (discr < 0)
    return false;
  else if (discr == 0)
    options.t0 = options.t1 = -0.5 * b / a;
  else {
    var q = (b > 0) ? -0.5 * (b + Math.sqrt(discr)) : -0.5 * (b - Math.sqrt(discr));
    options.t0 = q / a;
    options.t1 = c / q;
  }
  if (options.t0 > options.t1) {
    var temp = options.t0
    options.t0 = options.t1
    options.t1 = temp
  }
  return true;
}

const MaterialType = {
  DIFFUSE_AND_GLOSSY: 0,
  REFLECTION_AND_REFRACTION: 1,
  REFLECTION: 2
};

function get_random_float() {
   return Math.random()
}

function UpdateProgress(progress) {
  var barWidth = 70;
  var ret = ""
  ret  += "[";
  var pos = barWidth * progress;
  for (var i = 0; i < barWidth; ++i) {
    if (i < pos)
      ret+= "=";
    else if (i == pos)
      ret+= ">";
    else
      ret+= " ";
  }
  ret += "] "
  ret += progress * 100.0
  console.error(ret);
}

export {
  M_PI,
  clamp,
  solveQuadratic,
  MaterialType,
  get_random_float,
  UpdateProgress,
  kInfinity
}
