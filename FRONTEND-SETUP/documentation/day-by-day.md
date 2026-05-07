

//03-05-2026

GEOAPIFY -> TO GET CITY DATA 



//---------------------- CITY GETTING START ----------------------

const getCity = async (latitude: number, longitude: number) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  )
  const data = await res.json()
  console.log(data)
  return data.address.city || data.address.town || data.address.village
}

APIFreeKey neededLimitNominatim (OpenStreetMap)✅ Free forever❌ No key1 req/sec


⚠️⚠️⚠️ IMP NOTE 
Free API (bigdatacloud) → call from frontend directly ✅
Paid API with key (Geoapify, Google) → always proxy through backend ✅

Never expose paid API keys in frontend code ❌



//---------------------- CITY GETTING END ----------------------