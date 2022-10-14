import EditEstateVRSimple from '../components/EstateEditor/EditEstateVRSimple'
import SidebarWithHeader from '../components/Nav/SidebarWithHeader'

export default function EstateVREdit() {
    return (
        <SidebarWithHeader>
            <EditEstateVRSimple isEdit="true"/>
        </SidebarWithHeader>
    )
}