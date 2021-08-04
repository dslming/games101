import * as THREE from '../../../build/three.module.js';
import { PathTracingVS } from '../shader/PathTracingVS.js';
import { Shader } from '../shader/Shader.js';

class PathTracing {
	constructor(viewer) {
		this.viewer = viewer;
		// this.camera = viewer.camera;
		this.renderer = viewer.renderer;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
		this.camera.position.set(278, 270, 1050);
		// this.camera.rotation.y = Math.PI / 2;
		this.camera.updateMatrixWorld();
		this.camera.updateProjectionMatrix();

		// this.camera.matrixWorld.set(0.9978401783785731, 0, 0.0656884952896425, 0, 0.00690197894356194, 0.9944646857502798, -0.10484441559882904, 0, -0.06532488882562305, 0.10507135097445619, 0.9923168194202509, 0, 169.66907788683616, 331.850032333594, 789.9649262960564);

		this.pathTracingMesh = undefined;
		//用于输出这一帧路径追踪的结果
		this.renderTarget = undefined;

		this.tallBoxMesh = undefined;
		this.shortBoxMesh = undefined;

		this.initPathTracingMesh();
		this.initRenderTarget();
		this.initSceneMesh();

		// this.camera.add(this.pathTracingMesh);
		this.scene.add(this.pathTracingMesh);
	}

	get context() {
		return this.renderer.context;
	}

	get uniforms() {
		return this.pathTracingMesh.material.uniforms;
	}

	initPathTracingMesh() {
		let viewer = this.viewer;
		let camera = this.camera;
		let context = this.viewer.context;
		let fovScale = camera.fov * 0.5 * (Math.PI / 180.0);
		let uVLen = Math.tan(fovScale);
		let uULen = uVLen * camera.aspect;

		let blueNoiseTexture = new THREE.TextureLoader().load('./textures/BlueNoise_RGBA256.png');
		blueNoiseTexture.wrapS = THREE.RepeatWrapping;
		blueNoiseTexture.wrapT = THREE.RepeatWrapping;
		blueNoiseTexture.flipY = false;
		blueNoiseTexture.minFilter = THREE.NearestFilter;
		blueNoiseTexture.magFilter = THREE.NearestFilter;
		blueNoiseTexture.generateMipmaps = false;

		//同样构造一个2 * 2 的plane，用于铺满屏幕
		let pathTracingScreenPlaneGeometry = new THREE.PlaneGeometry(2, 2);
		let pathTracingScreenPlaneMaterial = new THREE.ShaderMaterial({
			uniforms: {
				//上一帧的渲染结果
				tPreviousTexture: { value: undefined },

				tBlueNoiseTexture: { value: blueNoiseTexture },
				//采样次数
				uSampleCounter: { type: 'f', value: 0.0 },
				//帧计数
				uFrameCounter: { type: 'f', value: 1.0 },

				//相机矩阵，用于计算射线
				uCameraMatrix: { value: new THREE.Matrix4() },

				//分辨率
				uResolution: { value: new THREE.Vector2(context.drawingBufferWidth, context.drawingBufferHeight) },

				//随机数
				uRandomVec2: { value: new THREE.Vector2() },

				//光圈大小，这里先设置为0，暂时不知道啥意思
				apertureSize: { value: 0.0 },

				uULen: { value: uULen },
				uVLen: { value: uVLen },

				//长立方体的逆矩阵，这里将光线转换至立方体的局部坐标下进行相交测试，因此使用逆矩阵
				uTallBoxInvMatrix: { value: new THREE.Matrix4() },
				uShortBoxInvMatrix: { value: new THREE.Matrix4() }
			},
			vertexShader: PathTracingVS,
			fragmentShader: Shader.PathTracingFS,
			depthTest: false,
			depthWrite: false
		});

		this.pathTracingMesh = new THREE.Mesh(pathTracingScreenPlaneGeometry, pathTracingScreenPlaneMaterial);
	}

	initRenderTarget() {
		let context = this.context;
		this.renderTarget = new THREE.WebGLRenderTarget(context.drawingBufferWidth, context.drawingBufferHeight, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: false,
			stencilBuffer: false
		});
		this.renderTarget.texture.generateMipmaps = false;
	}

	initSceneMesh() {
		let tallBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
		let tallBoxMaterial = new THREE.MeshPhysicalMaterial({
			color: new THREE.Color(0.95, 0.95, 0.95), //RGB, ranging from 0.0 - 1.0
			roughness: 1.0 // ideal Diffuse material
		});

		let tallBoxMesh = new THREE.Mesh(tallBoxGeometry, tallBoxMaterial);
		tallBoxMesh.rotation.set(0, Math.PI * 0.1, 0);
		tallBoxMesh.position.set(180, 170, -350);
		tallBoxMesh.updateMatrixWorld(true);
		tallBoxMesh.visible = false;

		let shortBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
		let shortBoxMaterial = new THREE.MeshPhysicalMaterial({
			color: new THREE.Color(0.95, 0.95, 0.95), //RGB, ranging from 0.0 - 1.0
			roughness: 1.0 // ideal Diffuse material
		});

		let shortBoxMesh = new THREE.Mesh(shortBoxGeometry, shortBoxMaterial);
		shortBoxMesh.visible = false;
		shortBoxMesh.rotation.set(0, -Math.PI * 0.09, 0);
		shortBoxMesh.position.set(370, 85, -170);
		shortBoxMesh.updateMatrixWorld(true);

		this.tallBoxMesh = tallBoxMesh;
		this.shortBoxMesh = shortBoxMesh;
	}

	update(viewer) {
		let uniforms = this.uniforms;
		let context = this.viewer.context;

		uniforms.uTallBoxInvMatrix.value.copy(this.tallBoxMesh.matrixWorld).invert();
		uniforms.uShortBoxInvMatrix.value.copy(this.shortBoxMesh.matrixWorld).invert();

		uniforms.uSampleCounter.value = viewer.sampleCounter;
		uniforms.uFrameCounter.value = viewer.frameCounter;
		uniforms.uRandomVec2.value.set(Math.random(), Math.random());

		this.camera.updateMatrixWorld(true);
		uniforms.uCameraMatrix.value.copy(this.camera.matrixWorld);
	}
}

export { PathTracing };
