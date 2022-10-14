import MapBox from '../components/Map/Mapbox'
// import MapLeaflet from './components/Map/MapLeaflet';
import MapStatus from '../components/Map/MapStatus'
// import MapStyleSelect from './components/Map/MapStyleSelect'
import { Box } from '@chakra-ui/react'
import WithSideBarLayout from '../layouts/WithSideBarLayout'
// eslint-disable-next-line import/no-webpack-loader-syntax
export default function BuyLand() {
    return (
            <WithSideBarLayout>
                <Box pos="relative">
                    <Box className="sidebar">
                        <MapStatus />
                        {/* <MapStyleSelect/> */}
                    </Box>
                    <MapBox />
                    {/* <MapLeaflet/> */}
                </Box>
            </WithSideBarLayout>
    )
}