import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  GET_HOTEL_OWNERS_ORDER_API,
  UPDATE_ORDER_STATUS_API,   // PATCH /orders/:orderId/status  { status: string }
} from '../../../api/orderPlace'

// ─── Types ────────────────────────────────────────────────────────────────────









const HotelOwnerOrderPage = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState('all')

   const [searchParams, setSearchParams] = useSearchParams();
   const page = Number(searchParams.get('page')) || 1;



  // ── Fetch orders (pass page + limit to API) ──
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hotelOrders', shopId, filter, page],
    queryFn: () =>
      GET_HOTEL_OWNERS_ORDER_API(shopId!, {
        status: filter,
        page
      }),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30_000, // auto-refresh every 30s for live orders
  })


  // ── Status update mutation ──
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({

    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      UPDATE_ORDER_STATUS_API(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelOrders', shopId] })
    },
  })

  const orders: Order[] = data?.data?.orders ?? []
  

  // Stats from current full dataset (ideally from API summary endpoint)


  function handleAccept(orderId: string) {
    updateStatus({ orderId, status: 'confirmed' })
  }

  function handleReject(orderId: string) {
    updateStatus({ orderId, status: 'cancelled' })
  }

  function handleAdvance(orderId: string, nextStatus: OrderStatus) {
    updateStatus({ orderId, status: nextStatus })
  }

  function handleFilterChange(f: string) {
    setFilter(f)
    searchQrySetFn('page', 1)
  }


  const searchQrySetFn = (query:string,value:string|number)=>{
    searchParams.set(query,String(value));
    setSearchParams(searchParams);
  }

  return (
    <div className="max-w-full mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Live dashboard · auto-refreshes every 30s</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['hotelOrders', shopId] })}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Pending', value: data?.data?.totalOrders ?? 0 },
            { label: 'Preparing', value: data?.data?.preparingOrders?? 0 },
            { label: 'Delivered', value:data?.data?.deliveredOrder ?? 0 },
            { label: 'Total', value: data?.data?.totalOrders ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg font-medium text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* States */}
      {isLoading && (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      )}

      {isError && (
        <div className="text-center py-16">
          <p className="text-red-500 font-medium">Failed to load orders</p>
          <p className="text-gray-400 text-sm mt-1">Check your connection and try refreshing.</p>
        </div>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No orders found for this filter.</p>
        </div>
      )}

      
      {/* Pagination */}


      {!isLoading &&
        !isError &&
        orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onAccept={handleAccept}
            onReject={handleReject}
            onAdvance={handleAdvance}
            isUpdating={isUpdating}
          />
        ))}

      <Pagination
       total={data?.data?.totalPages ?? 0 }
       limit={data?.data?.limit ?? 0}
       page={page}
        onPageChange={searchQrySetFn} 
        />


    </div>
  )
}

export default HotelOwnerOrderPage












type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

type Addon = {
  _id: string
  name: string
  quantity: number
  price: number
  applyType: 'per-item' | 'fixed'
}

type Variant = {
  name: string
  price: number
}

type OrderItem = {
  _id: string
  item: {
    _id: string
    name: string
    image: { url: string }
  }
  shop: string
  quantity: number
  addons: Addon[]
  variant?: Variant | null
  basePrice: number
  totalPrice: number
}

type Order = {
  _id: string
  shop: string
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
    contactName: string
    contactPhone: string
  }
  payment: { method: string; status: string }
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FLOW: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_STYLES: Record<string, string> = {
  pending:          'bg-amber-50   text-amber-800   border-amber-200',
  confirmed:        'bg-blue-50    text-blue-800    border-blue-200',
  preparing:        'bg-purple-50  text-purple-800  border-purple-200',
  out_for_delivery: 'bg-teal-50    text-teal-800    border-teal-200',
  delivered:        'bg-green-50   text-green-800   border-green-200',
  cancelled:        'bg-red-50     text-red-800     border-red-200',
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
    ' · ' +
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  )
}

function shortId(id: string) {
  return '#' + id.slice(-6).toUpperCase()
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border capitalize ${style}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ─── Status stepper ───────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: OrderStatus }) {
  const flowIdx = STATUS_FLOW.indexOf(status)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_FLOW.map((s, i) => {
        const isDone = i < flowIdx
        const isActive = i === flowIdx
        return (
          <React.Fragment key={s}>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                isDone
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : isActive
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              {STATUS_LABELS[s]}
            </span>
            {i < STATUS_FLOW.length - 1 && (
              <span className="text-gray-300 text-xs">›</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
      {item.item.image?.url ? (
        <img
          src={item.item.image.url}
          alt={item.item.name}
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {item.item.name}{' '}
          <span className="font-normal text-gray-500">×{item.quantity}</span>
          {item.variant && (
            <span className="ml-1.5 text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded-full">
              {item.variant.name} · {formatINR(item.variant.price)}
            </span>
          )}
        </p>

        {item.addons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.addons.map((a) => (
              <span
                key={a._id}
                className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
              >
                +{a.name}
                {a.quantity > 1 ? ` ×${a.quantity}` : ''} · {formatINR(a.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-gray-900 text-right min-w-[52px] flex-shrink-0">
        {formatINR(item.totalPrice)}
      </p>
    </div>
  )
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAccept,
  onReject,
  onAdvance,
  isUpdating,
}: {
  order: Order
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onAdvance: (id: string, nextStatus: OrderStatus) => void
  isUpdating: boolean
}) {
  const isPending = order.status === 'pending'
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'
  const flowIdx = STATUS_FLOW.indexOf(order.status)
  const nextStatus = STATUS_FLOW[flowIdx + 1] as OrderStatus | undefined

  const nextLabel: Record<string, string> = {
    confirmed: 'Mark preparing',
    preparing: 'Out for delivery',
    out_for_delivery: 'Mark delivered',
  }

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden mb-3.5 ${
        isPending ? 'border-l-2 border-l-amber-400 border-gray-200' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{shortId(order._id)}</span>
            <StatusBadge status={order.status} />
            {isPending && (
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                New
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">{formatTime(order.createdAt)}</span>
            <span className="text-xs text-gray-500">
              {order.deliveryAddress.contactName} · {order.deliveryAddress.label},{' '}
              {order.deliveryAddress.city}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-medium text-gray-900">{formatINR(order.totalAmount)}</p>
          <p className="text-[11px] text-gray-500 uppercase mt-0.5">{order.payment.method}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-1">
        {order.items.map((item) => (
          <ItemRow key={item._id} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-t border-gray-100">
        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
          {order.deliveryFee > 0 ? (
            <span>Delivery: {formatINR(order.deliveryFee)}</span>
          ) : (
            <span className="text-green-700">Free delivery</span>
          )}
          {order.discount > 0 && (
            <span className="text-green-700">Discount: −{formatINR(order.discount)}</span>
          )}
          <span>Subtotal: {formatINR(order.subtotal)}</span>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2">
            <button
              disabled={isUpdating}
              onClick={() => onReject(order._id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              ✕ Reject
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onAccept(order._id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors"
            >
              ✓ Accept
            </button>
          </div>
        )}

        {!isPending && !isCancelled && (
          <div className="flex flex-col items-end gap-2">
            <StatusStepper status={order.status} />
            {nextStatus && nextLabel[order.status] && (
              <button
                disabled={isUpdating || isDelivered}
                onClick={() => onAdvance(order._id, nextStatus)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                → {nextLabel[order.status]}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-3.5 animate-pulse">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-1/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="px-5 py-3 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-2/5" />
              <div className="h-2.5 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  total,
  page,
  limit,
  onPageChange,
}: {
  total: number
  page: number,
  limit: number,
  onPageChange: (qryName:string, p: string | number) => void
}) {
  const totalPages = Math.ceil(total / limit);
//   if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <button
        disabled={page === 1}
        onClick={() => onPageChange("page", page - 1)}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange("page",p)}

          className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors ${
            p === page
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange("page",page + 1)}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
      >
        ›
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Out for delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

