import create from 'zustand'

export default create(set => ({
  selectedTiles: [],
  setSelectedTiles: value => set({ selectedTiles: value }),
  isEase: false,
  setIsEase: value => set({ isEase: value }),
  isBuying: false,
  setIsBuying: value => set({ isBuying: value }),
  estateInfor: {},
  setEstateInfor: value => set({ estateInfor: value }),
  selectedEstateInfor: undefined,
  setSelectedEstateInfor: value => set({ selectedEstateInfor: value }),
  currentSelectTile: {},
  setCurrentSelectTile: value => set({currentSelectTile: value}),
}))