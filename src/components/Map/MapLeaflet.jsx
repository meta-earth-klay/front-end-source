import 'leaflet/dist/leaflet.css';

import { useState } from 'react'
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvents, LayersControl,
    useMap, GeoJSON, useMapEvent
} from 'react-leaflet'
import { useEffect } from 'react';

import useMapStore from '../../store/Map'

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}
function Control({ position }) {
    const [loc, setLoc] = useState(undefined)
    const { setStatus } = useMapStore();

    const map = useMapEvents({
        locationfound(e) {
            setLoc(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        },
        moveend() {
            console.log(map.getCenter())
            const loc = map.getCenter();
            const zoom = map.getZoom();
            setStatus({ lat: loc.lat, lng: loc.lng, zoom })
        }
    })
    useEffect(()=>{
        console.log(map)
    },[])
    const positionClass =
        (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
    return (
        <>
            {loc ? (<Marker position={loc}> <Popup>You are here</Popup> </Marker>) : null}
            <div className={positionClass}>
                <div className="leaflet-control leaflet-bar"><button onClick={() => map.locate()}>View my location</button></div>
            </div>
        </>
    )
}

export default function MapLeaflet() {

    return (
        <MapContainer center={{ lat: 51.505, lng: -0.09 }} zoom={13}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer name="Satellite" checked>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.Overlay name="Mapnik">
                    <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' opacity="50"/>
                </LayersControl.Overlay>
            </LayersControl>
            <GeoJSON data={undefined} />
            <Control position="bottomright" />
        </MapContainer>
    )
}