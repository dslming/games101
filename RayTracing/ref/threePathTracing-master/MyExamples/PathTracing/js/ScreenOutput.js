import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial } from '../../../build/three.module.js';
import { PathTracingVS } from '../shader/PathTracingVS.js';
import { ScreenOutputFS } from '../shader/ScreenOutputFS.js';

/**
 * 最终输出的场景，在这个场景里面会渲染一个占据屏幕的plane
 * 最终的渲染结果会呈现在这个plane上
 */
class ScreenOutput {
	constructor() {
		this.scene = new Scene();
		this.quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		this.mesh = undefined;
		this.initMesh();
	}

	get uniforms() {
		return this.mesh.material.uniforms;
	}

	initMesh() {
		let material = new ShaderMaterial({
			uniforms: {
				uOneOverSampleCounter: { value: 0.0 },
				//路径追踪最终的渲染结果
				tPathTracedImageTexture: { value: null }
			},
			vertexShader: PathTracingVS,
			fragmentShader: ScreenOutputFS,
			depthWrite: false,
			depthTest: false
		});

		let geometry = new PlaneBufferGeometry(2, 2);

		this.mesh = new Mesh(geometry, material);
		this.scene.add(this.mesh);
	}

	update(viewer) {
		let uniforms = this.uniforms;

		uniforms.uOneOverSampleCounter.value = 1.0 / viewer.sampleCounter;
	}
}

export { ScreenOutput };
