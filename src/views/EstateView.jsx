import MapboxViewEstate from '../components/Map/MapboxViewEstate'
import NoSideBarLayout from '../layouts/NoMenuLayout'

export default function EstateView() {
    return (
        <NoSideBarLayout>
            <MapboxViewEstate />
        </NoSideBarLayout>
    )
}