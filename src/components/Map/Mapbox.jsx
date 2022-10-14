import { Box, useToast } from '@chakra-ui/react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import { getTilesFromTokenId, getTokenIdOfTiles, ownerOf } from '../../contracts/MESTCall';
import useMapStore from '../../store/Map';
import useTileStore from '../../store/Tiles';
import mapUtils from '../../utils';
import mapEventBus from './MapEventBus';

mapboxgl.accessToken =
    'pk.eyJ1IjoiaGlyb2tyeXB0b3IiLCJhIjoiY2wxZHhtanNsMGdnZDNjbnhkdDhhamM3byJ9.jNjEUiGBeCJjNj5aK5od-g';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

export default function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const toast = useToast();
    const { lat, lng, zoom, setStatus, style } = useMapStore();
    const { setIsEase, setSelectedTiles, setCurrentSelectTile, setSelectedEstateInfor } = useTileStore();
    let [searchParams, setSearchParams] = useSearchParams();
    const sources = [
        {
            id: 'grid',
            fill: { color: "#56CCF2", opacity: 0.25 },
        },
        {
            id: 'userTiles',
            fill: { color: '#2CCE8F', opacity: 0.5 },
        },
        {
            id: 'userTilesLine',
            line: { width: 3, color: '#00FF00', opacity: 1 }
        },
        {
            id: 'bboxSelectedTiles',
            line: { width: 3, color: '#2CCE8F', opacity: 1 }
        },
        {
            id: 'reservedSelectedTiles',
            fill: { color: '#eeeeee', opacity: 0.5 },
        },
        {
            id: 'selectedTiles',
            fill: { color: "#56CCF2", opacity: 0.5 },
        },
        {
            id: 'firstSelectedTiles',
            fill: { color: "#FF0000", opacity: 0.5 },
        },
        {
            id: 'currentSelectedEstate',
            fill: { color: "#FF0000", opacity: 0.5 },
        },
    ];
    const populateGrid = () => {
        if (map.current.getZoom() >= 15) {
            const bounds = map.current.getBounds();
            // Grid
            const gridData = mapUtils.getGridDataFromBounds(bounds);
            map.current.getSource('source-grid').setData(gridData);
            // Get all tiles    
            let tiles = mapUtils.getTilesFromBounds(map.current.getBounds())
            tiles = tiles.reduce((obj, item, index) => {
                obj[item.id] = item
                return obj
            }, {})
            mapEventBus.$set("tiles", tiles);
        }
    }
    const drawOwnedTiles = () => {
        let tileTokenMapping = mapEventBus.$get("tileTokenMappingCached");
        let tileIds = Object.keys(mapEventBus.$get("tiles"));
        let ownedTileIds = tileIds.filter(tileId => tileTokenMapping?.[tileId]);

        let ownedTiles = [];
        ownedTileIds.map(tileId => {
            ownedTiles.push(mapEventBus.$get("tiles")[tileId])
        })
        mapEventBus.$set("ownedTiles", ownedTiles);
        drawTiles(ownedTiles, "source-userTiles")
        drawTilesLine(ownedTiles, "source-userTilesLine")

    }
    const fixSeletedTiles = () => {
        let tileTokenMapping = mapEventBus.$get("tileTokenMappingCached");
        if (mapEventBus.$get("selectedTiles") && tileTokenMapping) {
            let selectTilesFix = mapEventBus.$get("selectedTiles").filter(tile => tileTokenMapping[tile.id] == undefined)
            drawTiles(selectTilesFix, "source-selectedTiles");
            mapEventBus.$set("selectedTiles", selectTilesFix);
            setSelectedTiles(selectTilesFix);
        }
    }
    const drawEstateTiles = (tokenId) => {
        let sourceSelectedEstateName = "source-currentSelectedEstate";
        if (tokenId == 0) {
            map.current.getSource(sourceSelectedEstateName).setData({
                "type": "FeatureCollection",
                "features": []
            });
            setSelectedEstateInfor(undefined);
        }
        else {
            let tileTokenMapping = mapEventBus.$get("tileTokenMappingCached");
            let estateTiles = mapEventBus.$get("ownedTiles").filter(tile => tileTokenMapping[tile.id] == tokenId)
            drawTiles(estateTiles, sourceSelectedEstateName);
            // let centerPoint = mapUtils.getCenter(estateTiles);
            let bbox = mapUtils.getBBox(estateTiles)
            // map.current.flyTo({center: centerPoint.geometry.coordinates});
            map.current.fitBounds(bbox, {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                maxZoom: 18
            });
            setSearchParams({ estateId: tokenId });
            let selectedEstateInforLocal = {
                tokenId,
                owner: "Getting from blockchain...",
                totalTiles: estateTiles.length,
                area: Math.floor(mapUtils.getArea(estateTiles))
            }
            setSelectedEstateInfor(selectedEstateInforLocal)
            ownerOf(tokenId).then(address => {
                setSelectedEstateInfor({ ...selectedEstateInforLocal, owner: address })
            })
        }
    }

    const setSourceAndLayer = () => {
        sources.map(source => {
            map.current.addSource('source-' + source.id, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });
            if (source.line) {
                map.current.addLayer({
                    id: source.id,
                    type: 'line',
                    source: 'source-' + source.id,
                    minzoom: 15,
                    maxzoom: 24,
                    paint: {
                        'line-color': source.line.color,
                        'line-width': source.line.width,
                        'line-opacity': source.line.opacity,
                    },
                });
            }
            else {
                map.current.addLayer({
                    id: source.id,
                    type: 'fill',
                    source: 'source-' + source.id,
                    minzoom: 15,
                    maxzoom: 24,
                    paint: {
                        'fill-color': source.fill.color,
                        'fill-opacity': source.fill.opacity,
                    },
                });
            }

        })
    }
    const getTileFromCoords = (coords) => {
        const point = mapUtils.getMercatorCoordinateFromLngLat(coords)
        const tile = mapUtils.getMercatorCoordinateBoundsFromMercatorCoordinate(point)
        const id = mapUtils.getIdFromMercatorCoordinate(tile.nw)

        return mapEventBus.$get("tiles")?.[id];
    };
    const drawTiles = (tiles, source) => {
        const tilesData = mapUtils.getPolygonFromTiles(tiles)
        map.current.getSource(source).setData(tilesData);
    };
    const drawTilesLine = (tiles, source) => {
        if (tiles && tiles.length > 0) {
            const listToken = [];
            let tileTokenMapping = mapEventBus.$get("tileTokenMappingCached");
            tiles.map(tile => {
                let tokenId = tileTokenMapping[tile.id];
                if (listToken.indexOf(tokenId) < 0) {
                    listToken.push(tokenId);
                }
            })
            const mutilPolygon = { features: [], type: "FeatureCollection" };
            listToken.map(tokenId => {
                let tilesOfToken = tiles.filter(tile => tileTokenMapping[tile.id] == tokenId);
                const tilesData = mapUtils.getPolygonFromTiles(tilesOfToken);
                const tilesDataCleanRedundant = mapUtils.cleanCoord(tilesData);
                mutilPolygon.features = [...mutilPolygon.features, ...tilesDataCleanRedundant.features];
            })

            map.current.getSource(source).setData(mutilPolygon);
        }
    };
    const addToSelectedTiles = (tileOrTiles) => {
        if (!tileOrTiles || tileOrTiles.length == 0) return;
        let tiles = tileOrTiles;
        if (!tileOrTiles.length) tiles = [tileOrTiles];
        if (!mapEventBus.$get("selectedTiles")) {
            mapEventBus.$set("selectedTiles", tiles);
            setSelectedTiles(tiles);
        }
        else {
            let selectedTiles = mapEventBus.$get("selectedTiles");
            tiles.forEach(tile => {
                if (!selectedTiles.some(child => child.id == tile.id) && mapEventBus.$get("tileTokenMappingCached")?.[tile.id] == undefined) {
                    mapEventBus.$get("selectedTiles").push(tile);
                }
            })
            setSelectedTiles(selectedTiles);
        }
    }
    const removeSelectedTiles = (tiles) => {
        if (!mapEventBus.$get("selectedTiles")) return;
        let selectedTiles = mapEventBus.$get("selectedTiles");
        let tileIds = tiles.map(e => e.id);
        console.log(tileIds)
        let restSelectedTiles = selectedTiles.filter(e => tileIds.indexOf(e.id) < 0)
        if (restSelectedTiles.length == 0) {
            mapEventBus.$set("isEase", false)
            setIsEase(false);
        }
        mapEventBus.$set("selectedTiles", restSelectedTiles);
        setSelectedTiles(restSelectedTiles);
    }
    const onMapLoad = () => {
        setSourceAndLayer();
        mapEventBus.$on("tilesChanged", ({ value }) => {
            //draw using cached
            drawOwnedTiles();
            fixSeletedTiles();
            //Fecth Tiles information from blockchain 
            let tileIds = Object.keys(value);
            getTokenIdOfTiles(tileIds).then(tileTokenMapping => {
                if (Object.keys(tileTokenMapping).length > 0) {
                    mapEventBus.$set("tileTokenMappingCached", { ...mapEventBus.$get("tileTokenMappingCached"), ...tileTokenMapping });
                }
            });
        })
        mapEventBus.$on("tileTokenMappingCachedChanged", ({ oldValue, value }) => {
            //redraw if cached change
            // if (JSON.stringify(oldValue) === JSON.stringify(value)) {
            drawOwnedTiles();
            fixSeletedTiles();
            if (!mapEventBus.$get("completeLoadEstateId") && searchParams.get("estateId")) {
                mapEventBus.$set("completeLoadEstateId", true);
                drawEstateTiles(searchParams.get("estateId"));
            }
            // }
        });
        mapEventBus.$on("currentSelectTileChanged", (data) => {
            if (data.value && data.value.id) {
                data.value.position = mapUtils.getPositionFromTileId(data.value.id);
            }
            setCurrentSelectTile(data.value);
        })
        mapEventBus.$on("clearSelectedTiles", () => {
            setSelectedTiles([])
            mapEventBus.$set("selectedTiles", [])
            mapEventBus.$set("firstSelectTile", undefined)
            mapEventBus.$set("currentSelectTile", undefined)
            let emptyData = {
                type: 'FeatureCollection',
                features: []
            }
            map.current.getSource("source-selectedTiles").setData(emptyData);
            map.current.getSource("source-firstSelectedTiles").setData(emptyData);
            map.current.getSource("source-bboxSelectedTiles").setData(emptyData);
        })
        setStatus({ lng: map.current.getCenter().lng.toFixed(4), lat: map.current.getCenter().lat.toFixed(4), zoom: map.current.getZoom().toFixed(2) })
        populateGrid(map);
    }

    const onMapClick = (event) => {
        if (map.current.getZoom() < 15) {
            return;
        }
        const coords = event.lngLat;
        let tile = getTileFromCoords(coords);
        let tempLastTile;//to rollback
        let tokenId = mapEventBus.$get("tileTokenMappingCached")?.[tile.id];
        if (tokenId) {
            drawEstateTiles(tokenId);
        }
        else {
            drawEstateTiles(0);//Clear select estate

            if (!mapEventBus.$get("firstSelectTile") || (mapEventBus.$get("firstSelectTile").id !== mapEventBus.$get("currentSelectTile").id)) {
                tempLastTile = mapEventBus.$get("currentSelectTile");
                mapEventBus.$set("firstSelectTile", tile);
                mapEventBus.$set("currentSelectTile", tile);

            }
            else {
                mapEventBus.$set("currentSelectTile", tile);
            }
            const correctBounds = mapUtils.getNwSeFromBounds(mapEventBus.$get("currentSelectTile").bounds, mapEventBus.$get("firstSelectTile").bounds)

            const tilesBetween = mapUtils.getTilesBetweenMercatorBounds(...correctBounds);

            const tempSelectedTiles = mapEventBus.$get("selectedTiles")?.map(e => e);
            const tempBBoxSelectedTilesPolygon = mapEventBus.$get("BBoxSelectedTilesPolygon");
            if (mapEventBus.$get("isEase")) {
                removeSelectedTiles(tilesBetween);
            }
            else {
                addToSelectedTiles(tilesBetween);
            }
            // drawTiles(mapEventBus.$get("selectedTiles"), "source-selectedTiles");

            const tilesData = mapUtils.getPolygonFromTiles(mapEventBus.$get("selectedTiles"));
            const { w, h } = mapUtils.getWHBBox(tilesData);
            mapEventBus.$set("BBoxSelectedTilesPolygon", mapUtils.getBBoxPolygon(tilesData));
            if (w > 0.3 || h > 0.3) {
                mapEventBus.$set("selectedTiles", tempSelectedTiles);
                mapEventBus.$set("BBoxSelectedTilesPolygon", tempBBoxSelectedTilesPolygon);
                toast({
                    title: 'Cant select',
                    description: "Your selected estate to big (with or height > 0.3 kilometers)",
                    status: 'error',
                    duration: 1000,
                    isClosable: false,
                    position: 'bottom-right'
                })
                if (mapEventBus.$get("firstSelectTile").id === mapEventBus.$get("currentSelectTile").id) {
                    mapEventBus.$set("firstSelectTile", tempLastTile);
                }
                else {
                    mapEventBus.$set("currentSelectTile", mapEventBus.$get("firstSelectTile"));
                }
                return;
            }
            else {
                map.current.getSource("source-selectedTiles").setData(tilesData);
                if(mapEventBus.$get("BBoxSelectedTilesPolygon")) map.current.getSource("source-bboxSelectedTiles").setData(mapEventBus.$get("BBoxSelectedTilesPolygon"));
            }
            drawTiles([mapEventBus.$get("firstSelectTile")], "source-firstSelectedTiles")

        }
    }

    const onMapMoveOver = (event) => {
        if (map.current.getZoom() < 15) {
            return;
        }
        const coords = event.lngLat;
        let tile = getTileFromCoords(coords);
        mapEventBus.$emit("mousemove", tile)
    }

    useEffect(async () => {
        if (!map.current) return;//wait for map to initialize

        var currentStyle = map.current.getStyle();
        let res = await fetch(`https://api.mapbox.com/styles/v1/mapbox/${style}?access_token=${mapboxgl.accessToken}`);
        let newStyle = await res.json();
        newStyle.sources = Object.assign({}, currentStyle.sources, newStyle.sources); // ensure any sources from the current style are copied across to the new style
        var labelIndex = newStyle.layers.findIndex((el) => { // find the index of where to insert our layers to retain in the new style
            return el.id == 'waterway-label';
        });
        var appLayers = currentStyle.layers.filter((el) => { // app layers are the layers to retain, and these are any layers which have a different source set
            return (el.source && el.source != "mapbox://mapbox.satellite" && el.source != "composite");
        });
        appLayers.reverse(); // reverse to retain the correct layer order
        appLayers.forEach((layer) => {
            newStyle.layers.splice(labelIndex, 0, layer); // inset these layers to retain into the new style
        });
        map.current.setStyle(newStyle); // now setStyle

    }, [style])
    useEffect(() => {
        if (map.current) return; // initialize map only once
        let tokenId = searchParams.get("estateId");
        if (tokenId) {
            getTilesFromTokenId(tokenId).then(tileIds => {
                let bbox = mapUtils.getBBoxFromTileIds(tileIds);
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/satellite-streets-v11',
                    bounds: bbox
                });
                // map.current.fitBounds(bbox, {
                //     padding: { top: 100, bottom: 100, left: 100, right: 100 },
                //     maxZoom: 18
                // });
                setupMap();
            });
        }
        else {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v11',
                center: [lng, lat],
                zoom: zoom,
            });
            setupMap();
        }

    }, []);//onComponentDidMount
    const setupMap = () => {
        map.current.on('load', onMapLoad);
        map.current.on('click', onMapClick);
        map.current.on('moveend', () => {
            setStatus({ lng: map.current.getCenter().lng.toFixed(4), lat: map.current.getCenter().lat.toFixed(4), zoom: map.current.getZoom().toFixed(2) })
            populateGrid(map);
        });
        map.current.on('mousemove', onMapMoveOver);
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
    }

    return (
        <Box ref={mapContainer} h="calc(100vh - 160px)" borderRadius="lg" m="2" />
    );
}
