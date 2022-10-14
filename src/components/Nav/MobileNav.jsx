import { useToast,useColorMode,  Box, Flex, Text, Button, IconButton, HStack, VStack, Menu, MenuList, MenuItem, MenuButton, MenuDivider, useColorModeValue } from '@chakra-ui/react';
import { useEthers } from '@usedapp/core'
import { useEffect } from 'react';
import Logo from './Logo';
import { FiChevronDown, FiMenu, FiLogIn, FiCompass } from 'react-icons/fi'
import { Link as RouterLink } from "react-router-dom"

export default function MobileNav({ onOpen, ...rest }) {
    const { activateBrowserWallet, deactivate, account, error } = useEthers()
    const {colorMode} = useColorMode();
    const toast = useToast();
    useEffect(() => {
        if (error) {
            console.log(error);
            toast({
                title: 'Error',
                description: error.reason,
                status: 'error',
                duration: 1000,
                isClosable: true,
                position: 'bottom-right'
            })
        }
    }, [error])
    return (
        <Flex
            ml={{ base: 0, md: 60 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            {...rest}>
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />
            <Flex display={{ base: 'flex', md: 'none' }} flexDir="row" alignItems="center">
                <Logo />
                <Text
                    fontSize="2xl"
                    fontWeight="bold">
                    MetaEarth
                </Text>
            </Flex>


            <HStack spacing={{ base: '0', md: '6' }}>
                {account ?
                    <Flex alignItems={'center'}>
                        <Menu>
                            <MenuButton
                                as={Button}
                                leftIcon={<FiCompass/>}
                                py={2}
                                transition="all 0.3s"
                                colorScheme='green' variant='outline' 
                                _focus={{ boxShadow: 'none' }}>
                                <HStack>
                                    <VStack
                                        display={{ base: 'none', md: 'flex' }}
                                        alignItems="flex-start"
                                        spacing="1px"
                                        ml="2">
                                        <Text fontSize="xs" >
                                            {account.slice(0, 10) + "..."}
                                        </Text>
                                    </VStack>
                                    <Box display={{ base: 'none', md: 'flex' }}>
                                        <FiChevronDown />
                                    </Box>
                                </HStack>
                            </MenuButton>
                            <MenuList zIndex="2"
                                bg={colorMode === 'light'? 'white': 'gray.900'}
                                borderColor={colorMode === 'light'? 'gray.200': 'gray.700'}>
                                <MenuItem as={RouterLink} to="/account">Profile</MenuItem>
                                <MenuItem onClick={() => deactivate()}>Sign out</MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex> :
                    <Button leftIcon={<FiLogIn />} colorScheme='green' variant='outline' onClick={() => activateBrowserWallet()}>
                        Login
                    </Button>
                }
            </HStack>
        </Flex>
    );
};