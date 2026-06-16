import mongoose from "mongoose";


const deliveryAssignmentSchema  = new mongoose.Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "deliveryPartner",
        required: true
    },
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop",
        required: true
    },

 shopCoordinates: {
    type: [Number],   // [lng, lat]
    required: true
  },
  customerCoordinates: {
    type: [Number],   // [lng, lat]
    required: true
  },

  // ✅ new — calculated once at assignment creation
  distanceKm: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true   // in rupees
  },

  




broadcastedTo: [
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deliveryPartner",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }
],

   status: {
        type: String,
        enum: ["broadcasted", "assigned", "picked_up", "completed", "cancelled"],
        default: "broadcasted"
    },

    acceptedAt:{
        type: Date,
        default: null
    },
    completedAt:{
        type: Date,
        default: null
    }
});

const deliveryAssignmentModel = mongoose.models.deliveryAssignment || mongoose.model("deliveryAssignment", deliveryAssignmentSchema);
export default deliveryAssignmentModel;