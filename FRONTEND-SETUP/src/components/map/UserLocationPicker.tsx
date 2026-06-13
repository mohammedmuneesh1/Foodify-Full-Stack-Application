"use client"

import React, { useState, useEffect } from 'react'
import { MdModeEditOutline, MdSearch } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import type { RootState } from '../../redux/store/store';
import { useSelector, useDispatch } from 'react-redux';
import type { LatLngExpression } from 'leaflet'
import { setUserAddress,setUserLocationCoordinates } from '../../redux/reducers/userSlice'; 
import { toast } from 'react-hot-toast';

// ── Fix Leaflet default marker icon in Next.js ──────────────────────────────
// import L from 'leaflet';
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
//eslint-disable-next-line
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: markerIcon?.src,
//   iconRetinaUrl: markerIcon2x?.src,
//   shadowUrl: markerShadow?.src,
// });
// ────────────────────────────────────────────────────────────────────────────

// Moves the map view when position changes
function MapUpdater({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);
  return null;
}

const UserLocationPicker = () => {
  const dispatch = useDispatch();
  const { userCoordinates,userAddress } = useSelector((state: RootState) => state.user);

  const [namePhone, setNamePhone] = useState({
    name: "",
    phone: "",
    label:"Home",
  });

  const [enableEdit, setEnableEdit] = useState<boolean>(false);

  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const position: LatLngExpression = [
    userCoordinates?.lat || 51.505,
    userCoordinates?.lng || -0.09,
  ];

  // ── Search by text (Nominatim) ──────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&addressdetails=1&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();

      if (!data.length) {
        setError("Location not found. Try a different search.");
        return;
      }

      const place = data[0];
      const { lat, lon, address } = place;

      dispatch(setUserLocationCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) }));
      dispatch(setUserAddress({
        addressLine: place.display_name,
        postalCode: address.postcode || "",
        city: address.city || address.town || address.village || "",
        state: address.state || "",
        country: address.country || "",
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      }));
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Detect current GPS location ─────────────────────────────────────────
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        dispatch(setUserLocationCoordinates({ lat, lng }));

        // Reverse geocode to get address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const { address } = data;

          dispatch(setUserAddress({
            addressLine: data.display_name,
            postalCode: address.postcode || "",
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
            latitude: lat,
            longitude: lng,
          }));
        } catch {
          // coordinates still set even if reverse geocode fails
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  const setNameAndPhone = () => {
    if(namePhone?.phone.trim().length !== 10){
        return toast.error("Please enter a valid phone number")
    }
    const existingObj = {
        ...userAddress,
        contactName: namePhone.name,
        contactPhone: namePhone.phone,
        label: namePhone.label,
    }
    dispatch(setUserAddress(existingObj))
    toast.success("Contact details saved!")
    setEnableEdit(false);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ">
      <h2 className="font-semibold text-lg">Address / Location</h2>

      {/* Search row */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 border border-gray-300 rounded-lg p-2 text-sm outline-none
                     focus:ring-2 focus:ring-[#ff4d2d]/50 transition"
          placeholder="Enter your delivery address"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#ff4d2d] hover:bg-red-600 cursor-pointer duration-300
                     rounded-full px-4 py-2 shrink-0 text-lg text-white disabled:opacity-50"
        >
          <MdSearch />
        </button>
        <button
          onClick={handleCurrentLocation}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 cursor-pointer duration-300
                     rounded-full px-4 py-2 shrink-0 text-lg text-white disabled:opacity-50"
        >
          <IoLocationSharp />
        </button>
      </div>
      {/* Search row end*/}

      {/* Status messages */}
      {loading && <p className="text-sm text-gray-400 mt-2">Searching...</p>}
      {error   && <p className="text-sm text-red-500  mt-2">{error}</p>}

      {/* Map Start */}
      <div className="z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        dragging={true}
        className="h-64 w-full mt-4 rounded-lg overflow-hidden !z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className='z-0'
        />
        <MapUpdater position={position} />
        <Marker position={position}>
          <Popup>Selected location</Popup>
        </Marker>
      </MapContainer>
      </div>
      {/* Map End */}



      {/*SELECTION LOCATION DATA */}
      <div>
        <h3 className="font-medium text-md mt-4">Selected Address:</h3>
        <p className="text-sm text-gray-600 mt-1">
            {userAddress && `${userAddress?.addressLine}, ${userAddress?.city}, ${userAddress?.state}, ${userAddress?.country}`}
        </p>
      </div>
      {/*SELECTION LOCATION DATA */}

      {/*PHONE + HOME OR WORK START */}

      <div 
      title="Contact Details"
      className={`border relative border-gray-300 rounded-lg 
       mt-4 ${enableEdit ? " " :  "  bg-gray-400/10  "  }  `}>
    
    
    <span className="absolute -top-3 left-3 bg-white px-2 text-xs text-gray-500 flex items-center gap-1 rounded-md">
    Contact Details{
       !enableEdit && (
         <MdModeEditOutline  onClick={() => setEnableEdit(true)} className="ml-2 cursor-pointer" />
       )
    }
  </span>


  <div className={`w-full p-2 ${enableEdit ? " " :  " pointer-events-none "  } `} >
        <h3 className="font-medium text-md mt-4">Contact Details:</h3>

        <div>
        <span className="text-sm text-gray-600 mt-1 block font-semibold">
         Name:
        </span>
         <input type="text" placeholder="Contact Name" 
         value={namePhone?.name}
         onChange={(e) => setNamePhone((prev) => ({ ...prev, name: e.target.value }))}
         
         className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-2 outline-none focus:ring-2 focus:ring-[#ff4d2d]/50 transition" />
        </div>

         <div className="mt-2">
         <span className="text-sm text-gray-600 mt-1 block font-semibold">
         Phone:
        </span>
        <input type="number" placeholder="Contact Phone" 
         value={namePhone?.phone}
         onChange={(e) => setNamePhone((prev) => ({ ...prev, phone: e.target.value }))}
         className="w-full border border-gray-300 rounded-lg p-2 text-sm  outline-none 
         focus:ring-2 focus:ring-[#ff4d2d]/50 transition" 
         />
         </div>

          <div className="flex  gap-4 space-y-1 border border-gray-300 rounded-lg p-3 mt-4">

                <div className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={namePhone?.label === "Home"}
                    onChange={() =>
                        setNamePhone((prev) => ({ ...prev, label: "Home" }))
                    }
                  />
                  <div>
                    <p className="font-medium">
                    Home
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-1  cursor-pointer">
                  <input
                    type="radio"
                    checked={namePhone?.label === "Work"}
                    onChange={() =>
                        setNamePhone((prev) => ({ ...prev, label: "Work" }))
                    }
                  />
                  <div>
                    <p className="font-medium">
                    Work
                    </p>
                  </div>
                </div>
              </div>

  </div>

  <div className="mb-2 mr-2">
{
  userAddress && !userAddress?.label && !userAddress?.contactName && !userAddress?.contactPhone && (

    enableEdit ? (
  <button 
        onClick={setNameAndPhone}
        className="bg-[#ff4d2d] text-white px-3 py-1 rounded-md mt-3 block ml-auto">
                Save Contact
        </button>
    ):
    (
      <button 
      onClick={() => setEnableEdit(true)}
      className="bg-blue-500 text-white px-3 py-1 rounded-md mt-3 block ml-auto ">
         Enable Edit
      </button>

    )

  )
}
  </div>

      </div>


      {/*PHONE + HOME OR WORK END */}



    </div>
  );
};

export default UserLocationPicker;