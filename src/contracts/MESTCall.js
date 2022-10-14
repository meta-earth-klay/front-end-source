import { ethers } from 'ethers';
import { MEST_ABI, MEST_ADD, KLAY_TEST_RPC } from '../config';

const provider = new ethers.providers.JsonRpcProvider(KLAY_TEST_RPC);
const contract = new ethers.Contract(MEST_ADD, MEST_ABI, provider);

export async function getTokenIdOfTiles(tiles) {
    let tokenIds = await contract.getTokenIdOfTiles(tiles);
    //Return mapping(tileId => tokenId) => easy to check tile buy status
    return tiles.reduce((obj, tileId, index) => {
        let tokenId = tokenIds[index].toNumber();
        if (tokenId !== 0) {
            obj[tileId] = tokenId;
        }
        return obj
    }, {})
    // return tiles.reduce((obj, tileId, index) => {
    //     let tokenId = tokenIds[index].toNumber();
    //     if (tokenId != 0) {
    //         obj.push({ tileId, tokenId });
    //     }
    //     return obj
    // }, [])
}
export async function ownerOf(tokenId) {
    return await contract.ownerOf(tokenId);
}

export async function getTilesFromTokenId(tokenId){
    return (await contract.getTilesFromTokenId(tokenId)).map(tokenIdBn => tokenIdBn.toNumber());
}
