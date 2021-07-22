function rayTriangleIntersect(v0,v1, v2, orig, dir, tnear, u, v) {
  var e1 = v1 - v0;
  var e2 = v2 - v0;
  var s = orig - v0;
  var s1 = crossProduct(dir, e2);
  var s2 = crossProduct(s, e1);

  var temp = 1 / dotProduct(s1, e1);
  var t = dotProduct(s2, e2) * temp;
  var b1 = dotProduct(s1, s) * temp;
  var b2 = dotProduct(s2, dir) * temp;

  if (t > 0 && b1 > 0 && b2 > 0 && ((1 - b1 - b2) > 0)) {
    //std::cout << "inside triangle"<<'\n';
    tnear = t;
    u = b1;
    v = b2;
    return true;
  }
  return false;
}

export default class Triangle {
  constructor() {
    this.numTriangles
    this.vertices = []
    this.vertexIndex = []
    this.stCoordinates = []
    this.getMeshTriangle()
  }

  getMeshTriangle( verts, vertsIndex,numTris, st) {
    var maxIndex = 0;
    for (var i = 0; i < numTris * 3; ++i)
      if (vertsIndex[i] > maxIndex)
        maxIndex = vertsIndex[i];
    maxIndex += 1;
    vertices = new Array(maxIndex)
    memcpy(vertices.get(), verts, sizeof(Vector3f) * maxIndex);
    vertexIndex = numTris * 3 //std::unique_ptr < var[] > (new var[numTris * 3]);
    //memcpy(vertexIndex.get(), vertsIndex, sizeof(var) * numTris * 3);
    numTriangles = numTris;
    stCoordinates = []//std::unique_ptr < Vector2f[] > (new Vector2f[maxIndex]);
    // memcpy(stCoordinates.get(), st, sizeof(Vector2f) * maxIndex);
  }

  intersect( orig, dir,tnear, index, uv) {
    var intersect = false;
    for (var k = 0; k < numTriangles; ++k) {
      const v0 = vertices[vertexIndex[k * 3]];
      const v1 = vertices[vertexIndex[k * 3 + 1]];
      const v2 = vertices[vertexIndex[k * 3 + 2]];
      var t, u, v;
      if (rayTriangleIntersect(v0, v1, v2, orig, dir, t, u, v) && t < tnear) {
        tnear = t;
        uv.x = u;
        uv.y = v;
        index = k;
        intersect |= true;
      }
    }

    return intersect;
  }

  getSurfaceProperties(index,uv,N, st) {
    const v0 = vertices[vertexIndex[index * 3]];
    const v1 = vertices[vertexIndex[index * 3 + 1]];
    const v2 = vertices[vertexIndex[index * 3 + 2]];
    var e0 = normalize(v1 - v0);
    var e1 = normalize(v2 - v1);
    N = normalize(crossProduct(e0, e1));
    const st0 = stCoordinates[vertexIndex[index * 3]];
    const st1 = stCoordinates[vertexIndex[index * 3 + 1]];
    const st2 = stCoordinates[vertexIndex[index * 3 + 2]];
    st = st0 * (1 - uv.x - uv.y) + st1 * uv.x + st2 * uv.y;
  }

  evalDiffuseColor( st) {
    var scale = 5;
    var pattern = (fmodf(st.x * scale, 1) > 0.5) ^ (fmodf(st.y * scale, 1) > 0.5);
    return lerp(Vector3f(0.815, 0.235, 0.031), Vector3f(0.937, 0.937, 0.231), pattern);
  }
}
