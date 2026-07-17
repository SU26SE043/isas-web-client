import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PaymentOrderDetailDialog } from '../components/PaymentOrderDetailDialog';
import type { PaymentOrderDetail, PaymentOrderStatusResult } from '../types/payment.types';

const PREVIEW_ORDER: PaymentOrderDetail = {
  orderId: '2ffbee49-8c3a-4d1e-9f2b-1a7c6e5d4b30',
  packageId: 'pkg-sandbox',
  packageName: 'Sandbox 1 credit',
  status: 'Pending',
  paymentStatus: 'Pending',
  priceVnd: 2000,
  interviewCredits: 1,
  createdAt: '2026-07-16T11:34:00.000Z',
};

const PREVIEW_STATUS: PaymentOrderStatusResult = {
  orderCode: 1752656040000,
  status: 'Pending',
  paidAt: null,
};

/** DEV-only visual harness for the enlarged order detail dialog. */
export function OrderDetailUiPreviewPage() {
  const [open, setOpen] = useState(true);

  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-base p-6">
      <PaymentOrderDetailDialog
        open={open}
        order={PREVIEW_ORDER}
        statusResult={PREVIEW_STATUS}
        isStatusLoading={false}
        isCanceling={false}
        isProceeding={false}
        onOpenChange={setOpen}
        onRefreshStatus={() => undefined}
        onCancelOrder={() => undefined}
        onProceedPayment={() => undefined}
      />
      {!open ? (
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          Open preview
        </button>
      ) : null}
    </div>
  );
}
