
import {
    Box,
    CloseButton,
    Flex,
    useColorModeValue,
    Text,
    Link,
    Icon,
} from '@chakra-ui/react';

import {
    FiHome,
    FiTrendingUp,
    FiCompass,
    FiStar,
} from 'react-icons/fi';
import {
    IoCubeOutline
} from 'react-icons/io5';

import Logo from './Logo'
import { Link as RouterLink } from "react-router-dom"
import ColorModeToggle from '../ColorModeToggle';

const LinkItems = [
    { name: 'Home', icon: FiHome, url: '/' },
    { name: 'Overview', icon: FiTrendingUp, url: '/overview' },
    { name: 'Explore', icon: FiCompass, url: '/buy-land' },
    { name: 'Account', icon: FiStar, url: '/account' },
    { name: 'Visit MetaEarth AR', icon: IoCubeOutline, url: '/vrexperience' },
];

export default function SidebarContent({ onClose, ...rest }) {
    return (
        <Box
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Flex flexDir="row" alignItems="center">
                    <Logo />
                    <Text
                        bgGradient='linear(to-l, #7928CA, #FF0080)'
                        bgClip='text'
                        fontSize='2xl'
                        fontWeight='extrabold'
                    >
                        MetaEarth
                    </Text>
                </Flex>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name} icon={link.icon} url={link.url}>
                    {link.name}
                </NavItem>
            ))}
            <ColorModeToggle />
        </Box>
    );
};

const NavItem = ({ icon, url, children, ...rest }) => {
    return (
        <Link as={RouterLink} to={url} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bgGradient: 'linear(to-l, #3aa5fd, #bc2ffc)',
                    color: 'white',
                }}
                {...rest}>
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Link>
    );
};