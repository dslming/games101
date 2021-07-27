// 包含了整个框架中会使用的基本函数和变量
const M_PI = 3.14159265358979323846;

const MaterialType = {
  DIFFUSE_AND_GLOSSY: 0,
  REFLECTION_AND_REFRACTION: 1,
  REFLECTION: 2
};

// 求解 ax^2+bx+c = 0 二次方程的根
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

export {
  M_PI,
  solveQuadratic,
  MaterialType,
}
