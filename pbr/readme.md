# Cook-Torrance
[Cook-Torrance](https://garykeen27.wixsite.com/portfolio/cook-torrance-shading)
[文章 - 基于物理的渲染 - Cook–Torrance](http://www.codinglabs.net/article_physically_based_rendering_cook_torrance.aspx)
[文章 - 基于物理的渲染](http://www.codinglabs.net/article_physically_based_rendering.aspx)

渲染方程:
$$
L_o(p,ω_o)=\int _Ω f_r(p,ω_i,ω_o) L_i(p,ωi) n\cdot ωi dωi
$$

### Cook-Torrance
> https://zhuanlan.zhihu.com/p/152226698


Cook-Torrance BRDF的定义:
$$
f_r = k_d f_{lambert} + k_s f_{cook-torrance}
$$

$$
f_{lambert} = \frac{p}{\pi}
$$


$$
f_{cook-torrance} = \frac{F(l,h)G(l,v)D(h)}{4(n\cdot l)(n\cdot v)}
$$

- v为反射方向(观察方向)
- l 为入射方向
- n 为宏观表面法向
- h 为微平面法向

**函数F**：菲涅尔方程(Fresnel Rquation)，描述了物体表面在不同入射光角度下反射光线所占的比率

**函数G**：几何函数(Geometry Function)，描述了微平面自遮挡的属性。当一个平面相对比较粗糙的时候，平面表面上的微平面有可能挡住其他的微平面从而减少表面所反射的光线。

**函数D**:法线分布函数(Normal Distribution Function)，其代表了所有微观角度下微小镜面法线的分布情况，粗糙表面法线分布相对均匀，光滑表面法线分布相对集中 (这种解释可能会有些抽象，后面会给出更加直观的物理上的解释)




$$
f_{cook-torrance}() = \frac{F(l,h)G(l,v)D(h)}{4(n\cdot l)(n\cdot v)}
$$
