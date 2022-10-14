
export const KLAYTestnet = {
  chainId: 1001,
  chainName: 'KLAYTestnet',
  isTestChain: true,
  isLocalChain: false,
  multicallAddress: '0x40643B8Aeaaca0b87Ea1A1E596e64a0e14B1d244',
  getExplorerAddressLink: (address) => `https://baobab.scope.klaytn.com/address/${address}`,
  getExplorerTransactionLink: (transactionHash) => `https://baobab.scope.klaytn.com/tx/${transactionHash}`,
  // Optional parameters:
  rpcUrl: 'https://api.baobab.klaytn.net:8651/',
  blockExplorerUrl: 'https://baobab.scope.klaytn.com/',
  nativeCurrency: {
    name: 'KLAYTestNet',
    symbol: 'KLAY',
    decimals: 18,
  }
}