import * as THREE from '../../../build/three.module.js';

import { OrbitControls } from '../../../libs/jsm/controls/OrbitControls.js';

let Utils = {
	createDirLight() {
		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(5, 10, 7.5);
		dirLight.castShadow = true;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.left = -2;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = -2;

		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;

		return dirLight;
	},

	createAmbientLight() {
		return new THREE.AmbientLight(0xffffff, 0.5);
	},

	createControls(camera, renderer) {
		const controls = new OrbitControls(camera, renderer.domElement);
		// controls.minDistance = 2;
		// controls.maxDistance = 20;
		controls.update();

		return controls;
	},

	createShadowGround() {
		const ground = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(9, 9, 1, 1),
			new THREE.ShadowMaterial({
				color: 0,
				opacity: 0.25,
				side: THREE.DoubleSide
			})
		);

		ground.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
		ground.position.y = -1;
		ground.receiveShadow = true;

		return ground;
	},

	createGround() {
		const ground = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(9, 9, 1, 1),
			new THREE.MeshBasicMaterial({
				color: 0x1796d6,
				side: THREE.DoubleSide
			})
		);

		ground.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
		ground.position.y = -1;
		ground.receiveShadow = true;

		return ground;
	},

	createMesh() {
		const geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 220, 60);

		const material = new THREE.MeshBasicMaterial({
			color: 0xffc107
		});

		// add the color
		const normal = new THREE.Mesh(geometry, material);
		// normal.castShadow = true;

		return normal;
	}
};

export { Utils };
