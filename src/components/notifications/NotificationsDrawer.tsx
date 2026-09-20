import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  IndianRupee,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string, filter?: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useStore();

  const handleActionClick = async (notifId: string, tab?: string, refId?: string) => {
    await markNotificationRead(notifId);
    onClose();
    if (tab) {
      onNavigateTab(tab, refId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Operational Alerts"
      subtitle={`${unreadNotifCount} unread actionable notices`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {unreadNotifCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No notifications at the moment. All caught up!
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  notif.isRead
                    ? 'bg-white border-slate-200/80 text-slate-600 opacity-80'
                    : 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'NEW_ORDER'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.type === 'LOW_STOCK' || notif.type === 'OUT_OF_STOCK'
                          ? 'bg-rose-100 text-rose-700'
                          : notif.type === 'PAYOUT_RELEASED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notif.type === 'NEW_ORDER' && <ShoppingBag className="w-4 h-4" />}
                      {(notif.type === 'LOW_STOCK' || notif.type === 'OUT_OF_STOCK') && <AlertTriangle className="w-4 h-4" />}
                      {notif.type === 'PAYOUT_RELEASED' && <IndianRupee className="w-4 h-4" />}
                      {notif.type === 'STORE_STATUS' && <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-sm font-bold text-slate-900 leading-snug">
                          {notif.title}
                        </h5>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.context && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Context: {notif.context}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                        {notif.timestamp}
                      </p>
                    </div>
                  </div>

                  {notif.actionLabel && (
                    <button
                      onClick={() => handleActionClick(notif.id, notif.actionTab, notif.referenceId)}
                      className="shrink-0 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span>{notif.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
