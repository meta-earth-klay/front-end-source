import { Box, Button, Center, Flex, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import * as turf from "@turf/turf";
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import React, { useEffect, useRef, useState } from 'react';
import { BsBox, BsCheck2Circle } from 'react-icons/bs';
import { useSearchParams } from "react-router-dom";
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { TransformControls } from './TransformControls.js';
import fontHelve from '../../assets/fonts/helvetiker_regular.typeface.json';
import { VR_API_URL } from '../../config';
import { getTilesFromTokenId } from '../../contracts/MESTCall';
import mapUtils from '../../utils';
import CollapsPanel from './CollapsPanel';
import IpfsFileUploader from './IpfsFileUploader';
import PropertiesControl from './PropertiesControl';

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
mapboxgl.accessToken =
    'pk.eyJ1IjoiaGlyb2tyeXB0b3IiLCJhIjoiY2wxZHhtanNsMGdnZDNjbnhkdDhhamM3byJ9.jNjEUiGBeCJjNj5aK5od-g';

const Example3ds = [
    { data: "https://ipfs.infura.io/ipfs/QmSe1nLdrZRjupv686DCYjCjK1pHMPowzpoHDfoc2FnvCd/Salute.fbx", name: "Salute.fbx" },
    { data: "https://threejs.org/examples/models/fbx/Samba Dancing.fbx", name: "Samba Dancing.fbx" },
    { data: "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf", name: "DamagedHelmet.gltf" },
]
export default function EditEstateVRSimple({ isEdit }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const toast = useToast();
    let [searchParams] = useSearchParams();
    let [tokenId, setTokenId] = useState();
    let [addType, setAddType] = useState("3d");
    let [addData, setAddData] = useState();
    let [isLoading, setIsLoading] = useState(true);
    let [isExist, setIsExist] = useState(false);
    let [currentObj, setCurrentObj] = useState();
    let [boundingBox, setBoundingBox] = useState();
    let [listObj, setListObj] = useState([]);
    let [location, setLocation] = useState();
    let [threeLayer, setThreeLayer] = useState();
    let [isLoadingAddObj, setIsLoadingAddObj] = useState(false);

    const draw3dScene = ({ lng, lat }) => {
        setLocation({ lng, lat });
        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin = [lng, lat];
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0];
        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        // transformation parameters to position, rotate and scale the 3D model onto the map
        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            /* Since the 3D model is in real world meters, a scale transform needs to be
            * applied since the CustomLayerInterface expects units in MercatorCoordinates.
            */
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
        };

        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        const customLayer = {
            id: '3d-model',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function (map, gl) {
                const aspect = window.innerWidth / window.innerHeight;
                this.camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
                this.scene = new THREE.Scene();

                // create two three.js lights to illuminate the model
                const directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                this.map = map;

                // use the Mapbox GL JS map canvas for three.js
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;

                loadData(this.scene);
                window.THREELAYER = this;
            },
            render: function (gl, matrix) {
                const rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                );
                const rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                );
                const rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                );

                const m = new THREE.Matrix4().fromArray(matrix);
                const l = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            }
        };
        setThreeLayer(customLayer);

        map.current.addLayer(customLayer, 'waterway-label');
    }
    const doAddMesh = ({ object, addData, scene }) => {
        listObj.forEach(e=>e.removeFromParent());
        object.addData = addData;
        if (!scene && threeLayer && threeLayer.scene) scene = threeLayer.scene;
        scene.add(object);
        if (addData?.position) {
            object.position.x = addData.position.x;
            object.position.y = addData.position.y;
            object.position.z = addData.position.z;
        }
        if (addData?.scale) {
            object.scale.x = addData.scale.x;
            object.scale.y = addData.scale.y;
            object.scale.z = addData.scale.z;
        }
        if (addData?.rotation) {
            object.rotation._x = addData.rotation._x;
            object.rotation._y = addData.rotation._y;
            object.rotation._z = addData.rotation._z;
            object.rotation._onChangeCallback();
        }
        object.scale.x = 50;
        object.scale.y = 50;
        object.scale.z = 50;
        setListObj([object]);
        setCurrentObj(object);
        setIsLoadingAddObj(false);
    }
    const add3d = (addData, scene) => {
        //https://threejs.org/examples/models/fbx/Samba Dancing.fbx
        //?? 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
        let url = addData.data
        addData.type = "3d";
        let fileName = url.split("/").pop();
        addData.name = fileName;
        let fileType = fileName.split(".").pop().toLowerCase();
        switch (fileType) {
            case "fbx":
                const fbxLoader = new FBXLoader();
                fbxLoader.load(url, function (object) {
                    const mixer = new THREE.AnimationMixer(object);
                    const action = mixer.clipAction(object.animations[0]);
                    action.play();
                    const clock = new THREE.Clock();
                    function animate() {
                        requestAnimationFrame(animate);
                        const delta = clock.getDelta();
                        if (mixer) mixer.update(delta);
                    }
                    animate();
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    doAddMesh({ object, addData, scene })
                });
                break;
            case "glb":
            case "gltf":
                let gltfLoader = new GLTFLoader();
                gltfLoader.load(
                    url,
                    (gltf) => {
                        doAddMesh({ object: gltf.scene, addData, scene })
                    }
                );
                break;
            default:
                toast({
                    title: 'Error Load 3D File',
                    description: "Not support type",
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
                break;
        }
    }
    // const addImg = (addData) => {
    //     const geometry = new THREE.BoxGeometry(10, 10, 10);
    //     const material = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
    //     const cube = new THREE.Mesh(geometry, material);
    //     cube.position.y = 5;
    //     cube.type = "Box"
    //     threeLayer.scene.add(cube);
    //     setListObj([...listObj, cube]);
    // }


    const handlerLoad3DLocalResult = url => {
        console.log("Add 3d data from "+ url);
        add3d({ data: url });
    }

    const saveData = async () => {
        try {
            let textToSign = `I confirm save data to land id [${tokenId}] \n [Seed: ${Math.random().toString().substring(2)}] )`;
            let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            let account = accounts[0];
            let signature = await window.ethereum.request({ method: 'personal_sign', params: [textToSign, account] });
            let content = listObj.map(e => {
                return {
                    type: e.addData.type,
                    data: e.addData.data,
                    position: e.position,
                    scale: e.scale,
                    rotation: e.rotation
                }
            })

            let dataToSave = { tokenId, location, content, signature, textToSign }
            
            let rawResponse = await fetch(VR_API_URL + "vrupload", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSave)
            });
            let result = await rawResponse.json();

            console.log(result);
            toast({
                title: result.msg,
                status: result.status,
                duration: 5000,
                isClosable: true,
            })
        }
        catch (e) {
            toast({
                title: e.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }

    }

    const loadData = async (scene) => {
        try {
            let tokenId = searchParams.get("id");

            let rawContentResponse = await fetch(VR_API_URL + "vrget?tokenId=" + tokenId);
            let vrcontent = await rawContentResponse.json();
            console.log(vrcontent);
            if(!vrcontent.content){
                throw new Error("This estate haven't 3D content")
            }
            else{
                vrcontent.content.forEach((obj) => {
                    switch (obj.type) {
                        case "3d": add3d(obj, scene); break;
                        default: break;
                    }
                })
            }
        }
        catch (e) {
            toast({
                title: e.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }

    }
    useEffect(() => {
        if (map.current) return; // initialize map only once
        let tokenId = searchParams.get("id");
        setTokenId(tokenId);
        if (tokenId) {
            getTilesFromTokenId(tokenId).then(tileIds => {
                setIsLoading(false);

                if (tileIds.length > 0) {
                    setIsExist(true)
                    let tiles = mapUtils.getTilesFromTileIds(tileIds);
                    let estatePolygon = mapUtils.getPolygonFromTiles(tiles);
                    let bbox = turf.bbox(estatePolygon);
                    let padding = .001;
                    bbox = [[bbox[0] - padding, bbox[1] - padding], [bbox[2] + padding, bbox[3] + padding]];
                    map.current = new mapboxgl.Map({
                        container: mapContainer.current,
                        style: 'mapbox://styles/mapbox/satellite-streets-v11',
                        // style: 'mapbox://styles/mapbox/light-v10',
                        // style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',

                        pitch: 60,
                        antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
                        bounds: bbox
                    });
                    map.current.addControl(new mapboxgl.GeolocateControl({
                        positionOptions: {
                            enableHighAccuracy: true
                        },
                        // When active the map will receive updates to the device's location as it changes.
                        trackUserLocation: true,
                        // Draw an arrow next to the location dot to indicate which direction the device is heading.
                        showUserHeading: true
                    }), "bottom-right")
                    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
                    map.current.on('load', () => {
                        
                        map.current.addSource('source-currentSelectedEstate', {
                            type: 'geojson',
                            data: estatePolygon
                        });
                        map.current.addLayer({
                            id: "currentSelectedEstate",
                            type: 'fill',
                            source: 'source-currentSelectedEstate',
                            minzoom: 15,
                            maxzoom: 24,
                            paint: {
                                'fill-color': "#2CCE8F",
                                'fill-opacity': 0.5,
                            },
                        });
                        const { lng, lat } = map.current.getCenter();
                        draw3dScene({ lng, lat });
                    });
                }
            });
        }
    }, []);//onComponentDidMount
    return (
        <>
            <Center className='loaded' textAlign="center" height="calc(100vh - 80px)" position="relative" >
                {isLoading ? <Text fontSize="7xl" bgClip='text'
                    bgGradient='linear(to-l, #7928CA, #FF0080)'>LOADING...</Text> :
                    (isExist ? <Box className='loaded' ref={mapContainer} h="100%" w="100%" /> :
                        <Text fontSize="7xl" bgClip='text'
                            bgGradient='linear(to-l, #7928CA, #FF0080)'>ESTATE ISN'T EXIST</Text>)
                }
                {isEdit ? <>
                    <CollapsPanel title="Action" left="10px" top="10px">
                        {addType === "3d" ? <Flex m="2" direction="column">
                            <IpfsFileUploader colorScheme="green" m="2" size="xs" accept={".gltf,.glb"} result={handlerLoad3DLocalResult} onClick={() => setIsLoadingAddObj(true)} onCancel={() => setIsLoadingAddObj(false)}>Add 3d file</IpfsFileUploader>
                            <Flex flexDir="column" color="white">
                                <Text fontSize={'small'}>Let's try some example:</Text>
                                {
                                    Example3ds.map(({ data, name }, key) => <Button fontSize={'small'} key={key} variant="link" leftIcon={<BsCheck2Circle color="green" />} onClick={() => add3d({ data })}>{name}</Button>)
                                }

                            </Flex>
                        </Flex> : null}
                        {isLoadingAddObj ? <Spinner
                            thickness='4px'
                            speed='0.65s'
                            emptyColor='gray.200'
                            color='blue.500'
                            size='xl'
                        /> : null}
                        <Button colorScheme="red" m="2" size="xs" onClick={saveData}>Save to server</Button>

                    </CollapsPanel>
                    {currentObj ? <CollapsPanel title="Properties" color="white" right="10px" width="200px">
                        <Text fontWeight="bold" textAlign="left" mb="2" fontSize="x-small">ID: {currentObj.id}</Text>
                        <Text fontWeight="bold" textAlign="left" mb="2" fontSize="x-small">UUID: {currentObj.uuid}</Text>
                        <PropertiesControl title="Position" object={currentObj.position} />
                        <PropertiesControl title="Scale" object={currentObj.scale} />
                        <PropertiesControl title="Rotation" object={currentObj.rotation} step={0.1} selectors={['x', 'y', 'z']} />
                        <Button size="xs" leftIcon={<BsBox />} onClick={() => {
                            currentObj.removeFromParent()
                            setListObj(listObj.filter(obj => obj.uuid !== currentObj.uuid));
                            setCurrentObj(undefined);
                            if (boundingBox) boundingBox.removeFromParent();
                            setBoundingBox(undefined)
                        }} color="red" mt="5">Remove</Button>

                    </CollapsPanel> : null}
                    
                </> : null}
            </Center >

        </>
    );
}
