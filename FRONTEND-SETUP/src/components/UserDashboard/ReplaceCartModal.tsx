import { FiAlertTriangle } from "react-icons/fi";

const ReplaceCartModal = ({
  shopName,
  newShopName,
  onCancel,
  onReplace,
}: {
  shopName: string;
  newShopName: string;
  onCancel: () => void;
  onReplace: () => void;
}) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 animate-scale-in">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mx-auto">
        <FiAlertTriangle size={24} className="text-amber-500" />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-gray-900 text-base">Start a new cart?</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
          Your cart contains dishes from{" "}
          <span className="font-semibold text-gray-800">{shopName}</span>. Adding from{" "}
          <span className="font-semibold text-gray-800">{newShopName}</span> will discard your
          current selection.
        </p>
      </div>
      <div className="flex gap-3 mt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition"
        >
          No
        </button>
        <button
          onClick={onReplace}
          className="flex-1 py-2.5 rounded-xl bg-[#ff4d2d] text-white text-sm font-bold hover:bg-[#e63d1f] transition shadow-md shadow-red-100"
        >
          Replace
        </button>
      </div>
    </div>
  </div>
);

export default ReplaceCartModal;