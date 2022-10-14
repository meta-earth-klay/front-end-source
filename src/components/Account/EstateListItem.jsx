import {
  Box,
  Button,
  Center, Image, Text, useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { BsLink, BsBox, BsPencilSquare } from 'react-icons/bs';
import { ESTATE_URI_URL, VR_API_URL } from '../../config';
import { useGetTilesFromTokenId } from '../../contracts/useMEST';
import { reverseGeo } from '../../services/Geocoding';
import { getLngLatFromId } from '../../utils';
export default function EstateListItem({ tokenId, editBtn = false, viewBtn=false}) {
  let tiles = useGetTilesFromTokenId(tokenId);
  let [geoData, setGeoData] = useState();
  let boxBg = useColorModeValue('white', 'gray.800');
  let [geoLoaded, setGeoLoaded] = useState(false);
  useEffect(()=>{
    let setGeo = async () => {
      if (!geoLoaded) {
        if (tiles && tiles.length > 0) {
          let lnglat = getLngLatFromId(tiles[0]);
          let data = await reverseGeo({ lat: lnglat.lat, lng: lnglat.lng })
          setGeoData({ name: data.display_name, country: data.address.country, country_code: data.address.country_code })
          setGeoLoaded(true)
        }
        else {
          setGeoData({ name: "Loading...", country: "Loading...", country_code: "us" })
        }
      }
    }
    setGeo();
  }, [tiles]);
  let IMAGE = ESTATE_URI_URL + "?tokenId=" + tokenId
  return (
    tokenId ?
      <Center py={12}>
        <Box
          role={'group'}
          p={6}
          maxW={'330px'}
          w={'full'}
          bg={boxBg}
          boxShadow={'2xl'}
          rounded={'lg'}
          pos={'relative'}
          zIndex={1}>
          <Box
            rounded={'lg'}
            mt={-12}
            pos={'relative'}
            height={'230px'}
            _after={{
              transition: 'all .3s ease',
              content: '""',
              w: 'full',
              h: 'full',
              pos: 'absolute',
              top: 5,
              left: 0,
              backgroundImage: `url(${IMAGE})`,
              filter: 'blur(15px)',
              zIndex: -1,
            }}
            _groupHover={{
              _after: {
                filter: 'blur(30px)',
              },
            }}>
            <Image
              rounded={'lg'}
              height={282}
              width={282}
              objectFit={'cover'}
              borderRadius="2xl"
              src={IMAGE}
            />
          </Box>
          <Box pt={14} align={'center'}>
            <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
              ID: {tokenId ? tokenId.toNumber() : "Loading..."}
            </Text>
            <Text fontSize={'md'} fontFamily={'body'} fontWeight={500}>
              {geoData?.country} <ReactCountryFlag countryCode={geoData?.country_code ? geoData.country_code : "us"} svg /> ({tiles ? tiles.length : 0} tiles)
            </Text>
            <Text fontWeight={'medium'} fontSize={'sm'} height="10" textOverflow="clip" overflow="hidden">
              {geoData?.name}
            </Text>
            <Button w="100%" mt="2" variant="solid" rightIcon={<BsLink />} size={'sm'} as="a" href={"/buy-land?estateId=" + tokenId} target="_blank">Visit</Button>
            {editBtn?<Button w="100%" mt="2" variant="solid" colorScheme="teal" rightIcon={<BsPencilSquare />} size={'sm'} as="a" href={"/estatevr-edit?id=" + tokenId} target="_blank">Edit VR Content</Button>:null}
            <Button disabled={!viewBtn} w="100%" mt="2" variant="solid" colorScheme="purple" rightIcon={<BsBox />} size={'sm'} onClick={()=>window.open("/estatevr-view?id="+tokenId)}>View VR Content On Map</Button>
            <Button disabled={!viewBtn} w="100%" mt="2" variant="solid" colorScheme="purple" rightIcon={<BsBox />} size={'sm'} onClick={()=>window.open(VR_API_URL+"tokenvr?tokenId="+tokenId)}>View VR Content</Button>

          </Box>
        </Box>
      </Center> : null
  );
}