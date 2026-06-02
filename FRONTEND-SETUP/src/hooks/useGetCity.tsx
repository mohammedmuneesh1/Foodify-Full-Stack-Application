import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCity, setUserAddress, setUserLocationCoordinates } from "../redux/reducers/userSlice";
import toast from "react-hot-toast";

function useGetCity(isLoggedIn: boolean) {
  const dispatch = useDispatch();


  const getCity = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      );

      if (!res.ok) {
        throw new Error("Failed API response");
      }

      const data = await res.json();
      console.log("Geolocation API response:", data);
      dispatch(setUserAddress({
        addressLine: data.display_name,
        postalCode: data?.address?.postcode || "",
        state: data?.address?.state || "",
        city: data?.address?.city || data?.address?.village ,
        latitude,
        longitude,
        country: data?.address?.country,
      }));

      return data;
    } catch (error) {
      console.error("City fetch error:", error);
      return null;
    }
  };

  //eslint-disable-next-line
  const geoapifyApi = async (lat: number, long: number) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${import.meta.env.VITE_GEOGRAPHY_API_KEY}`,
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : `Unknown error${error}`,
      );
      return null;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return; // 👈 skip if not logged in

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser. Please enable it.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setUserLocationCoordinates({lat: latitude,lng:longitude }));
        
        const geoapifyResult = await getCity(latitude, longitude);
        if (!geoapifyResult) {
          toast.error("Network issue occured while fetching your location. Please try again later.");
          return;
        }
        dispatch(setCity(geoapifyResult?.address?.city ?? geoapifyResult?.address?.village)); 
        localStorage.setItem("city", geoapifyResult?.address?.city ?? geoapifyResult?.address?.village);
      },
      (error) => {
        console.log("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [isLoggedIn, dispatch]);
}

export default useGetCity;
