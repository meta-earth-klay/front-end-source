import { MAPBOX_ACCESS_TOKEN } from "../config"

export async function reverseGeo({ lat, lng }) {
    try {
        let data = await (await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`)).json();
        return {
            display_name: data.features.filter(e => e.id.indexOf("place") === 0)[0]?.place_name,
            address: {
                country: data.features.filter(e => e.id.indexOf("country") === 0)[0].place_name,
                country_code: data.features.filter(e => e.id.indexOf("country") === 0)[0].properties.short_code,
            }
        }
    }
    catch (e) {
        return {}
    }
}