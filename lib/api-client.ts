"use client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem("auth_token", token)
  }

  getToken() {
    return this.token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem("auth_token")
  }

  private getHeaders() {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    const token = this.getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_URL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      if (response.status === 401) {
        this.clearToken()
        window.location.href = "/"
        return { error: "Unauthorized" }
      }

      const data = await response.json()

      console.log({ data })

      if (!response.ok) {
        return { error: data.detail || "An error occurred" }
      }

      return { data }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error"
      return { error: message }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, username: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    })
  }

  // Broker endpoints
  async getBrokers() {
    return this.request("/broker-configs")
  }

  async createBroker(brokerName: string, login: string, server: string) {
    return this.request("/broker-configs", {
      method: "POST",
      body: JSON.stringify({ broker_name: brokerName, login, server }),
    })
  }

  async deleteBroker(configId: string) {
    return this.request(`/broker-configs/${configId}`, { method: "DELETE" })
  }

  // Credential endpoints
  async storeCredential(brokerId: string, type: string, value: string) {
    return this.request("/credentials", {
      method: "POST",
      body: JSON.stringify({
        broker_config_id: brokerId,
        credential_type: type,
        credential_value: value,
      }),
    })
  }

  // Telegram endpoints
  async getTelegramChannels() {
    return this.request("/telegram-channels")
  }

  async createTelegramChannel(channelId: number, channelName: string) {
    return this.request("/telegram-channels", {
      method: "POST",
      body: JSON.stringify({ channel_id: channelId, channel_name: channelName }),
    })
  }

  async deleteTelegramChannel(channelId: string) {
    return this.request(`/telegram-channels/${channelId}`, { method: "DELETE" })
  }

  // Signal endpoints
  async getSignals(limit = 50, offset = 0) {
    return this.request(`/signals?limit=${limit}&offset=${offset}`)
  }

  async executeSignal(signalId: string, brokerConfigId: string) {
    return this.request("/executions", {
      method: "POST",
      body: JSON.stringify({ signal_id: signalId, broker_config_id: brokerConfigId }),
    })
  }

  // Position endpoints
  async getExecutions(limit = 50, offset = 0) {
    return this.request(`/executions?limit=${limit}&offset=${offset}`)
  }

  async closePosition(executionId: string) {
    return this.request(`/executions/${executionId}/close`, { method: "POST" })
  }

  async modifyPosition(executionId: string, stopLoss?: number, takeProfit?: number) {
    return this.request(`/executions/${executionId}/modify`, {
      method: "POST",
      body: JSON.stringify({ stop_loss: stopLoss, take_profit: takeProfit }),
    })
  }

  // Account endpoints
  async getAccountInfo(brokerConfigId: string) {
    return this.request(`/account/info?broker_config_id=${brokerConfigId}`)
  }

  // Notification Subscriber endpoints
  async getSubscribers() {
    return this.request("/subscribers")
  }

  async addSubscriber(telegramId: string, name?: string) {
    return this.request("/subscribers", {
      method: "POST",
      body: JSON.stringify({ telegram_id: telegramId, name }),
    })
  }

  async deleteSubscriber(subscriberId: string) {
    return this.request(`/subscribers/${subscriberId}`, { method: "DELETE" })
  }

  // System endpoints
  async getSystemStatus() {
    return this.request("/system/status")
  }

  async startSystem() {
    return this.request("/system/start", { method: "POST" })
  }

  async stopSystem() {
    return this.request("/system/stop", { method: "POST" })
  }

  // Execution Confirmation
  async confirmExecution(executionId: string, overrides: { stop_loss?: number; take_profit?: number }) {
    return this.request(`/executions/${executionId}/confirm`, {
      method: "POST",
      body: JSON.stringify(overrides),
    })
  }

  async rejectExecution(executionId: string) {
    return this.request(`/executions/${executionId}/cancel`, {
      method: "POST",
    })
  }

  // Settings
  async getSettings() {
    return this.request("/settings")
  }

  async updateSettings(settings: {
    manual_approval?: boolean
    risk_per_trade?: number
    max_slippage?: number
    default_stop_loss_pips?: number
    use_limit_orders?: boolean
  }) {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  }
}

export const apiClient = new ApiClient()
