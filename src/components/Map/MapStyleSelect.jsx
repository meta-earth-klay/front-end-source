import { Select } from '@chakra-ui/react'

import useMapStore from '../../store/Map'
import { MdArrowDropDown } from 'react-icons/md'

export default function MapStatus() {
    const { style, setStyle } = useMapStore();

    const options = [
        { key: 'streets-v11', text: 'Streets' },
        { key: 'outdoors-v11', text: 'Outdoors' },
        { key: 'light-v10', text: 'Light' },
        { key: 'dark-v10', text: 'Dark' },
        { key: 'satellite-v9', text: 'Satellite' },
        { key: 'satellite-streets-v11', text: 'Satellite Streets' },
        { key: 'navigation-day-v1', text: 'Day' },
        { key: 'navigation-night-v1', text: 'Night' },
    ];
    return (
        <Select value={style} placeholder='Select option' icon={<MdArrowDropDown />} onChange={event => setStyle(event.target.value)}>
            {options.map(e => {
                return (
                    <option value={e.key}>{e.text}</option>
                )
            })}
        </Select>
    )
}