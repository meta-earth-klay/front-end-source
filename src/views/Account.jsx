// Chakra imports
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import React, { useState } from 'react';
import AccountHeader from '../components/Account/AccountHeader';
import AccountStatics from "../components/Account/AccountStatics";
import EstateListItemByIndexAccount from "../components/Account/EstateListItemByIndexAccount";
import Paginator from "../components/Paginator";
import { useBalance } from "../contracts/useMEST";
import WithSideBarLayout from '../layouts/WithSideBarLayout';

export default function Account() {
  let { account } = useEthers();
  let totalEstate = useBalance(account);
  let [currentPage, setCurrentPage] = useState(1);
  let [pageSize, setPageSize] = useState(5);

  return (
    <WithSideBarLayout>
      <Flex direction='column' mt="5">
        <AccountHeader />
        <AccountStatics />
        <Box m="2" p="2">
          <Box p='12px 5px' mb='12px'>
            <Flex direction='column'>
              <Text fontSize='lg' fontWeight='bold' mb='6px'>
                Estates ({totalEstate ? totalEstate.toNumber() : null})
              </Text>
              <Paginator total={totalEstate} onPageChange={value => setCurrentPage(value)} onPageSizeChange={value => setPageSize(value)} />
            </Flex>
          </Box>
          <Flex flexWrap={"wrap"} gap="2" justifyContent={{ base: "center", md: "space-between" }}>
            {totalEstate ? [...Array(pageSize)].map((_, index) =>
              (index + pageSize * (currentPage - 1) < totalEstate) ? <EstateListItemByIndexAccount account={account} index={index + pageSize * (currentPage - 1)} key={index} /> : null
            ) : null}
          </Flex>
        </Box>
      </Flex>

    </WithSideBarLayout>
  )
}
