import { apiClient, unwrap } from './client'
import type { ApiEnvelope, BillingProduct, OrderStatusResponse } from './types'

export async function fetchBillingProduct(): Promise<BillingProduct> {
  const response = await apiClient.get<ApiEnvelope<BillingProduct>>('/billing/product')
  return unwrap(response)
}

export async function fetchOrder(orderId: string): Promise<OrderStatusResponse> {
  const response = await apiClient.get<ApiEnvelope<OrderStatusResponse>>(`/orders/${orderId}`)
  return unwrap(response)
}
