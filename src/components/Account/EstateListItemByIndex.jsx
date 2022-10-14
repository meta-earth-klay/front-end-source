import React from 'react';
import { useTokenByIndex } from '../../contracts/useMEST';
import EstateListItem from './EstateListItem';

export default function EstateListItemWithIndex({ index, viewBtn }) {
  let tokenId = useTokenByIndex(index);
  return (
    <EstateListItem tokenId={tokenId} viewBtn={viewBtn}/>
  )
}
