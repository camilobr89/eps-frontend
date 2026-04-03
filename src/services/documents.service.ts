import api from './api'

export interface DocumentUploadResponse {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size_bytes: number
  ocr_status: string
  uploaded_at: string
}

export interface OcrStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage?: string
}

export const documentsService = {
  async upload(
    authorizationId: string,
    file: File,
    onUploadProgress?: (progress: number) => void,
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<DocumentUploadResponse>(
      `/authorizations/${authorizationId}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onUploadProgress) {
            onUploadProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      },
    )
    return response.data
  },

  async getDownloadUrl(documentId: string): Promise<string> {
    const response = await api.get<{ url: string }>(
      `/documents/${documentId}/download`,
    )
    return response.data.url
  },

  async getOcrStatus(documentId: string): Promise<OcrStatusResponse> {
    const response = await api.get<OcrStatusResponse>(
      `/documents/${documentId}/ocr-status`,
    )
    return response.data
  },
}
