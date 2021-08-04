let PathTracingVS = `
    void main()
    {
        gl_Position = vec4( position, 1.0 );
    }
`;

export { PathTracingVS };
