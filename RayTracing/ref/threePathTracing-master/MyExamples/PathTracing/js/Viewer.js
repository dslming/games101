import * as THREE from '../../../build/three.module.js';
import Stats from './../../../libs/jsm/libs/stats.module.js';
import { PathTracing } from './PathTracing.js';
import { ScreenCopy } from './ScreenCopy.js';
import { ScreenOutput } from './ScreenOutput.js';
import { Utils } from './Utils.js';

class Viewer {
	constructor(container) {
		this.renderer = this.createRenderer();
		this.context = this.renderer.getContext();

		this.screenCopy = new ScreenCopy(this);
		this.pathTracing = new PathTracing(this);
		this.screenOutput = new ScreenOutput();

		this.pathTracing.uniforms.tPreviousTexture.value = this.screenCopyRenderTarget.texture;
		this.screenCopy.uniforms.tPathTracedImageTexture.value = this.pathTracingRenderTarget.texture;
		this.screenOutput.uniforms.tPathTracedImageTexture.value = this.pathTracingRenderTarget.texture;

		this.sampleCounter = 0.0;
		this.frameCounter = 0.0;

		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);
	}

	get pathTracingScene() {
		return this.pathTracing.scene;
	}

	get screenCopyScene() {
		return this.screenCopy.scene;
	}

	get screenOutputScene() {
		return this.screenOutput.scene;
	}

	get camera() {
		return this.pathTracing.camera;
	}

	get quadCamera() {
		return this.screenOutput.quadCamera;
	}

	get pathTracingRenderTarget() {
		return this.pathTracing.renderTarget;
	}

	get screenCopyRenderTarget() {
		return this.screenCopy.renderTarget;
	}

	createRenderer(container) {
		let renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		// renderer.shadowMap.enabled = true;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x263238);
		document.body.appendChild(renderer.domElement);

		return renderer;
	}

	screenOutputComponents() {
		this.screenOutputScene = new THREE.Scene();
		//这里使用正交相机，用于渲染平面
		this.quadCamera = new THREE.OrthographicCamera();
	}

	update() {
		let renderer = this.renderer;

		this.sampleCounter++;
		this.frameCounter++;

		this.pathTracing.update(this);
		this.screenCopy.update(this);
		this.screenOutput.update(this);

		this.stats.begin();

		//第一步进行路径追踪
		renderer.setRenderTarget(this.pathTracingRenderTarget);
		renderer.render(this.pathTracingScene, this.camera);

		//第二步：将第一步中渲染的结果保存起来
		renderer.setRenderTarget(this.screenCopyRenderTarget);
		renderer.render(this.screenCopyScene, this.quadCamera);

		//第三步：将第一部中的渲染结果显示到屏幕上
		renderer.setRenderTarget(null);
		renderer.render(this.screenOutputScene, this.quadCamera);

		this.stats.end();
	}
}

export { Viewer };
