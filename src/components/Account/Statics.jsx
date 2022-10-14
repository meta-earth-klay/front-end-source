import { Flex, Box, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function Statics({ name, value, unit, icon }) {
    return (
        <Flex
            align='center'
            p='5'
            justify='space-between'
            bgColor={useColorModeValue("white","gray.800")}
            borderRadius='lg' shadow="lg">
            <Flex direction='column' me='auto'>
                <Text fontSize='xs' mb='3px'>
                    {name}
                </Text>
                <Text fontSize='22px' fontWeight='bold'>
                    {Math.floor(value * 100) / 100} {unit}
                </Text>
            </Flex>
                <Box as={icon} m="2" h="40px" w="40px" />
        </Flex>
    )
}
