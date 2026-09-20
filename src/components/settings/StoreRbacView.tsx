import React, { useState, useEffect } from 'react';
import { useAuth, PERMISSION_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS } from '../../context/AuthContext';
import { UserRole, PermissionKey, StoreStaffMember } from '../../types/seller';
import {
  Users,
  Shield,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Phone,
  Mail,
  RotateCcw,
  Check,
  User,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export const StoreRbacView: React.FC = () => {
  const {
    currentUser,
    staffMembers,
    rolePermissions,
    isOwner,
    assignStaffRole,
    updateRolePermissions,
    updateStaffCustomPermissions,
    addStaffMember,
    removeStaffMember,
    toggleStaffStatus,
    switchUser,
  } = useAuth();
  const { showToast } = useToast();

  // Selected role for permissions matrix
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<UserRole>('STORE_MANAGER');

  // Modal for adding staff
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('STAFF_PACKER');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Modal for removing staff
  const [staffToRemove, setStaffToRemove] = useState<StoreStaffMember | null>(null);

  // Modal for custom per-staff permissions
  const [staffForCustomAccess, setStaffForCustomAccess] = useState<StoreStaffMember | null>(null);
  const [tempCustomPermissions, setTempCustomPermissions] = useState<PermissionKey[]>([]);

  useEffect(() => {
    if (staffForCustomAccess) {
      const activePerms =
        staffForCustomAccess.customPermissions ||
        rolePermissions[staffForCustomAccess.role] ||
        DEFAULT_ROLE_PERMISSIONS[staffForCustomAccess.role] ||
        [];
      setTempCustomPermissions(activePerms);
    }
  }, [staffForCustomAccess, rolePermissions]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast('Permission Denied', 'Only Store Owner can add new staff.', 'error');
      return;
    }
    if (!newStaffName.trim() || !newStaffPhone.trim() || !newStaffEmail.trim()) {
      showToast('Incomplete Form', 'Please provide full name, contact phone, and official email address.', 'warning');
      return;
    }

    setIsSubmittingStaff(true);
    const success = addStaffMember({
      name: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      status: 'ACTIVE',
    });

    setIsSubmittingStaff(false);
    if (success) {
      setIsAddStaffOpen(false);
      setNewStaffName('');
      setNewStaffPhone('');
      setNewStaffEmail('');
      setNewStaffRole('STAFF_PACKER');
    }
  };

  const handleConfirmRemove = () => {
    if (!staffToRemove) return;
    removeStaffMember(staffToRemove.id);
    setStaffToRemove(null);
  };

  const handleTogglePermission = (role: UserRole, permissionKey: PermissionKey) => {
    if (!isOwner) {
      showToast('Permission Denied', 'Only the Primary Store Owner can modify role responsibilities.', 'error');
      return;
    }

    if (role === 'STORE_OWNER') {
      showToast('Locked', 'Store Owner possesses full root administrative privileges.', 'info');
      return;
    }

    const currentList = rolePermissions[role] || [];
    let updated: PermissionKey[];
    if (currentList.includes(permissionKey)) {
      updated = currentList.filter(k => k !== permissionKey);
    } else {
      updated = [...currentList, permissionKey];
    }

    updateRolePermissions(role, updated);
  };

  const handleResetDefaults = (role: UserRole) => {
    if (!isOwner) {
      showToast('Permission Denied', 'Only the Primary Store Owner can reset permissions.', 'error');
      return;
    }
    updateRolePermissions(role, DEFAULT_ROLE_PERMISSIONS[role]);
    showToast('Permissions Reset', `Reset ${role.replace('_', ' ')} to platform defaults.`, 'info');
  };

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'STORE_OWNER':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Store Owner
          </span>
        );
      case 'STORE_MANAGER':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Store Manager
          </span>
        );
      case 'STAFF_PACKER':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Staff Packer
          </span>
        );
    }
  };

  const categories = ['Orders & Dispatch', 'Inventory & Pricing', 'Finance & Payouts', 'Store Admin & Security'] as const;

  return (
    <div className="space-y-5">
      {/* 1. SLIM ACTOR & ROLE PREVIEW STRIP (matching HomeOverview status strip) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-900">
            Role-Based Access Control
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {currentUser.name}
          </span>
          {roleBadge(currentUser.role)}
          {!isOwner && (
            <span className="text-[11px] text-amber-700 font-medium">
              (Read-only mode. Store Owner required to modify roles)
            </span>
          )}
        </div>

        {/* Persona Switcher for demonstration/testing */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs text-slate-500 font-medium">Operating As:</span>
          <select
            value={currentUser.id}
            onChange={e => switchUser(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
          >
            {staffMembers.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role === 'STORE_OWNER' ? 'Owner' : m.role === 'STORE_MANAGER' ? 'Manager' : 'Packer'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. STORE STAFF & ROLE ASSIGNMENTS */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Store Staff Directory</h4>
              <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {staffMembers.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign roles and govern operational permissions across your physical store team.
            </p>
          </div>

          {isOwner && (
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddStaffOpen(true)}
            >
              Add Staff Member
            </Button>
          )}
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Member Name</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Role Assignment</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                {isOwner && <th className="py-3 px-4 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map(member => {
                const isSelf = member.id === currentUser.id;
                const isPrimaryOwner = member.role === 'STORE_OWNER';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Member */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{member.name}</span>
                            {isSelf && (
                              <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">Joined {member.joinedDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-medium text-slate-800 tabular-nums">{member.phone}</div>
                      {member.email && <div className="text-[11px] text-slate-500 mt-0.5">{member.email}</div>}
                    </td>

                    {/* Role Assignment */}
                    <td className="py-3 px-4">
                      {isOwner && !isPrimaryOwner ? (
                        <select
                          value={member.role}
                          onChange={e => assignStaffRole(member.id, e.target.value as UserRole)}
                          className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                        >
                          <option value="STORE_MANAGER">Store Manager</option>
                          <option value="STAFF_PACKER">Staff Packer</option>
                          <option value="STORE_OWNER">Store Owner</option>
                        </select>
                      ) : (
                        roleBadge(member.role)
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={!isOwner || isPrimaryOwner}
                        onClick={() =>
                          toggleStaffStatus(member.id, member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        } ${!isOwner || isPrimaryOwner ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                      >
                        {member.status}
                      </button>
                    </td>

                    {/* Actions */}
                    {isOwner && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPrimaryOwner && (
                            <button
                              type="button"
                              onClick={() => setStaffForCustomAccess(member)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Configure component access overrides for this employee"
                            >
                              <Sliders className="w-3 h-3 text-slate-600" />
                              <span>Access</span>
                              {member.customPermissions && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              )}
                            </button>
                          )}

                          {!isPrimaryOwner && (
                            <button
                              type="button"
                              onClick={() => setStaffToRemove(member)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove Staff Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. ROLE RESPONSIBILITIES & PERMISSIONS MATRIX */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Role Permissions Matrix</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              The Store Owner configures feature access and operational boundaries for each role.
            </p>
          </div>

          {isOwner && selectedRoleForMatrix !== 'STORE_OWNER' && (
            <button
              type="button"
              onClick={() => handleResetDefaults(selectedRoleForMatrix)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>

        {/* Role Filter Tabs matching project tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'STORE_MANAGER', label: 'Store Manager' },
            { id: 'STAFF_PACKER', label: 'Staff Packer' },
            { id: 'STORE_OWNER', label: 'Store Owner (Root)' },
          ].map(tab => {
            const isActive = selectedRoleForMatrix === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRoleForMatrix(tab.id as UserRole)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Explainer */}
        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
          {selectedRoleForMatrix === 'STORE_OWNER' &&
            'Primary proprietor with permanent root authority over bank settlements, tax credentials, and staff delegation.'}
          {selectedRoleForMatrix === 'STORE_MANAGER' &&
            'Floor supervisor managing inventory updates, cancellations, rider handovers, and returns disputes.'}
          {selectedRoleForMatrix === 'STAFF_PACKER' &&
            'Packaging associate responsible for scanning shelf barcodes, item picking, and sealing tamper-evident bags.'}
        </p>

        {/* Granular Permissions List - Clean dividers, no cards inside cards */}
        <div className="space-y-5 pt-1">
          {categories.map(cat => {
            const defs = PERMISSION_DEFINITIONS.filter(d => d.category === cat);
            const currentGranted = rolePermissions[selectedRoleForMatrix] || [];

            return (
              <div key={cat} className="space-y-1">
                <h5 className="text-xs font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  {cat}
                </h5>

                <div className="divide-y divide-slate-100">
                  {defs.map(def => {
                    const isGranted = currentGranted.includes(def.key);
                    const isOwnerOnly = def.ownerOnly;
                    const isDisabled =
                      !isOwner ||
                      selectedRoleForMatrix === 'STORE_OWNER' ||
                      Boolean(isOwnerOnly);

                    return (
                      <div
                        key={def.key}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{def.label}</span>
                            {isOwnerOnly && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                Owner Exclusive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{def.description}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isOwnerOnly && selectedRoleForMatrix !== 'STORE_OWNER' && (
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleTogglePermission(selectedRoleForMatrix, def.key)}
                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isGranted ? 'bg-emerald-700' : 'bg-slate-200'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            aria-label={`Toggle ${def.label}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                isGranted ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL: ADD STAFF MEMBER */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add Store Staff Member"
        subtitle="Authorize a team member to access order fulfillment and catalog tools"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Anand Gowda"
              value={newStaffName}
              onChange={e => setNewStaffName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (+91) *
              </label>
              <input
                type="text"
                placeholder="+91 98450 00000"
                value={newStaffPhone}
                onChange={e => setNewStaffPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                placeholder="staff@vhardware.in"
                value={newStaffEmail}
                onChange={e => setNewStaffEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Mandatory. An automated onboarding notification email will be sent asking them to create a password for daily login.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Store Role *
            </label>
            <select
              value={newStaffRole}
              onChange={e => setNewStaffRole(e.target.value as UserRole)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white shadow-2xs font-medium"
            >
              <option value="STAFF_PACKER">Staff Packer (Floor Runner &amp; Packaging)</option>
              <option value="STORE_MANAGER">Store Manager (Supervisory &amp; Operations)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddStaffOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingStaff}
            >
              Assign Role &amp; Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM REMOVE STAFF */}
      <Modal
        isOpen={!!staffToRemove}
        onClose={() => setStaffToRemove(null)}
        title="Remove Staff Member"
        subtitle="Revoke system access for this employee"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove <span className="font-semibold text-slate-900">{staffToRemove?.name}</span>?
            They will immediately lose access to this store’s order fulfillment dashboard.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStaffToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
            >
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CUSTOMIZE INDIVIDUAL STAFF ACCESS OVERRIDES */}
      <Modal
        isOpen={!!staffForCustomAccess}
        onClose={() => setStaffForCustomAccess(null)}
        title={`Component Access: ${staffForCustomAccess?.name || 'Staff'}`}
        subtitle={`Admin override for ${staffForCustomAccess?.email || 'employee'} (${staffForCustomAccess?.role.replace('_', ' ')})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Granular Admin Component Control</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Toggle component and tool permissions for this specific team member. Custom settings take priority over standard role defaults.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {categories.map(cat => {
              const categoryDefs = PERMISSION_DEFINITIONS.filter(d => d.category === cat);

              return (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{cat}</h5>
                  <div className="space-y-1.5">
                    {categoryDefs.map(def => {
                      const isGranted = tempCustomPermissions.includes(def.key);
                      const isOwnerOnly = def.ownerOnly;

                      return (
                        <div
                          key={def.key}
                          className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-slate-200/80"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900">{def.label}</span>
                            <p className="text-[11px] text-slate-500">{def.description}</p>
                          </div>

                          <button
                            type="button"
                            disabled={isOwnerOnly}
                            onClick={() => {
                              if (isGranted) {
                                setTempCustomPermissions(prev => prev.filter(k => k !== def.key));
                              } else {
                                setTempCustomPermissions(prev => [...prev, def.key]);
                              }
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isGranted ? 'bg-emerald-700' : 'bg-slate-200'
                            } ${isOwnerOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                isGranted ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (!staffForCustomAccess) return;
                updateStaffCustomPermissions(staffForCustomAccess.id, null);
                setStaffForCustomAccess(null);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-transparent transition-colors cursor-pointer"
            >
              Reset to Role Defaults
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStaffForCustomAccess(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!staffForCustomAccess) return;
                  updateStaffCustomPermissions(staffForCustomAccess.id, tempCustomPermissions);
                  setStaffForCustomAccess(null);
                }}
              >
                Save Custom Access
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
