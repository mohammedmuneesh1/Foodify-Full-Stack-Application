

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

//---------------------- SCROLL LEFT OR RIGHT START ----------------------


const cateScrollRef = useRef();

const scrollHandler(ref,direction)=>{
  if(ref.current){
    ref.current.scrollBy({
      left:direction === "left" ? -200:200,
      behaviour:"smooth",
    })
  }
}




<div
className="w-full flex overflow-x-auto gap-4 pb-2"
ref={cateScrollRef}
>
</div>

<button
onClick={()=>scrollHandler(cateScrollRef,"left")}
>
scroll to left 
</button>

//---------------------- SCROLL LEFT OR RIGHT END ----------------------