import useMapStore from '../../store/Map';
import useTileStore from '../../store/Tiles'
import mapEventBus from './MapEventBus';
import { Button, Box, Flex, Spacer, Center, Text } from '@chakra-ui/react'
import { MdClear, MdShop } from 'react-icons/md'
import { GiBroom } from 'react-icons/gi'
import { BiPencil } from 'react-icons/bi'
import BuyDialog from './BuyDialog';
import { useTilePrice } from '../../contracts/useMEST';
import { ethers } from 'ethers'
import ExplorerLink from '../ExplorerLink';
import { useEthers, } from '@usedapp/core';

export default function MapStatus() {
    const { lat, lng, zoom } = useMapStore()
    const { selectedTiles, isEase, setIsEase, setIsBuying, currentSelectTile, selectedEstateInfor } = useTileStore();
    const { account } = useEthers()
    const tilePrice = ethers.utils.formatEther(useTilePrice() ?? 0);

    const clearSelection = () => {
        mapEventBus.$emit("clearSelectedTiles")
    }

    const isEaseClick = () => {
        mapEventBus.$set("isEase", !isEase)
        mapEventBus.$set("firstSelectTile", undefined);
        mapEventBus.$set("secondSelectTile", undefined);
        setIsEase(!isEase)
    }
    return (
        <>
            <BuyDialog />
            <Flex rounded="lg" bgGradient='linear(to-l, #3aa5fd, #bc2ffc)' position='absolute' zIndex='1' mx="auto" p="1" left='2' right='2' flexDir={{ base: 'column', md: 'row' }} boxShadow='dark-lg'  >
                <Flex flexDir={{ base: 'column', md: 'row' }}>
                    <Center ml={{ base: '0', md: '10' }} h="100%" color='white' fontSize="smaller">
                        Lng: {lng} | lat: {lat} | Zoom: {zoom}
                    </Center>
                    {selectedTiles.length > 0 ?
                        <Center ml={{ base: '0', md: '10' }} color='white' h="100%" fontSize="smaller">
                            Selected count: {selectedTiles.length}| Current tile ID: {currentSelectTile.id ?? null})
                        </Center> : null}

                </Flex>
                <Spacer />

                <Flex alignItems="center" p="1" justifyContent="center" >
                    <Button leftIcon={isEase ? <BiPencil /> : <GiBroom />} colorScheme={isEase ? 'teal' : 'red'} size='xs' onClick={isEaseClick} mr="2" >{isEase ? 'Add tile' : 'Remove tile'}</Button>
                    <Button leftIcon={<MdClear />} colorScheme='teal' size='xs' onClick={clearSelection} mr="2" >Clear</Button>
                    {account && selectedTiles.length > 0 ? <Button leftIcon={<MdShop />} colorScheme='pink' size="xs" onClick={() => setIsBuying(true)}>Buy</Button> : null}
                </Flex>
            </Flex>

            {selectedEstateInfor ? <Box color='white' backdropFilter='blur(15px)'  position='absolute' zIndex='1' mx="auto" p="2" py="5" m="2" left="2" right="12" boxShadow='dark-lg' bottom="5" rounded="xl" >
                <Text ml={{ base: '0', md: '10' }} textShadow='0 2px 3px black' fontWeight="bold" fontSize="sm">  Selected estate: ID: {selectedEstateInfor.tokenId} | Total tiles: {selectedEstateInfor.totalTiles} | Area: {selectedEstateInfor.area} m<sup>2</sup> | Owner: <ExplorerLink address={selectedEstateInfor.owner}>{selectedEstateInfor.owner.slice(0, 10) + "..."}</ExplorerLink>
                </Text>
            </Box> : null}

        </>
    )
}