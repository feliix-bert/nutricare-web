const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatTime = (isoString?: string): string => {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    return timeFormatter.format(d) + " WIB";
  } catch {
    return "00:00 WIB";
  }
};
