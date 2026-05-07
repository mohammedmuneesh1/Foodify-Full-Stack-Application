import { useSelector } from "react-redux"
import type { RootState } from "../redux/store/store"

const FullPageLoader = () => {
  const { loading} = useSelector((state:RootState) => state.user);
  if (!loading) return null
  return (
    <div className="fixed inset-0 bg-red-400 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  )
}

export default FullPageLoader