// Chakra imports
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from 'react';
import { BsPeople, BsPinMap } from 'react-icons/bs';
import EstateListItemByIndex from "../components/Account/EstateListItemByIndex";
import Statics from "../components/Account/Statics";
import Paginator from "../components/Paginator";
import { VR_API_URL } from "../config";
import { useTotalSupply } from "../contracts/useMEST";
import WithSideBarLayout from '../layouts/WithSideBarLayout';

export default function Overview() {
  let totalEstate = useTotalSupply();
  let [currentPage, setCurrentPage] = useState(1);
  let [pageSize, setPageSize] = useState(5);
  let [hasVRCheck, setHasVRCheck] = useState();

  useEffect(() => {
    const doRequest = async () => {
      let rawContentResponse = await fetch(VR_API_URL + "allvrid");
      let mapCheck={};
      let vrids = await rawContentResponse.json();
      vrids.forEach(e => mapCheck[e.id] = true)
      setHasVRCheck(mapCheck);
      console.log(hasVRCheck)
    }
    doRequest();
  }, [])
  return (
    <WithSideBarLayout>
      <Flex direction='column' mt="5">
        <Box m="2" p="2">
          <Box p='12px 5px' mb='12px'>
            <Flex direction='column'>
              <Text fontSize='lg' fontWeight='bold' mb='6px'>
                Overview
              </Text>
            </Flex>
          </Box>
          <Box w='100%' >
            <Flex w='100%' direction={{ sm: "column", md: "row" }}>
              <Grid templateColumns={{ base: "repeat(2,1fr)" }} gap='24px' w='100%'>
                <Statics name="Total estate" value={totalEstate ? totalEstate.toNumber() : 0} unit="Estates" icon={BsPinMap} />
                <Statics name="Total player" value={100} unit="Player" icon={BsPeople} />
              </Grid>
            </Flex>
          </Box>
        </Box>
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
              (index + pageSize * (currentPage - 1) < totalEstate) ? <EstateListItemByIndex index={index + pageSize * (currentPage - 1)} key={index} viewBtn={hasVRCheck?.[index + pageSize * (currentPage - 1) +1]} /> : null
            ) : null}
          </Flex>
        </Box>
      </Flex>

    </WithSideBarLayout>
  )
}
