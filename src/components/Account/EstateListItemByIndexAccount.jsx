import React from 'react';
import { useTokenOfOwnerByIndex } from '../../contracts/useMEST';
import EstateListItem from './EstateListItem';

export default function EstateListItemWithIndex({ account, index }) {
  let tokenId = useTokenOfOwnerByIndex(account, index);
  return (
    <EstateListItem tokenId={tokenId} editBtn="true" viewBtn="true"/>
  )
}
