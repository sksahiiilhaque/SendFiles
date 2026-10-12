const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  createTransfer({ files, expiryHours }) {
    return request('/transfers', {
      method: 'POST',
      body: JSON.stringify({ files, expiryHours })
    });
  },

  getPartUploadUrl({ transferId, fileId, partNumber, senderToken }) {
    return request(`/transfers/${transferId}/files/${fileId}/part-url?partNumber=${partNumber}`, {
      method: 'GET',
      headers: { 'x-sender-token': senderToken }
    });
  },

  completeFile({ transferId, fileId, parts, senderToken }) {
    return request(`/transfers/${transferId}/files/${fileId}/complete`, {
      method: 'POST',
      headers: { 'x-sender-token': senderToken },
      body: JSON.stringify({ parts })
    });
  },

  finalizeTransfer({ transferId, senderToken }) {
    return request(`/transfers/${transferId}/finalize`, {
      method: 'POST',
      headers: { 'x-sender-token': senderToken }
    });
  },

  getTransferByCode(code) {
    const clean = String(code).trim().replace(/\s+/g, '');
    return request(`/transfers/by-code/${clean}`);
  },

  getTransferById(id) {
    return request(`/transfers/${id}`);
  },

  getFileDownloadUrl({ transferId, fileId }) {
    return request(`/transfers/${transferId}/files/${fileId}/download-url`);
  },

  revokeTransfer({ transferId, senderToken }) {
    return request(`/transfers/${transferId}`, {
      method: 'DELETE',
      headers: { 'x-sender-token': senderToken }
    });
  },

  checkHealth() {
    return request('/health');
  }
};
