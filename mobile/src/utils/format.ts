export const formatTime = (isoString?: string): string => {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m} WIB`;
  } catch {
    return "00:00 WIB";
  }
};
