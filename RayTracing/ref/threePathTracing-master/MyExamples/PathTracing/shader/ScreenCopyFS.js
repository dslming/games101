let ScreenCopyFS = `

uniform sampler2D tPathTracedImageTexture;

void main()
{
    pc_fragColor=texelFetch(tPathTracedImageTexture,ivec2(gl_FragCoord.xy),0);
}

`;

export { ScreenCopyFS };
