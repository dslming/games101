

//几何体的逆矩阵
uniform mat4 uShortBoxInvMatrix;
uniform mat4 uTallBoxInvMatrix;

//采样次数
uniform float uSampleCounter;
uniform float uFrameCounter;
uniform float uULen;
uniform float uVLen;

//分辨率
uniform vec2 uResolution;
uniform vec2 uRandomVec2;

//相机矩阵
uniform mat4 uCameraMatrix;

uniform sampler2D tPreviousTexture;
uniform sampler2D tBlueNoiseTexture;

#define INFINITY 1000000.
#define TWO_PI 6.28318530717958648
//定义平面数量
#define N_QUADS 6
#define N_SPHERES 1

#define uEPS_intersect.1

//定义物体的类型
#define LIGHT 0//光源
#define DIFF 1//非光源，普通的对象
#define SPEC 2

//定义光线
struct Ray{
    vec3 origin;
    vec3 direction;
};

struct Sphere{
    vec3 center;
    float radius;
    vec3 emission;
    vec3 color;
    int type;
};

//定义平面
struct Quad{
    //平面法线
    vec3 normal;
    
    //平面的4个点
    vec3 v0;
    vec3 v1;
    vec3 v2;
    vec3 v3;
    
    //自发光
    vec3 emission;
    //颜色
    vec3 color;
    //类型
    int type;
};

//定义相交点的信息
struct Intersection{
    vec3 normal;//相交点的法线
    vec3 emission;//自发光颜色
    vec3 color;//基础色
    int type;//相交
};

//用于保存光线追踪的结果
struct RayPayload{
    //当前计算的这一帧的像素结果
    vec3 radiance;
    // float t;
    vec3 scatterDirection;
    vec3 throughput;
    uint seed;
    vec3 worldHitPoint;
};

//用于生成随机数的种子
uvec2 seed;
vec4 randVec4=vec4(0);

float randNumber=0.;// the final randomly generated number (range: 0.0 to 1.0)
float counter=-1.;// will get incremented by 1 on each call to rand()
int channel=0;// the final selected color channel to use for rand() calc (range: 0 to 3, corresponds to R,G,B, or A)

float rand()
{
    counter++;// increment counter by 1 on every call to rand()
    // cycles through channels, if modulus is 1.0, channel will always be 0 (the R color channel)
    channel=int(mod(counter,4.));
    // but if modulus was 4.0, channel will cycle through all available channels: 0,1,2,3,0,1,2,3, and so on...
    randNumber=randVec4[channel];// get value stored in channel 0:R, 1:G, 2:B, or 3:A
    return fract(randNumber);// we're only interested in randNumber's fractional value between 0.0 (inclusive) and 1.0 (non-inclusive)
}

//这里用来生成噪声
//https://www.shadertoy.com/view/4tXyWN
float rng()
{
    seed+=uvec2(1);
    uvec2 q=1103515245U*((seed>>1U)^(seed.yx));
    uint n=1103515245U*((q.x)^(q.y>>3U));
    return float(n)*(1./float(0xffffffffU));
}

// Generate a random unsigned int from two unsigned int values, using 16 pairs
// of rounds of the Tiny Encryption Algorithm. See Zafar, Olano, and Curtis,
// "GPU Random Numbers via the Tiny Encryption Algorithm"
int tea(int val0,int val1){
    int v0=val0;
    int v1=val1;
    int s0=0;
    
    for(int n=0;n<16;n++){
        s0+=0x9e3779b9;
        v0+=((v1<<4)+0xa341316c)^(v1+s0)^((v1>>5)+0xc8013ea4);
        v1+=((v0<<4)+0xad90777d)^(v0+s0)^((v0>>5)+0x7e95761e);
    }
    
    return v0;
}

//半球面内随机采样
vec3 randomCosWeightedDirectionInHemisphere(vec3 nl)
{
    float r=sqrt(rand());// cos-weighted distribution in hemisphere
    float phi=rand()*TWO_PI;
    float x=r*cos(phi);
    float y=r*sin(phi);
    float z=sqrt(1.-x*x-y*y);
    
    vec3 U=normalize(cross(vec3(.7071067811865475,.7071067811865475,0),nl));
    vec3 V=cross(nl,U);
    return normalize(x*U+y*V+z*nl);
}

// tentFilter from Peter Shirley's 'Realistic Ray Tracing (2nd Edition)' book, pg. 60
float tentFilter(float x)
{
    return(x<.5)?sqrt(2.*x)-1.:1.-sqrt(2.-(2.*x));
}

Quad quads[N_QUADS];
Sphere spheres[N_SPHERES];

void InitSceneMesh(void){
    
    // //自发光颜色
    vec3 emi=vec3(0.);
    
    spheres[0]=Sphere(
        vec3(213.,213.,-332.),
        100.,
        emi,
        vec3(.7,.7,.7),
        DIFF
    );
    
    vec3 z=vec3(0);// No color value, Black
    vec3 L1=vec3(1.,1.,1.)*30.;// Bright Yellowish light
    
    quads[0]=Quad(
        //法线
        vec3(0.,0.,1.),
        //面的四个点
        vec3(0.,0.,-559.2),
        vec3(549.6,0.,-559.2),
        vec3(549.6,548.8,-559.2),
        vec3(0.,548.8,-559.2),
        //自发光颜色
        z,
        //材质本身颜色
        vec3(1),
        //对象类型
        DIFF
    );// Back Wall
    quads[1]=Quad(vec3(1.,0.,0.),vec3(0.,0.,0.),vec3(0.,0.,-559.2),vec3(0.,548.8,-559.2),vec3(0.,548.8,0.),z,vec3(1.,0.,0.),DIFF);// Left Wall Red
    quads[2]=Quad(vec3(-1.,0.,0.),vec3(549.6,0.,-559.2),vec3(549.6,0.,0.),vec3(549.6,548.8,0.),vec3(549.6,548.8,-559.2),z,vec3(0.,1.,0.),DIFF);// Right Wall Green
    quads[3]=Quad(vec3(0.,-1.,0.),vec3(0.,548.8,-559.2),vec3(549.6,548.8,-559.2),vec3(549.6,548.8,0.),vec3(0.,548.8,0.),z,vec3(1),DIFF);// Ceiling
    quads[4]=Quad(vec3(0.,1.,0.),vec3(0.,0.,0.),vec3(549.6,0.,0.),vec3(549.6,0.,-559.2),vec3(0.,0.,-559.2),z,vec3(1),DIFF);// Floor
    
    quads[5]=Quad(vec3(0.,-1.,0.),vec3(213.,548.,-332.),vec3(343.,548.,-332.),vec3(343.,548.,-227.),vec3(213.,548.,-227.),L1,z,LIGHT);// Area Light Rectangle in ceiling
}

//平面光源采样
vec3 sampleQuadLight(vec3 x,vec3 nl,Quad light,out float weight){
    vec3 randPointOnLight;
    
    //在光源平面上随机选取一点
    randPointOnLight.x=mix(light.v0.x,light.v1.x,clamp(rand(),.1,.9));
    //由于是平面，所以高度不变
    randPointOnLight.y=light.v0.y;
    randPointOnLight.z=mix(light.v0.z,light.v3.z,clamp(rand(),.1,.9));
    
    //光线起点到光源的射线
    vec3 dirToLight=randPointOnLight-x;
    
    //长 * 宽 这里计算面积
    float r2=distance(light.v0,light.v1)*distance(light.v0,light.v3);
    
    float d2=dot(dirToLight,dirToLight);
    float cos_a_max=sqrt(1.-clamp(r2/d2,0.,1.));
    dirToLight=normalize(dirToLight);
    float dotNlRayDir=max(0.,dot(nl,dirToLight));
    weight=2.*(1.-cos_a_max)*max(0.,-dot(dirToLight,light.normal))*dotNlRayDir;
    weight=clamp(weight,0.,1.);
    return dirToLight;
}

//执行相交测试
// optimized algorithm for solving quadratic equations developed by Dr. Po-Shen Loh -> https://youtu.be/XKBX0r3J-9Y
// Adapted to root finding (ray t0/t1) for all quadric shapes (sphere, ellipsoid, cylinder, cone, etc.) by Erich Loftis
void solveQuadratic(float A,float B,float C,out float t0,out float t1){
    float invA=1./A;
    B*=invA;
    C*=invA;
    float neg_halfB=-B*.5;
    float u2=neg_halfB*neg_halfB-C;
    float u=u2<0.?neg_halfB=0.:sqrt(u2);
    t0=neg_halfB-u;
    t1=neg_halfB+u;
}
//-----------------------------------------------------------------------
float SphereIntersect(float rad,vec3 pos,Ray ray)
//-----------------------------------------------------------------------
{
    float t0,t1;
    vec3 L=ray.origin-pos;
    float a=dot(ray.direction,ray.direction);
    float b=2.*dot(ray.direction,L);
    float c=dot(L,L)-(rad*rad);
    solveQuadratic(a,b,c,t0,t1);
    return t0>0.?t0:t1>0.?t1:INFINITY;
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

//平面求交
float QuadIntersect(vec3 v0,vec3 v1,vec3 v2,vec3 v3,Ray r,bool isDoubleSided){
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
    
    for(int i=0;i<N_QUADS;i++){
        d=QuadIntersect(quads[i].v0,quads[i].v1,quads[i].v2,quads[i].v3,r,false);
        
        //找出相交距离最短的那个，即最近的那个
        if(d<t){
            t=d;
            intersec.normal=normalize(quads[i].normal);
            intersec.emission=quads[i].emission;
            intersec.color=quads[i].color;
            intersec.type=quads[i].type;
        }
    };
    
    //与球体进行相交
    
    d=SphereIntersect(spheres[0].radius,spheres[0].center,r);
    
    if(d<t){
        t=d;
        intersec.normal=normalize((r.origin+r.direction*t)-spheres[0].center);
        intersec.emission=spheres[0].emission;
        intersec.color=spheres[0].color;
        intersec.type=spheres[0].type;
    }
    
    return t;
    
}

vec3 CalculateRadiance(inout RayPayload payload){
    
    //相机的右方向
    vec3 camRight=vec3(uCameraMatrix[0][0],uCameraMatrix[0][1],uCameraMatrix[0][2]);
    //相机的上方向
    vec3 camUp=vec3(uCameraMatrix[1][0],uCameraMatrix[1][1],uCameraMatrix[1][2]);
    //相机的视线方向
    vec3 camForward=vec3(-uCameraMatrix[2][0],-uCameraMatrix[2][1],-uCameraMatrix[2][2]);
    
    seed=uvec2(uFrameCounter,uFrameCounter+1.)*uvec2(gl_FragCoord);// old way of generating random numbers
    
    randVec4=texture(tBlueNoiseTexture,(gl_FragCoord.xy+(uRandomVec2*255.))/255.);// new way of rand()
    
    Quad light=quads[5];
    
    //每个像素采样5次
    int sampleCountPerPixel=5;
    
    vec3 accumCol=vec3(0);
    vec3 mask=vec3(1);
    vec3 n,nl,nextOrigin;
    vec3 dirToLight;
    
    //记录光线的弹射次数，第一次用于采样直接光
    int diffuseCount=0;
    
    vec2 pixelOffset=vec2(tentFilter(rng()),tentFilter(rng()));
    
    //射线的起点
    vec2 pixelPos=((gl_FragCoord.xy+pixelOffset)/uResolution)*2.-1.;
    
    //射线的方向
    vec3 rayDir=normalize(pixelPos.x*camRight*uULen+pixelPos.y*camUp*uVLen+camForward);
    
    //生成射线
    Ray r=Ray(cameraPosition,normalize(rayDir));
    
    Intersection intersec;
    
    bool bounceIsSpecular=true;
    bool sampleLight=false;
    bool createCausticRay=false;
    
    float t;
    vec3 x;
    float weight,p;
    
    //这里光线最大弹射5次
    for(int bounces=0;bounces<5;bounces++){
        //场景相交测试
        t=RayIntersect(r,intersec);
        
        //如果与场景中的对象均没有相交
        if(t==INFINITY)
        break;
        
        //如果相交的对象是灯光，则结束此次弹射
        if(intersec.type==LIGHT){
            accumCol=mask*intersec.emission;
            
            break;
        }
        
        //如果光线经过几次弹射之后依然无法击中光源，则结束此次弹射
        if(sampleLight)
        break;
        
        // useful data  法线归一化
        n=normalize(intersec.normal);
        nl=dot(n,r.direction)<0.?normalize(n):normalize(-n);
        //这里计算相交的那个点，这个点为下次弹射的起点
        x=r.origin+r.direction*t;
        
        //这里材质如果是漫反射
        if(intersec.type==DIFF)// Ideal DIFFUSE reflection
        {
            diffuseCount++;
            //当前弹射到的颜色迭代相加
            mask*=intersec.color;
            
            if(diffuseCount==1&&rand()<.5)
            {
                //这里在半球面内随机采样，用于计算下一次光线的投射方向
                r=Ray(x,randomCosWeightedDirectionInHemisphere(nl));
                r.origin+=nl*uEPS_intersect;
                continue;
            }
            
            dirToLight=sampleQuadLight(x,nl,light,weight);
            mask*=weight;
            
            r=Ray(x,dirToLight);
            r.origin+=nl*uEPS_intersect;
            // sampleLight=true;
            continue;
            
        }// end if (intersec.type == DIFF)
        
    }
    
    return max(vec3(0),accumCol);
    
}

void main(void){
    
    RayPayload payload;
    //构造场景中的mesh
    InitSceneMesh();
    
    //根据射线计算辐照度颜色
    vec3 pixelColor=CalculateRadiance(payload);
    
    //拿到上一帧的结果
    vec3 previousColor=texelFetch(tPreviousTexture,ivec2(gl_FragCoord.xy),0).rgb;
    //如果是第一帧，则为0
    if(uFrameCounter==1.)
    {
        previousColor=vec3(0);
    }
    
    pc_fragColor=vec4(pixelColor+previousColor,1.);
}
