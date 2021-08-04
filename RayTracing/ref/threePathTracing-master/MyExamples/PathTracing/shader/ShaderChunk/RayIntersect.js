let RayIntersect = `

// optimized algorithm for solving quadratic equations developed by Dr. Po-Shen Loh -> https://youtu.be/XKBX0r3J-9Y
// Adapted to root finding (ray t0/t1) for all quadric shapes (sphere, ellipsoid, cylinder, cone, etc.) by Erich Loftis
void solveQuadratic(float A, float B, float C, out float t0, out float t1)
{
	float invA = 1.0 / A;
	B *= invA;
	C *= invA;
	float neg_halfB = -B * 0.5;
	float u2 = neg_halfB * neg_halfB - C;
	float u = u2 < 0.0 ? neg_halfB = 0.0 : sqrt(u2);
	t0 = neg_halfB - u;
	t1 = neg_halfB + u;
}
//-----------------------------------------------------------------------
float SphereIntersect( float rad, vec3 pos, Ray ray )
//-----------------------------------------------------------------------
{
	float t0, t1;
	vec3 L = ray.origin - pos;
	float a = dot( ray.direction, ray.direction );
	float b = 2.0 * dot( ray.direction, L );
	float c = dot( L, L ) - (rad * rad);
	solveQuadratic(a, b, c, t0, t1);
	return t0 > 0.0 ? t0 : t1 > 0.0 ? t1 : INFINITY;
}

//计算光线与三角形的相交距离，如果未相交，则返回INFINITY
float TriangleIntersect(vec3 v0,vec3 v1,vec3 v2,Ray r,bool isDoubleSided)
{
    vec3 edge1=v1-v0;
    vec3 edge2=v2-v0;
    vec3 pvec=cross(r.direction,edge2);
    float det=1./dot(edge1,pvec);
    if(!isDoubleSided&&det<0.)
    return INFINITY;
    vec3 tvec=r.origin-v0;
    float u=dot(tvec,pvec)*det;
    vec3 qvec=cross(tvec,edge1);
    float v=dot(r.direction,qvec)*det;
    float t=dot(edge2,qvec)*det;
    return(u<0.||u>1.||v<0.||u+v>1.||t<=0.)?INFINITY:t;
}

float QuadIntersect(vec3 v0,vec3 v1,vec3 v2,vec3 v3,Ray r,bool isDoubleSided)
//----------------------------------------------------------------------------------
{
    return min(TriangleIntersect(v0,v1,v2,r,isDoubleSided),TriangleIntersect(v0,v2,v3,r,isDoubleSided));
}

float RayIntersect(Ray r,inout Intersection intersec){
    vec3 normal;
    //距离
    float d;
    //默认的相交距离
    float t=INFINITY;
    bool isRayExiting=false;//光线是否停止

    // d=QuadIntersect(quads[0].v0,quads[0].v1,quads[0].v2,quads[0].v3,r,false);

    for(int i=0; i<N_QUADS; i++){
        d=QuadIntersect(quads[i].v0,quads[i].v1,quads[i].v2,quads[i].v3,r,false);
        
        //找出相交距离最短的那个，即最近的那个
        if(d < t){
            t=d;
            intersec.normal=normalize(quads[i].normal);
            intersec.emission=quads[i].emission;
            intersec.color=quads[i].color;
            intersec.type=quads[i].type;
        }
    };

    //与球体进行相交

    d = SphereIntersect(spheres[0].radius, spheres[0].center, r);

    if(d < t){
        t=d;
        intersec.normal= normalize((r.origin + r.direction * t) - spheres[0].center);
        intersec.emission=spheres[0].emission;
        intersec.color=spheres[0].color;
        intersec.type=spheres[0].type;
    }

    return t;

}

`;

export { RayIntersect };
