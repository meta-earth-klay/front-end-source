import create from 'zustand'

export default create(set => ({
  address: "",
  setAddress: value => set({address: value}),
  isLogin: false,
  setLogin: value => set({isLogin: value}),
}))