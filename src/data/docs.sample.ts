export type Doc = {
  id: string;
  title: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const docs: Doc[] = [
  {
    id: "hc-mei-2025",
    title: "Healthcheck: Rekap Mei 2025",
    tags: ["BCAF", "Healthcheck", "Dynatrace"],
    content:
      "Ringkasan temuan Dynatrace, jadwal vendor, dan rekap laporan bulan Mei.",
    createdAt: "2025-05-28T03:00:00.000Z",
    updatedAt: "2025-05-28T09:00:00.000Z",
  },
  {
    id: "velostay-bukti-transfer",
    title: "VeloStay: Rencana Fitur Bukti Transfer",
    tags: ["VeloStay", "Next.js", "Prisma"],
    content:
      "Implementasi upload bukti pembayaran saat checkout. Alur verifikasi admin.",
    createdAt: "2025-08-26T03:00:00.000Z",
    updatedAt: "2025-08-26T05:00:00.000Z",
  },
  {
    id: "kasumkm-chart-refresh",
    title: "KasUMKM: Auto-refresh Chart setelah Input",
    tags: ["React Native", "SQLite", "Charts"],
    content:
      "Perbaikan auto-scroll dan refresh ke data terbaru untuk income/expense.",
    createdAt: "2025-08-30T01:00:00.000Z",
    updatedAt: "2025-08-30T02:00:00.000Z",
  },
];
