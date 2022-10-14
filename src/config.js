export const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibmV4dGVhcnRoIiwiYSI6ImNrcWF2YmVtcTBjaTIydmsxMnVvNmk3aGYifQ.mDtuHWG2eeALeo8b0PvK_w"
export const BACKEND_URL = "https://data.metaearth.sbs/"
export const KLAY_TEST_RPC = "https://api.baobab.klaytn.net:8651/"
export const KLAY_CHAINID = 53
export const MEST_ADD = "0x5c859e6e6896bf44d68F195cBF759657BEA476fc"
export const MEST_ABI = ["function balanceOf(address) view returns (uint)",
    "function TILE_PRICE() view public returns(uint)",
    "function buyTiles(uint[] memory tiles) payable public",
    "function getTokenIdOfTiles(uint[] memory tiles) public view  returns (uint[] memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function getTilesFromTokenId(uint tokenId) public view returns(uint[] memory)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function tokenByIndex(uint256 index) external view returns (uint256)"
]
export const EXPLORER_URL="https://baobab.scope.klaytn.com/"
export const ESTATE_URI_URL="https://data-klay.metaearth.sbs/shoot"
export const VR_API_URL="https://data-klay.metaearth.sbs/"