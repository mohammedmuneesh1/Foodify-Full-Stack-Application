import React from 'react'
import { GET_ALL_ORDER_API } from '../../../api/orderPlace'
import { useQuery } from '@tanstack/react-query'

type OrderImage = {
  url: string
  dimension?: { width: number; height: number }
}

type OrderItem = {
  item: {
    _id: string
    name: string
    price: number
    image: OrderImage
  }
  shop: string
  quantity: number
  addons: {
  name: string
  quantity: number
  price: number
  applyType: 'per-item' | 'fixed'
}[]
  variant?: {
    name:string;
    price:string;
  }      // e.g. "Large", "Spicy" — optional on item
  basePrice: number
  totalPrice: number
  _id: string
}

type Order = {
  _id: string
  user: string
  shop: {
    _id: string
    name: string
    slug: string
    image: OrderImage
  }
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  totalAmount: number
  deliveryAddress: {
    label: string
    addressLine: string
    city: string
    state: string
    postalCode?: string
    country: string
    latitude: number
    longitude: number
    contactName: string
    contactPhone: string
  }
  payment: {
    method: string
    status: string
    transactionId: string | null
    paidAt: string | null
  }
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  deliveryAgent: string | null
  createdAt: string
  updatedAt: string
  __v: number
}

const STATUS_STYLES: Record<string, string> = {
  pending:           'bg-amber-50   text-amber-700   border-amber-200',
  confirmed:         'bg-green-50   text-green-700   border-green-200',
  preparing:         'bg-blue-50    text-blue-700    border-blue-200',
  out_for_delivery:  'bg-purple-50  text-purple-700  border-purple-200',
  delivered:         'bg-teal-50    text-teal-700    border-teal-200',
  cancelled:         'bg-red-50     text-red-700     border-red-200',
  refund_initiated : 'bg-amber-50   text-amber-700   border-amber-200',
  refunded:          'bg-green-50   text-green-700   border-green-200',
  ready_for_pickup:  'bg-cyan-50    text-cyan-700    border-cyan-200',
  picked_up :        'bg-teal-50    text-teal-700    border-teal-200',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN')
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ')
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${style} capitalize whitespace-nowrap`}
    >
      {label}
    </span>
  )
}

// ─── Single item row ───────────────────────────────────────────────────────────
function ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
      {item.item.image?.url ? (
        <img
          src={item.item.image.url}
          alt={item.item.name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 text-xs">🍽</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.item.name}</p>
     {item.variant && (
  <p className="text-[11px] text-gray-500 mt-0.5">
    Variant: {item.variant.name}
  </p>
)}
     {item.addons.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-1">
    {item.addons.map((addon, i) => (
      <span
        key={i}
        className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
      >
        + {addon.name}
        {addon.quantity > 1 && ` ×${addon.quantity}`}
        {' '}· {formatINR(addon.price)}
      </span>
    ))}
  </div>
)}
      </div>

      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
        × {item.quantity}
      </span>
      <p className="text-sm font-medium text-gray-900 text-right min-w-[60px] flex-shrink-0">
        {formatINR(item.totalPrice)}
      </p>
    </div>
  )
}

// ─── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        {order.shop.image?.url ? (
          <img
            src={order.shop.image.url}
            alt={order.shop.name}
            className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {initials(order.shop.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-gray-900 truncate">{order.shop.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(order.createdAt)} · {order.items.length} item
            {order.items.length > 1 ? 's' : ''}
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="px-5 py-2">
        {order?.items?.map((item) => (
          <ItemRow key={item._id} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-5 py-3.5 flex items-end justify-between gap-4">
        {/* Delivery address */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-500 mb-0.5 flex items-center gap-1">
            📍 {order.deliveryAddress.label}
          </p>
          <p className="text-xs text-gray-700 truncate">
            {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
          </p>
        </div>

        {/* Totals */}
        <div className="text-right flex-shrink-0">
          {order.deliveryFee > 0 ? (
            <p className="text-xs text-gray-500 mb-0.5">
              Delivery: {formatINR(order.deliveryFee)}
            </p>
          ) : (
            <p className="text-xs text-green-600 mb-0.5">Free delivery</p>
          )}
          {order.discount > 0 && (
            <p className="text-xs text-green-600 mb-0.5">
              Discount: −{formatINR(order.discount)}
            </p>
          )}
          <div className="flex items-center gap-2 justify-end mt-1">
            <p className="text-[15px] font-semibold text-gray-900">
              {formatINR(order.totalAmount)}
            </p>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-500 uppercase">
              {order.payment.method}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 animate-pulse">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-1/3" />
          <div className="h-2.5 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-2/5" />
              <div className="h-2.5 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-4 w-14 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🛍</div>
      <p className="text-gray-900 font-medium text-base">No orders yet</p>
      <p className="text-gray-500 text-sm mt-1">Your order history will appear here.</p>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const CustomerOrderPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['customerOrder'],
    queryFn: () => GET_ALL_ORDER_API(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const orders: Order[] = data?.data?.orders ?? []
  console.log('orders', orders)
  return (
    <div className="max-w-7xl mx-auto mx-auto px-4 py-6">
      {/* Page heading */}
      <div className="flex items-center gap-2.5 mb-6">
        <h1 className="text-xl font-medium text-gray-900">My orders</h1>
        {!isLoading && !isError && (
          <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        )}
      </div>

      {/* States */}
      {isLoading && (
        <>
          <Skeleton />
          <Skeleton />
        </>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 font-medium">Something went wrong</p>
          <p className="text-gray-400 text-sm mt-1">Could not load your orders. Try refreshing.</p>
        </div>
      )}

      {!isLoading && !isError && orders?.length === 0 && <EmptyState />}

      {!isLoading && !isError && orders?.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

export default CustomerOrderPage