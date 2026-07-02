"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, FileBadge, Activity, Search, ShieldCheck, ShieldAlert } from "lucide-react";
import { usePatients, useIssueVc, useRevokeVc } from "@/features/medic/hooks/useMedic";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

// Dummy stats for the overview UI to match reference (could be calculated from data)
const STATS = [
  { label: "Total Pasien", value: "24", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Riwayat Assessment", value: "128", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "VC Diterbitkan", value: "15", icon: FileBadge, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function MedicDashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePatients(0, 50, search, "ALL");
  const issueVc = useIssueVc();
  const revokeVc = useRevokeVc();

  const patients = data?.data ?? [];

  const handleIssue = (childId: string) => {
    if (confirm("Terbitkan Verifiable Credential untuk anak ini?")) {
      issueVc.mutate({ childId, vcType: "NUTRITION_STATUS" });
    }
  };

  const handleRevoke = (vcId: string) => {
    if (confirm("Cabut Verifiable Credential ini? Aksi ini permanen.")) {
      revokeVc.mutate({ vcId });
    }
  };

  return (
    <PageShell className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1c1c1c] tracking-tight">Dashboard Medis</h1>
        <p className="text-on-surface-variant font-medium mt-2">
          Pantau kesehatan anak, riwayat assessment, dan kelola penerbitan Verifiable Credentials.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-card border border-outline-variant/10 flex items-center gap-5 hover-lift transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface-variant">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-[#1c1c1c] mt-1 leading-none">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-3xl shadow-card border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-bold text-[#1c1c1c]">Daftar Pasien Anak</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
            <input
              type="text"
              placeholder="Cari nama pasien..."
              className="w-full bg-surface-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table / Grid */}
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-warm/50 text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="px-6 py-4">Nama Anak</th>
                <th className="px-6 py-4">Umur & Gender</th>
                <th className="px-6 py-4">Orang Tua</th>
                <th className="px-6 py-4">Status Gizi</th>
                <th className="px-6 py-4 text-right">Aksi VC</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant font-medium">
                    Memuat data pasien...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant font-medium">
                    Tidak ada pasien ditemukan.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr
                    key={p.childId}
                    className="border-b border-outline-variant/5 hover:bg-surface-low/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/children/${p.childId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#1c1c1c] text-base">{p.childName}</div>
                      <div className="text-xs text-on-surface-variant font-medium mt-1">
                        Terakhir update: {p.lastAssessmentDate ? new Date(p.lastAssessmentDate).toLocaleDateString("id-ID") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{p.ageMonths} Bulan</div>
                      <div className="text-xs text-on-surface-variant">{p.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{p.parentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.lastStatus === 'NORMAL' ? 'bg-green-100 text-green-700' :
                        p.lastStatus === 'AT_RISK' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.lastStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      {p.activeVcId ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleRevoke(p.activeVcId!)}
                          disabled={revokeVc.isPending}
                        >
                          <ShieldAlert size={16} className="mr-2" />
                          Cabut VC
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleIssue(p.childId)}
                          disabled={issueVc.isPending}
                        >
                          <ShieldCheck size={16} className="mr-2" />
                          Terbitkan VC
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
