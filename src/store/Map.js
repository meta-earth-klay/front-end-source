import create from 'zustand'

export default create(set => ({
  zoom: 15.5,
  lat: 37.327261, 
  lng: -121.850928,
  setStatus: ({ zoom, lat, lng }) => set({ zoom, lat, lng }),
  map: {},
  setMap: map => set({ map }), 
  style: 'satellite-streets-v11',
  setStyle: value => set({style: value})
}))