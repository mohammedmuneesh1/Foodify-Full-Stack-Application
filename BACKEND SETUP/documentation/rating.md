const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetType"
  },

  targetType: {
    type: String,
    enum: ["Shop", "Item"],
    required: true
  },

  value: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }

}, { timestamps: true });

targetType = "Shop"  → targetId refers to Shop
targetType = "Item"  → targetId refers to Item



🧠 Why separate collection?

Because you need:

one rating per user
ability to update rating
history
reviews later





🔥 How calculation actually works

When user submits rating:



  Shop rating
{
  "user": "u1",
  "targetId": "shop123",
  "targetType": "Shop",
  "value": 4
}
Item rating
{
  "user": "u1",
  "targetId": "item456",
  "targetType": "Item",
  "value": 5
}


ratingSchema.index(
  { user: 1, targetId: 1, targetType: 1 },
  { unique: true }
);


targetType === "Shop" → update shop.rating
targetType === "Item" → update item.rating

Case 1: shop rating (same logic on item rating)

shop.rating.count += 1
shop.rating.average =
  ((oldAverage * oldCount) + newRating) / newCount

