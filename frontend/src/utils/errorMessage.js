function fromDetail(detail) {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.msg === 'string') return item.msg;
        return '';
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(', ');
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.msg === 'string' && detail.msg.trim()) {
      return detail.msg;
    }
    if (typeof detail.detail === 'string' && detail.detail.trim()) {
      return detail.detail;
    }
  }

  return '';
}

export function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  const formatted = fromDetail(detail);
  if (formatted) return formatted;
  if (error?.code === 'ECONNABORTED') {
    return 'Upload timed out. Try a smaller image or retry after a moment.';
  }
  if (!error?.response) {
    return 'Cannot reach backend API. Ensure backend is running on http://127.0.0.1:8000.';
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
}
