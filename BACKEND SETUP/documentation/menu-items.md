  discount: {
      price: {
        type: Number
      },
      validFrom: {
        type: Date
      },
      validUpto: {
        type: Date
      },
      isActive: {
        type: Boolean,
        default: false
      }
    },



// utils/getEffectivePrice.ts
const getEffectivePrice = (price: number, discount: any) => {
  if (!discount || !discount.isActive || !discount.price) {
    return price // no discount → return original
  }

  const now = new Date()
  const isValid =
    (!discount.validFrom || new Date(discount.validFrom) <= now) &&
    (!discount.validUpto || new Date(discount.validUpto) >= now)

  return isValid ? discount.price : price // ✅ expired → return original
}

// Usage
getEffectivePrice(item.price, item.discount)

// For variants
getEffectivePrice(variant.price, variant.discount)



// ✅ Item on sale until end of month
{
  name: "Chicken Biryani",
  price: 220,
  discount: {
    price: 180,
    validFrom: "2026-05-01",
    validUpto: "2026-05-31",
    isActive: true          // ✅ discount applies
  }
}

// ✅ Expired discount — getEffectivePrice returns 220 automatically
{
  name: "Chicken Biryani",
  price: 220,
  discount: {
    price: 180,
    validUpto: "2026-04-01", // expired
    isActive: true
  }
}