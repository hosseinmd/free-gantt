/* eslint-disable @typescript-eslint/no-explicit-any */

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const STORAGE_KEY = 'google_sheets_token'
const STORAGE_EXPIRY_KEY = 'google_sheets_token_expiry'

export interface GoogleSheetsData {
  values: string[][]
}

class GoogleSheetsService {
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    // Try to restore saved session on initialization
    this.restoreSession()
  }

  setAccessToken(token: string, expiresIn: number = 3600): void {
    this.accessToken = token
    // Calculate expiry time (current time + expires_in seconds)
    this.tokenExpiry = Date.now() + expiresIn * 1000

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(STORAGE_EXPIRY_KEY, this.tokenExpiry.toString())
  }

  clearAccessToken(): void {
    this.accessToken = null
    this.tokenExpiry = null

    // Clear from localStorage
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_EXPIRY_KEY)
  }

  hasAccessToken(): boolean {
    // Check if we have a token and it hasn't expired
    if (!this.accessToken || !this.tokenExpiry) {
      return false
    }

    // Check if token is still valid (with 5 minute buffer)
    const isExpired = Date.now() >= this.tokenExpiry - 5 * 60 * 1000
    if (isExpired) {
      this.clearAccessToken()
      return false
    }

    return true
  }

  restoreSession(): boolean {
    const token = localStorage.getItem(STORAGE_KEY)
    const expiryStr = localStorage.getItem(STORAGE_EXPIRY_KEY)

    if (!token || !expiryStr) {
      return false
    }

    const expiry = parseInt(expiryStr, 10)

    // Check if token is still valid (with 5 minute buffer)
    if (Date.now() >= expiry - 5 * 60 * 1000) {
      // Token expired, clear it
      this.clearAccessToken()
      return false
    }

    // Restore the session
    this.accessToken = token
    this.tokenExpiry = expiry
    return true
  }

  getTokenExpiry(): Date | null {
    if (!this.tokenExpiry) {
      return null
    }
    return new Date(this.tokenExpiry)
  }

  extractSheetId(url: string): string | null {
    // Extract spreadsheet ID from Google Sheets URL
    // Format: https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit...
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  async getAllSheetNames(spreadsheetId: string): Promise<string[]> {
    try {
      // Get spreadsheet metadata to find all sheet names
      const url = `${SHEETS_API_BASE}/${spreadsheetId}?key=${API_KEY}&fields=sheets.properties.title`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error?.message || 'Failed to get spreadsheet info'
        )
      }

      const data = await response.json()
      const sheets = data.sheets || []

      if (sheets.length === 0) {
        throw new Error('No sheets found in spreadsheet')
      }

      return sheets.map((sheet: any) => sheet.properties.title)
    } catch (error) {
      console.error('Error getting sheet names:', error)
      throw error
    }
  }

  async getFirstSheetName(spreadsheetId: string): Promise<string> {
    const sheets = await this.getAllSheetNames(spreadsheetId)
    return sheets[0]
  }

  async readSheet(
    spreadsheetId: string,
    range?: string
  ): Promise<GoogleSheetsData> {
    try {
      // If no range specified, auto-detect the first sheet name
      let sheetRange = range
      if (!sheetRange) {
        const firstSheetName = await this.getFirstSheetName(spreadsheetId)
        sheetRange = firstSheetName
        console.log('Auto-detected sheet name:', firstSheetName)
      }

      const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(sheetRange)}?key=${API_KEY}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || 'Failed to read sheet'

        // Provide helpful error messages
        if (response.status === 400) {
          throw new Error(
            `Unable to read sheet. ${errorMessage}. Make sure the sheet has the correct column headers.`
          )
        } else if (response.status === 403) {
          throw new Error(
            'Permission denied. Make sure you have access to this Google Sheet.'
          )
        } else if (response.status === 404) {
          throw new Error(
            'Sheet not found. Check the URL and make sure the sheet exists.'
          )
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      return {
        values: data.values || [],
      }
    } catch (error) {
      console.error('Error reading sheet:', error)
      throw error
    }
  }

  async writeSheet(
    spreadsheetId: string,
    range: string,
    values: string[][]
  ): Promise<void> {
    try {
      const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${API_KEY}`

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to write to sheet')
      }
    } catch (error) {
      console.error('Error writing to sheet:', error)
      throw error
    }
  }

  parseSheetData(data: GoogleSheetsData): any[] {
    if (!data.values || data.values.length === 0) {
      return []
    }

    const [headers, ...rows] = data.values

    return rows.map(row => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || ''
      })
      return obj
    })
  }

  formatDataForSheet(data: any[]): string[][] {
    if (data.length === 0) {
      return []
    }

    const headers = Object.keys(data[0])
    const rows = data.map(item => headers.map(header => String(item[header])))

    return [headers, ...rows]
  }
}

export const googleSheetsService = new GoogleSheetsService()
