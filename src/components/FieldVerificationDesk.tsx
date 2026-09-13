import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck, 
  UserCheck, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Application } from '../types/scholarship';
import { Avatar } from './Avatar';
import { INDIAN_ADMINISTRATIVE_DIVISIONS } from '../data/indianStates';

export interface FieldInspectionRecord {
  id: string;
  appId: string;
  applicationNumber: string;
  candidateName: string;
  community: string;
  district: string;
  state: string;
  dispatchReason: string;
  assignedAuthority: string;
  status: 'dispatched' | 'under_investigation' | 'verified_genuine' | 'flagged_adverse';
  dispatchedAt: string;
  reportDate?: string;
  inspectorRemarks?: string;
}

const INITIAL_FIELD_INSPECTIONS: FieldInspectionRecord[] = [
  {
    id: 'insp_101',
    appId: 'app_102',
    applicationNumber: 'NFST-2025-0813',
    candidateName: 'Jemimah Khasi',
    community: 'Khasi',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    dispatchReason: 'Name mismatch on ST certificate (Jemimah Lapang vs Jemimah Khasi); revenue seal confirmation requested.',
    assignedAuthority: 'District Tribal Welfare Officer (DTWO), Shillong',
    status: 'under_investigation',
    dispatchedAt: '2025-02-28',
  },
  {
    id: 'insp_102',
    appId: 'app_104',
    applicationNumber: 'NOS-2025-0442',
    candidateName: 'Birsa Dev Munda',
    community: 'Munda',
    district: 'Khunti',
    state: 'Jharkhand',
    dispatchReason: 'Agricultural landholding vs reported family income verification under Rule 4.1 ceiling.',
    assignedAuthority: 'Project Officer, Integrated Tribal Development Agency (ITDA), Khunti',
    status: 'dispatched',
    dispatchedAt: '2025-03-01',
  },
  {
    id: 'insp_103',
    appId: 'app_105',
    applicationNumber: 'NFST-2025-0919',
    candidateName: 'Arjun Bhil',
    community: 'Bhil',
    district: 'Banswara',
    state: 'Rajasthan',
    dispatchReason: 'Physical verification of Particularly Vulnerable Tribal Group (PVTG) affirmative status.',
    assignedAuthority: 'Sub-Divisional Magistrate (SDM), Banswara',
    status: 'verified_genuine',
    dispatchedAt: '2025-02-15',
    reportDate: '2025-02-25',
    inspectorRemarks: 'Tehsildar physically inspected revenue records and affirmed genuine lineage and domicile.',
  },
];

interface FieldVerificationDeskProps {
  applications: Application[];
  onOpenApplication: (app: Application) => void;
  onToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const FieldVerificationDesk: React.FC<FieldVerificationDeskProps> = ({
  applications,
  onOpenApplication,
  onToast,
}) => {
  const [inspections, setInspections] = useState<FieldInspectionRecord[]>(INITIAL_FIELD_INSPECTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  
  // New dispatch form state
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [dispatchReason, setDispatchReason] = useState('Cross-verification of ST caste certificate validity and local revenue authority seal.');
  const [assignedDistrictOffice, setAssignedDistrictOffice] = useState('Integrated Tribal Development Agency (ITDA) Project Office');

  const filteredInspections = inspections.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesState =
      stateFilter === 'ALL' || item.state.toLowerCase() === stateFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesState;
  });

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetApp = applications.find((a) => a.id === selectedAppId);
    if (!targetApp) return;

    const newInspection: FieldInspectionRecord = {
      id: `insp_${Date.now()}`,
      appId: targetApp.id,
      applicationNumber: targetApp.applicationNumber,
      candidateName: targetApp.applicant.fullName,
      community: targetApp.applicant.stCommunity,
      district: targetApp.applicant.district || 'Scheduled District',
      state: targetApp.applicant.state || 'Tribal State',
      dispatchReason: dispatchReason.trim(),
      assignedAuthority: `${assignedDistrictOffice}, ${targetApp.applicant.district}`,
      status: 'dispatched',
      dispatchedAt: new Date().toISOString().split('T')[0],
    };

    setInspections([newInspection, ...inspections]);
    setIsDispatchModalOpen(false);
    onToast(
      'success',
      'Field Inspection Order Dispatched',
      `Official order transmitted to ${assignedDistrictOffice} for candidate ${targetApp.applicant.fullName}.`
    );
  };

  const handleUpdateInspectionStatus = (id: string, newStatus: 'verified_genuine' | 'flagged_adverse') => {
    setInspections((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status: newStatus,
          reportDate: new Date().toISOString().split('T')[0],
          inspectorRemarks: newStatus === 'verified_genuine'
            ? 'District Officer conducted field visit; domicile and caste records certified authentic.'
            : 'Adverse report recorded by District Vigilance Officer; discrepancy confirmed on physical check.',
        };
      })
    );

    onToast(
      newStatus === 'verified_genuine' ? 'success' : 'warning',
      newStatus === 'verified_genuine' ? 'Field Verification Cleared' : 'Adverse Field Finding Logged',
      `Inspection status updated for candidate file.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: District Field Verification Authority */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>MoTA On-Ground Vigilance & District Liaison Network</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              <span>District Field & Physical Verification Desk</span>
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Dispatch physical inquiries to Integrated Tribal Development Agencies (ITDAs) and District Tribal Welfare Officers (DTWOs) across Scheduled Areas for suspect certificates or lineage verification.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch New Field Inspection</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search district, candidate, or authority..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="dispatched">Dispatched to District</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="verified_genuine">Verified Genuine</option>
            <option value="flagged_adverse">Adverse Finding</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white cursor-pointer"
            title="Filter by State / UT"
          >
            <option value="ALL">All States / UTs (36)</option>
            {INDIAN_ADMINISTRATIVE_DIVISIONS.map((div) => (
              <optgroup key={div.group} label={div.group}>
                {div.items.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Field Inspection Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">District Field Inspection Orders</h3>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {filteredInspections.length} Active Orders
            </span>
          </div>
          <span className="text-xs text-slate-400">ITDA & District Welfare Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Candidate / District</th>
                <th className="py-3 px-4">Dispatched Authority</th>
                <th className="py-3 px-4">Verification Reason</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Dispatch Date</th>
                <th className="py-3 px-5 text-right">Scrutinizer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInspections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-900 block">{item.candidateName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.applicationNumber} • {item.district}, {item.state}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      {item.assignedAuthority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {item.dispatchReason}
                    </p>
                    {item.inspectorRemarks && (
                      <p className="text-[10px] font-medium text-emerald-800 bg-emerald-50 p-1 rounded mt-1">
                        Report: {item.inspectorRemarks}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.status === 'dispatched' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <Clock className="w-3 h-3" /> Dispatched
                      </span>
                    )}
                    {item.status === 'under_investigation' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" /> In Field Inquiry
                      </span>
                    )}
                    {item.status === 'verified_genuine' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Certified Genuine
                      </span>
                    )}
                    {item.status === 'flagged_adverse' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Adverse Finding
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {item.dispatchedAt}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'verified_genuine' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateInspectionStatus(item.id, 'verified_genuine')}
                          className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition cursor-pointer"
                          title="Record Genuine Verification from District Report"
                        >
                          Mark Genuine
                        </button>
                      )}
                      {item.status !== 'flagged_adverse' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateInspectionStatus(item.id, 'flagged_adverse')}
                          className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                          title="Record Adverse Finding from District Report"
                        >
                          Mark Adverse
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">Dispatch District Field Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate File:</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicant.fullName} ({app.applicationNumber} • {app.applicant.district}, {app.applicant.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned District Welfare Authority:</label>
                <select
                  value={assignedDistrictOffice}
                  onChange={(e) => setAssignedDistrictOffice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                >
                  <option value="Integrated Tribal Development Agency (ITDA) Project Office">
                    Integrated Tribal Development Agency (ITDA) Project Office
                  </option>
                  <option value="District Tribal Welfare Officer (DTWO)">
                    District Tribal Welfare Officer (DTWO)
                  </option>
                  <option value="Sub-Divisional Magistrate (SDM) / Revenue Tehsildar">
                    Sub-Divisional Magistrate (SDM) / Revenue Tehsildar
                  </option>
                  <option value="State Tribal Research Institute (TRI) Verification Cell">
                    State Tribal Research Institute (TRI) Verification Cell
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Field Inquiry:</label>
                <textarea
                  rows={3}
                  value={dispatchReason}
                  onChange={(e) => setDispatchReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  placeholder="Specify discrepancies in certificate, landholding, or domicile..."
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  The field inspection request will be formally routed to the State Tribal Department and District Collectorate with statutory priority.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
