import { useEffect } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const LANGUAGE_CODE = "vi"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const ForceVietnameseLanguage = () => {
  useEffect(() => {
    const cookieIsVietnamese = document.cookie
      .split(";")
      .some((cookie) => cookie.trim() === `lng=${LANGUAGE_CODE}`)
    const storageIsVietnamese = localStorage.getItem("lng") === LANGUAGE_CODE

    localStorage.setItem("lng", LANGUAGE_CODE)
    document.cookie = `lng=${LANGUAGE_CODE}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`

    if (!cookieIsVietnamese || !storageIsVietnamese) {
      window.location.reload()
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "login.before",
    "order.list.before",
    "order.details.before",
    "product.list.before",
    "product.details.before",
    "customer.list.before",
    "customer.details.before",
    "promotion.list.before",
    "promotion.details.before",
    "price_list.list.before",
    "price_list.details.before",
    "store.details.before",
    "profile.details.before",
    "user.list.before",
    "user.details.before",
    "region.list.before",
    "region.details.before",
    "sales_channel.list.before",
    "sales_channel.details.before",
    "api_key.list.before",
    "api_key.details.before",
    "inventory_item.list.before",
    "inventory_item.details.before",
    "location.list.before",
    "location.details.before",
  ],
})

export default ForceVietnameseLanguage
