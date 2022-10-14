import React, { useState } from 'react'
import useTileStore from '../../store/Tiles'
import { MdLocationPin, MdMoney } from 'react-icons/md'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text, Button, Tag, TagLabel, Box, useToast, Divider } from '@chakra-ui/react';
import { MAPBOX_ACCESS_TOKEN } from '../../config'
import { useEffect } from 'react';
import mapUtils from '../../utils';
import { reverseGeo } from '../../services/Geocoding';
import ReactCountryFlag from "react-country-flag"
import { useBuyTiles } from '../../contracts/useMEST';
import mapEventBus from './MapEventBus';

const updateGeoCoordinates = async (tile) => {
    if (!tile) return;
    const coord = mapUtils.getLngLatFromMercatorCoordinate(tile.bounds.nw)
    let geoInfo = {};
    geoInfo.lng = coord.lng
    geoInfo.lat = coord.lat
    const data = await reverseGeo({ lat: coord.lat, lng: coord.lng });

    if (data.display_name) {
        geoInfo.name = data.display_name
        geoInfo.country = data.address.country;
        geoInfo.country_code = data.address.country_code;
    }
    return geoInfo;
}
export default function BuyDialog() {
    const { isBuying, setIsBuying, selectedTiles } = useTileStore();
    const [estateInfor, setEstateInfor] = useState();
    const { status, state, sendTx } = useBuyTiles();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    useEffect(async () => {
        if (isBuying) {
            let geoInfo = await updateGeoCoordinates(selectedTiles[0]);
            setEstateInfor(geoInfo)
        }

    }, [isBuying]);
    useEffect(async () => {
        if (status == "Exception" || status == "Success") {
            setIsLoading(false);
            status == "Exception" ? toast({
                title: 'Error',
                description: state.errorMessage,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            }) : toast({
                title: 'Success',
                description: "Success",
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            })
        }
    }, [state]);
    const buyBtnClick = () => {
        setIsLoading(true);
        let tiles = selectedTiles.map(e => e.id.toString());
        sendTx(tiles);
    }
    return (
        <Modal onClose={() => setIsBuying(false)} isOpen={isBuying} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{estateInfor?.name ?? "Unname Estate"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Text>{estateInfor?.country} <ReactCountryFlag countryCode={estateInfor?.country_code} svg /></Text>
                    <Text>Lng {estateInfor?.lng}, lat {estateInfor?.lat}</Text><Text>Total tiles {selectedTiles.length}/1000 tiles</Text>
                    <Box maxHeight="calc(100vh - 600px)" overflowX="hidden" overflowY="scroll" py="2" border="0px" shadow="1px" rounded="lg">
                        {selectedTiles.map((tile) => (
                            <Tag size="sm" m='1' variant='outline' key={tile.id} colorScheme='blue'>
                                <MdLocationPin w={1} h={1} />
                                <TagLabel>{tile.id}</TagLabel>
                            </Tag>))}
                    </Box>
                    <Divider my="3"></Divider>
                    <Text fontSize="lg" fontWeight="bold" color="red.700">Total price {selectedTiles.length * 0.1} KLAY</Text>

                </ModalBody>
                <ModalFooter>
                    <Button isLoading={isLoading} colorScheme="green" mr="1" onClick={buyBtnClick}>Buy now | <small>{status}</small></Button>
                    <Button onClick={() => setIsBuying(false)}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
