import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { useEtherBalance, useEthers } from '@usedapp/core'
import { ethers } from 'ethers'
import React from 'react'
import { useBalance } from '../../contracts/useMEST'
import Statics from './Statics'
import { BsPeople, BsCoin, BsPinMap } from 'react-icons/bs'

export default function AccountStatics() {
    const { account } = useEthers()
    const etherBalance = useEtherBalance(account)
    const MESTbalance = useBalance(account);
    return (
        <Box p="2" m="2">
            <Box p='12px 5px' mb='12px'>
                <Flex direction='column'>
                    <Text fontSize='lg' fontWeight='bold' mb='6px'>
                        Account Informations
                    </Text>
                </Flex>
            </Box>
            <Box w='100%'>
                <Flex w='100%' direction={{ sm: "column", md: "row" }}>
                    <Grid templateColumns={{ sm: "repeat(2,1fr)", md: "repeat(4, 1fr)" }} gap='24px' w='100%'>
                        <Statics name="Balance" value={etherBalance ? ethers.utils.formatEther(etherBalance) : 0} unit="KLAY" icon={BsCoin} />
                        <Statics name="Total estate" value={MESTbalance ? MESTbalance.toNumber() : 0} unit="Estates" icon={BsPinMap} />
                        <Statics name="Total MEST" value={0} unit="MEST" icon={BsCoin} />
                        <Statics name="Total ref" value={0} unit="Ref" icon={BsPeople} />
                    </Grid>
                </Flex>
            </Box>
        </Box>
    )
}
