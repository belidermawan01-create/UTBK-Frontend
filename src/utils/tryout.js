export const TRYOUT_STATUS_LABELS = {
  DRAFT: "Draft",
  PUBLISHED: "Terbit",
  ONGOING: "Berlangsung",
  ENDED: "Selesai",
};

export function getTryoutStatusLabel(status) {
  return TRYOUT_STATUS_LABELS[status] || status || "Tidak diketahui";
}

export function getTryoutStatusClass(status) {
  switch (status) {
    case "ONGOING":
      return "status-ongoing";
    case "ENDED":
      return "status-done";
    case "PUBLISHED":
      return "status-done";
    default:
      return "status-ongoing";
  }
}

export function formatTryoutDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTryoutSubtes(tryout) {
  const raw = tryout?.subtes;
  return Array.isArray(raw) ? raw : [];
}

export function getTryoutSubtesItemCount(subtesItem) {
  if (!subtesItem) return 0;
  if (Array.isArray(subtesItem.soalIds)) return subtesItem.soalIds.length;
  if (Array.isArray(subtesItem.soal)) return subtesItem.soal.length;
  if (typeof subtesItem.soalCount === "number") return subtesItem.soalCount;
  return 0;
}

export function getTryoutSubtesSummary(tryout) {
  const subtes = getTryoutSubtes(tryout);
  const summary = { tps: 0, tka: 0, total: 0 };
  subtes.forEach((item) => {
    const count = getTryoutSubtesItemCount(item);
    const mapel = String(item.mapel || "").toUpperCase();
    if (mapel === "TPS" || mapel.includes("TPS")) summary.tps += count;
    if (mapel.startsWith("TKA") || mapel === "TKA") summary.tka += count;
    summary.total += count;
  });
  return summary;
}

export function canPublishTryout(tryout) {
  if (!tryout || tryout.status !== "DRAFT") return false;
  const summary = getTryoutSubtesSummary(tryout);
  return summary.tps > 0 && summary.tka > 0;
}

export function canDeleteTryout(tryout) {
  return tryout?.status === "DRAFT";
}
