import { Avatar, AvatarBadge, Box, Button, Flex, Icon, Text } from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import React from 'react'
import { FaCube, FaPencilAlt, FaPenFancy } from 'react-icons/fa'
import ExplorerLink from '../ExplorerLink'

export default function AccountHeader() {
    const { account } = useEthers()
    const tabs = [{
        name: "Overview",
        icon: FaPencilAlt,
    }, {
        name: "Estate",
        icon: FaPenFancy,
    },
    {
        name: "VR Assets",
        icon: FaCube,
    }]
    return (
        <Box
            mx="5"
            mb={{ sm: "24px", md: "50px", xl: "20px" }}
            borderRadius='lg'
            p={{ base: "2", md: "5" }}
            bgGradient={{ base: "linear-gradient(#0575e6, #00a642 )", md: "linear-gradient(to right, #0575e6, #00a642 )" }}>
            <Flex direction={{ sm: "column", md: "row" }} justifyContent="space-between">
                <Flex
                    align='center'
                    direction="row"
                >
                    <Avatar
                        w='80px'
                        h='80px'
                        borderRadius="lg" mr="2">
                        <AvatarBadge
                            cursor='pointer'
                            borderRadius='8px'
                            border='transparent'
                            bg='linear-gradient(138.78deg, rgba(6, 11, 40, 0.94) 17.44%, rgba(10, 14, 35, 0.49) 93.55%, rgba(10, 14, 35, 0.69) 93.55%)'
                            boxSize='26px'
                            backdropFilter='blur(120px)'>
                            <Icon h='12px' w='12px' color='#fff' as={FaPencilAlt} />
                        </AvatarBadge>
                    </Avatar>
                    <Flex direction='column' maxWidth='100%' color="white" fontWeight='bold'>
                        <Text fontSize={{ sm: "lg", lg: "xl" }} fontWeight='bold'>
                            Welcome
                        </Text>
                        <Text fontSize={{ sm: "sm", md: "md" }}>
                            <ExplorerLink address={account}>{account}</ExplorerLink>
                        </Text>
                    </Flex>
                </Flex>
                <Flex direction={{ sm: "column", lg: "row" }} mt={{base: "2", md:"0"}} ml={{base: "0", md:"5"}} alignItems={{base:"none", md: "center"}}>
                    {tabs.map((tab,index) => <Button variant="outline" color="white" key={index}
                        borderRadius='lg'
                        _hover={{ opacity: "0.8" }}
                        _active={{ opacity: "0.9" }}
                        m={{ base: "1", lg: "2" }}
                        leftIcon={<Icon as={tab.icon} me='6px' />}>
                        <Text fontSize='xs' fontWeight='bold'>
                            {tab.name}
                        </Text>
                    </Button>
                    )}
                </Flex>
            </Flex>
        </Box>
    )
}
