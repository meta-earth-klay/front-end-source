import create from 'zustand'

export default create(set => ({
  tokenId: "",
  setTokenId: value => set({ tokenId: value }),
  items: [],
  setItems: value => set({ items: value }),
  addItem: value => set(state => ({ items: [...state.items, value] })),
  removeItem: value => set(state=>({ items: state.items.filter(e=>e.id===value.id) })),
}))