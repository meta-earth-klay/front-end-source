import { Button, Collapse, Flex, useDisclosure } from '@chakra-ui/react';
import React from 'react';

export default function CollapsPanel({ title, children, ...rest }) {
    const { isOpen, onToggle } = useDisclosure({defaultIsOpen: true})

    return (
        <Flex flexDir="column" zIndex="overlay" pos="absolute" {...rest} backdropFilter='blur(10px)' backgroundColor="gray.800" shadow="dark-lg" borderRadius="2xl" >
            <Button color="white" bgGradient='linear(to-l, #3aa5fd, #bc2ffc)' _hover={{ bgGradient: 'linear(to-l, #3aa599, #bc2ffc)' }} size="xs" onClick={onToggle}>{title}</Button>
            <Collapse in={isOpen}>
                <Flex my="5" direction="column" m="2">
                    {children}
                </Flex>
            </Collapse>
        </Flex >
    )
}
