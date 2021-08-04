import * as THREE from '../../../build/three.module.js';
import { PathTracingVS } from '../shader/PathTracingVS.js';
import { ScreenCopyFS } from '../shader/ScreenCopyFS.js';

class ScreenCopy {
	constructor(viewer) {
		this.viewer = viewer;
		this.scene = new THREE.Scene();
		this.renderTarget = undefined;

		this.mesh = undefined;

		this.initRenderTarget();
		this.initMesh();
	}

	get context() {
		return this.viewer.context;
	}

	get uniforms() {
		return this.mesh.material.uniforms;
	}

	initRenderTarget() {
		let context = this.context;
		//用于保存上一帧渲染结果的
		let renderTarget = new THREE.WebGLRenderTarget(context.drawingBufferWidth, context.drawingBufferHeight, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: false,
			stencilBuffer: false
		});
		renderTarget.texture.generateMipmaps = false;

		this.renderTarget = renderTarget;
	}

	initMesh() {
		let material = new THREE.ShaderMaterial({
			uniforms: {
				//用于保存渲染结果
				tPathTracedImageTexture: { value: null }
			},
			vertexShader: PathTracingVS,
			fragmentShader: ScreenCopyFS,
			depthWrite: false,
			depthTest: false
		});

		let geometry = new THREE.PlaneBufferGeometry(2, 2);

		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);
	}

	update(viewer) {}
}
export { ScreenCopy };
