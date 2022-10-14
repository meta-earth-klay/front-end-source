import { Image } from '@chakra-ui/react'
import logo from '../../assets/imgs/favicon.png';

export default function Logo() {
    return (
        <Image src={logo} w="64px" alt='MetaEarthSBS' />
    )
}
