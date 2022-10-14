import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import fontHelve from '../assets/fonts/helvetiker_regular.typeface.json';
const create3DText = ( data) => {
    const material = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
    //Add object
    const loader = new FontLoader();
    const font = loader.parse(fontHelve);
    const geometry = new TextGeometry(data?.data ?? "MetaEarth", {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 1,
    });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.y = 5;
    return textMesh;
}

export default create3DText