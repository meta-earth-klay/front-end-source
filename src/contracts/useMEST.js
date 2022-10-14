import { useCall, useContractFunction } from '@usedapp/core';
import { Contract } from 'ethers';
import { MEST_ABI, MEST_ADD } from '../config';


const MEST_CONTRACT = new Contract(MEST_ADD, MEST_ABI);

export function useBalance(
    address
) {
    const { value, error } =
        useCall(
            address &&
            MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "balanceOf", // Method to be called
                args: [address], // Method arguments - address to be checked for balance
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}

export function useTilePrice() {
    const { value, error } =
        useCall(
            MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "TILE_PRICE", // Method to be called
                args: [], // Method arguments - address to be checked for balance
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}

export function useGetTilesFromTokenId(tokenId) {
    const { value, error } =
        useCall(
            tokenId && MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "getTilesFromTokenId", // Method to be called
                args: [tokenId], // Method arguments - address to be checked for balance
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}

export function useTokenOfOwnerByIndex(account, index) {
    const { value, error } =
        useCall(
            account && MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "tokenOfOwnerByIndex", // Method to be called
                args: [account, index], // Method arguments - address to be checked for balance
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}

export function useTokenByIndex(index) {
    const { value, error } =
        useCall(
            MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "tokenByIndex", // Method to be called
                args: [index], // Method arguments - address to be checked for balance
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}

export function useTotalSupply() {
    const { value, error } =
        useCall(
            MEST_ADD && {
                contract: MEST_CONTRACT, // instance of called contract
                method: "totalSupply", // Method to be called
                args: [],
            }
        ) ?? {};
    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0];
}





//Write hook
export function useBuyTiles() {
    const tilePrice = useTilePrice();
    const { state, send } = useContractFunction(MEST_CONTRACT, 'buyTiles', { transactionName: 'Buy Tiles' })
    const { status } = state
    const sendTx = (tiles) => {
        let totalTiles = tiles.length;
        let value = (totalTiles * tilePrice).toString();
        console.log(value)
        send(tiles, { value })
    }

    return { status, state, sendTx };
}