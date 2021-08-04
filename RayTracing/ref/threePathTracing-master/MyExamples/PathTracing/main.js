import * as THREE from '../../build/three.module.js';
import { defined } from './js/defined.js';
import { GUI } from './../../libs/jsm/libs/dat.gui.module.js';
import { Viewer } from './js/Viewer.js';
import { Utils } from './js/Utils.js';
import { Shader } from './shader/Shader.js';

function main() {
	let camera, pathTracingScene, renderer, object;
	let clock, context, pathTracing;
	let viewer;

	let mesh;

	let pathTracingRenderTarget, screenCopyRenderTarget;

	//用于进行路径追踪的mesh
	let pathTracingMesh = undefined;

	new THREE.FileLoader().load('./shader/PathTracingFS.glsl', PathTracingFS => {
		Shader.PathTracingFS = PathTracingFS;
		init();
		animate();
	});

	function init() {
		clock = new THREE.Clock();

		viewer = new Viewer();

		//用于渲染路径追踪对象的场景
		pathTracingScene = viewer.pathTracingScene;
		camera = viewer.camera;
		pathTracingRenderTarget = viewer.pathTracingRenderTarget;
		screenCopyRenderTarget = viewer.screenCopyRenderTarget;
		context = viewer.context;

		// Renderer
		renderer = viewer.renderer;

		window.addEventListener('resize', onWindowResize, false);

		// Controls
		const controls = Utils.createControls(camera, renderer);
		controls.addEventListener('change', () => {
			viewer.frameCounter = 0;
		});

		//第一步创建地面，地面不参与模板测试
		// const ground = Utils.createGround();
		// pathTracingScene.add(ground);

		// mesh = Utils.createMesh();
		// pathTracingScene.add(mesh);

		pathTracing = viewer.pathTracing;
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function animate() {
		const delta = clock.getDelta();

		requestAnimationFrame(animate);

		if (!defined(pathTracing)) {
			return;
		}

		viewer.update();
	}
	// viewer.render();
}

export { main };
