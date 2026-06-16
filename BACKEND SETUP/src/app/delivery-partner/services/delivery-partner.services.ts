// src/deliveryPartner/deliveryPartner.service.ts

import DeliveryPartnerModel from "../models/deliveryPartner.schema";
import deliveryAssignmentModel from "../models/deliveryAssignment.schema";
import { getIO, getOnlinePartners } from "../socket";

const RESPONSE_TIMEOUT_MS = 25 * 1000;
const SEARCH_RADII = [3000, 6000, 10000];

export async function tryNextPartner(
  assignmentId: string,
  shopCoordinates: [number, number],
  radiusIndex: number
) {
  const assignment = await deliveryAssignmentModel
    .findById(assignmentId)
    .populate("order");

  if (!assignment || assignment.status !== "broadcasted") return;

  const triedPartnerIds = assignment.broadcastedTo.map((b: any) =>
    b.partner.toString()
  );
  const radius = SEARCH_RADII[Math.min(radiusIndex, SEARCH_RADII.length - 1)];

  const partner = await DeliveryPartnerModel.findOne({
    _id: { $nin: triedPartnerIds },
    isAvailable: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: shopCoordinates },
        $maxDistance: radius,
      },
    },
  });

  if (!partner) {
    if (radiusIndex < SEARCH_RADII.length - 1) {
      return tryNextPartner(assignmentId, shopCoordinates, radiusIndex + 1);
    }
    // nobody found in any radius
    assignment.status = "failed";
    await assignment.save();

    const order = assignment.order as any;
    getIO()
      .to(`shop:${order.shop.toString()}`)
      .emit("delivery:failed", {
        orderId: order._id,
        message: "No delivery partner available nearby.",
      });
    return;
  }

  assignment.broadcastedTo.push({
    partner: partner._id,
    status: "pending",
    respondedAt: null,
  });
  await assignment.save();

  const partnerSocketId = getOnlinePartners().get(partner._id.toString());

  if (!partnerSocketId) {
    // partner is offline — skip immediately, don't waste 25 seconds
    const entry = assignment.broadcastedTo.find(
      (b: any) => b.partner.toString() === partner._id.toString()
    );
    if (entry) {
      entry.status = "rejected";
      entry.respondedAt = new Date();
      await assignment.save();
    }
    return tryNextPartner(assignmentId, shopCoordinates, radiusIndex);
  }

  // partner is online — send them the request
  getIO().to(partnerSocketId).emit("delivery:new_request", {
    assignmentId: assignment._id,
    order: assignment.order,
    shopCoordinates: assignment.shopCoordinates,
    customerCoordinates: assignment.customerCoordinates,
    distanceKm: assignment.distanceKm,
    deliveryFee: assignment.deliveryFee,
    timeoutSeconds: 25,
  });

  // start the timeout clock for this partner
  setTimeout(async () => {
    const current = await deliveryAssignmentModel.findById(assignmentId);
    if (!current || current.status !== "broadcasted") return;

    const entry = current.broadcastedTo.find(
      (b: any) =>
        b.partner.toString() === partner._id.toString() &&
        b.status === "pending"
    );

    if (entry) {
      entry.status = "rejected";
      entry.respondedAt = new Date();
      await current.save();

      // tell that partner their window expired
      const timedOutSocket = getOnlinePartners().get(partner._id.toString());
      if (timedOutSocket) {
        getIO().to(timedOutSocket).emit("delivery:request_expired", {
          assignmentId,
        });
      }

      await tryNextPartner(assignmentId, shopCoordinates, radiusIndex);
    }
  }, RESPONSE_TIMEOUT_MS);
}