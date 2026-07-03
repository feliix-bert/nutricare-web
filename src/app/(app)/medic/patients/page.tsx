"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Eye, PenLine } from "lucide-react";
import { usePatients } from "@/features/medic/hooks/useMedic";
import { MedicShell, ClinicalBadge } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";

type StatusFilter = "ALL" | "NORMAL" | "AT_RISK" | "STUNTED" | "SEVERELY_STUNTED";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All Patients", value: "ALL" },
  { label: "Normal", value: "NORMAL" },
  { label: "At Risk", value: "AT_RISK" },
  { label: "Stunting", value: "STUNTED" },
  { label: "Critical", value: "SEVERELY_STUNTED" },
];

export default function MedicPatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading } = usePatients(page, 20, search, status);
  const patients = data?.data ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <MedicShell>
      {/* ── Header & Search ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Patients
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            {total} registered patients
          </p>
        </div>
        
        {/* Search Bar - Rounded style */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-full bg-slate-50 border-none pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
          />
        </div>
      </div>

      {/* ── Pill Filters ── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(0); }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                active 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Table (Medica Style) ── */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 font-bold">
            Loading patients...
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-slate-200 mb-4" />
            <p className="text-lg font-bold text-slate-400">
              {search ? "No patients found" : "No patients registered yet"}
            </p>
          </div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4 px-2">ID</th>
                <th className="pb-4 px-4">Patient Name</th>
                <th className="pb-4 px-4">Age / Gender</th>
                <th className="pb-4 px-4">Parent</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr
                  key={p.childId}
                  className="group hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-4 px-2 rounded-l-2xl">
                    <span className="text-xs font-bold text-slate-300">
                      #{String(idx + 1 + page * 20).padStart(3, '0')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar seed={p.childName} variant="parent" size="md" />
                      <span className="font-bold text-slate-800">{p.childName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-bold text-slate-600">{p.ageMonths} months</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {p.gender === "MALE" ? "Male" : "Female"}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-500">
                    {p.parentName}
                  </td>
                  <td className="py-4 px-4">
                    <ClinicalBadge status={p.lastStatus} />
                  </td>
                  <td className="py-4 px-4 rounded-r-2xl text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => router.push(`/medic/patients/${p.childId}`)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-100 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </MedicShell>
  );
}
