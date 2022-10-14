import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import mapUtils from '../../utils';
import { Box, Text, Center } from '@chakra-ui/react';
import { useSearchParams } from "react-router-dom";
import * as turf from "@turf/turf";
import { getTilesFromTokenId } from '../../contracts/MESTCall';
mapboxgl.accessToken =
    'pk.eyJ1IjoiaGlyb2tyeXB0b3IiLCJhIjoiY2wxZHhtanNsMGdnZDNjbnhkdDhhamM3byJ9.jNjEUiGBeCJjNj5aK5od-g';

    // eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

export default function MapboxViewEstate() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    let [searchParams] = useSearchParams();
    let [isRenderred, setIsRenderred] = useState(false);
    let [isLoading, setIsLoading] = useState(true);
    let [isExist, setIsExist] = useState(false);
    useEffect(() => {
        if (map.current) return; // initialize map only once
        let tokenId = searchParams.get("id");
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
                        bounds: bbox
                    });
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
                                'fill-color': "#FF0000",
                                'fill-opacity': 0.8,
                            },
                        });
                    });
                    map.current.on('idle', () => {
                        setIsRenderred(true);
                        console.log("Is render")
                    })
                }
                else {
                    setIsRenderred(true)
                }
            });
        }
    }, []);//onComponentDidMount
    return (
        <>
            <Center className='loaded' textAlign="center" m="10px" borderRadius="3xl" height="calc(100vh - 30px)" borderWidth="10px" borderColor="teal.300" boxShadow="2xl" >
                {isLoading ? <Text fontSize="7xl" bgClip='text'
                    bgGradient='linear(to-l, #7928CA, #FF0080)'>LOADING...</Text> :
                    (isExist ? <Box className='loaded' ref={mapContainer} h="100%" w="100%" borderRadius="2xl" /> :
                        <Text fontSize="7xl" bgClip='text'
                            bgGradient='linear(to-l, #7928CA, #FF0080)'>ESTATE ISN'T EXIST</Text>)
                }
            </Center >
            {isRenderred ? <span id='is-renderred' /> : null}
            <Center zIndex="overlay" pos="Fixed" bottom="10px" h='50px' mx="auto" left="10px" right="10px" bgColor="teal.300" borderBottomRadius="3xl" >
                <Text
                    bgGradient='linear(to-l, #7928CA, #FF0080)'
                    bgClip='text'
                    fontSize='2xl'
                    textAlign='center'
                    fontWeight='extrabold'
                >
                    META EARTH ESTATE</Text>
            </Center >
        </>
    );
}
