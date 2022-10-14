import { Button, Flex, InputGroup, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
export default function PropertiesControl({ title, object, selectors, step }) {
    const [isShow, setIsShow] = useState(true);
    if (!selectors) {
        selectors = Object.keys(object);
    }
    return (
        <Flex flexDirection="column">
            <Button rightIcon={isShow ? <BsEye /> : <BsEyeSlash />} size="xs" variant="ghost" _hover={{}} fontWeight="bold" textAlign="left" my="2" onClick={() => setIsShow(!isShow)}>{title} </Button>
            <Flex flexDirection="column">
                {
                    isShow ? selectors.map((property, index) => {
                        if (typeof (object[property]) === 'number') {
                            return <InputGroup size='sm' rounded="md" key={index}>
                                <Text mx="2">{property}</Text>
                                <NumberInput allowMouseWheel="true" size='xs' step={step ?? 1} defaultValue={object[property]} rounded="md" onChange={value => {
                                    object[property] = parseFloat(value);
                                }}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </InputGroup>
                        }
                    }) : null
                }
            </Flex>
        </Flex>
    )
}
