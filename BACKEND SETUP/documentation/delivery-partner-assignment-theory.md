Because:

broadcasted
   ↓
accepted
   ↓
picked_up
   ↓
delivered

You need all states.



The full order lifecycle (what you're building toward)

1) Customer places order → Order created with status "placed"
2) Shop owner sees it on dashboard → accepts ("accepted" / "preparing") or rejects ("rejected")
3) Shop marks food ready → this is the trigger point — you create a deliveryAssignment document and broadcast it to nearby delivery partners
4) Delivery partners get notified (via socket/push) → first one to accept gets assigned
5) Partner picks up from shop → order status moves to "out_for_delivery"
6) Partner delivers → assignment status "completed", order status "delivered"


So deliveryAssignment is the bridge between "order is ready" and "someone is delivering it." Your instinct to create this as a separate collection is correct — don't cram delivery logic into the Order schema.



Q2 — Status enum and "rejected"



Suggested build order from here

Add status: "ready" action on the shop dashboard (when food prep is done)
On that action, create the deliveryAssignment doc + find nearby available partners + populate broadcastedTo
Build an "Accept Delivery" endpoint for partners — use findOneAndUpdate with a condition like { _id: assignmentId, status: "broadcasted" } so two partners can't accept the same order at once (atomic update prevents race conditions)
Add "Picked up" and "Delivered" endpoints for the partner to update assignment status, which in turn updates the Order status
Set up Socket.IO for: shop gets notified of new orders, partners get notified of broadcasts, customer gets live status updates





The full order lifecycle (what you're building toward)

1) Customer places order → Order created with status "placed"

2) Shop owner sees it on dashboard → accepts ("accepted" / "preparing") or rejects ("rejected")

3) Shop marks food ready → this is the trigger point — you create a deliveryAssignment document and broadcast it to nearby delivery partners

4) Delivery partners get notified (via socket/push) → first one to accept gets assigned. 

5) Partner picks up from shop → order status moves to "out_for_delivery".

6) Partner delivers → assignment status "completed", order status "delivered".




The flow:

1) Order becomes "ready_for_pickup" → create a deliveryAssignment doc

2) Find the nearest available partner who hasn't been tried yet → add them to broadcastedTo with status "pending" → notify them (socket/push)

3) Start a 25-30 second timer

4) If they accept → assignment becomes "assigned", done

5) If they reject or the timer expires first → mark their entry "rejected", find the next nearest untried partner, repeat

6) If you run out of nearby partners → assignment becomes "failed"




final steps 


https://claude.ai/chat/96e722b1-ec5e-4b63-b8f8-b5e5880c2020



Customer places order
  → picks delivery address from map (sends lat/lng)
  → order saved with deliveryAddress.location.coordinates


Shop marks order "ready_for_pickup"
  → createDeliveryAssignment() runs
      shopCoords  = from shop document
      customerCoords = from order.deliveryAddress.location
      distance    = haversine(shopCoords, customerCoords) → e.g. 3.2 km
      deliveryFee = 20 + (3.2 × 8) = ₹46
      → saved on assignment
      → order.totalAmount updated = itemsTotal + ₹46

tryNextPartner() finds nearest available partner
  → emits to their socket:
      "3.2km ride, you earn ₹46, accept within 25s"

Partner accepts
  → assignment.status = "assigned"
  → partner picks up from shop → marks "picked_up"
  → partner delivers to customer coordinates → marks "completed"






  createDeliveryAssignment() throws
        ↓
catch block in UPDATE_ORDER_STATUS
  → order saved as "ready_for_pickup" ✅
  → no assignment doc exists
  → response tells frontend: "failed to start search"
        ↓
Dashboard shows: "Could not start delivery search"
                 [Retry Search] button   ← enabled because canRetry: true

Hotel owner clicks Retry
        ↓
POST /orders/:orderId/retry-delivery
  → checks order is "ready_for_pickup" ✅
  → checks no active assignment running ✅
  → calls createDeliveryAssignment() again
        ↓
tryNextPartner() runs again from scratch
  → if nobody found after all radii:
      assignment.status = "failed"
      socket emits "delivery:failed" to shop room
      Dashboard shows [Retry Search] again
        ↓
  → if partner found and accepts:
      socket emits "delivery:assigned" to shop room
      Dashboard shows partner name/phone
      [Retry Search] button disappears






      https://claude.ai/chat/96e722b1-ec5e-4b63-b8f8-b5e5880c2020


      