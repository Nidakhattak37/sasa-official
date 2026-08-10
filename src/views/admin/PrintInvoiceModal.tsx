import React from 'react';
import { Order } from '../../types';
import { formatPrice } from '../../utils/currency';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface PrintInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Controls Bar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#222]">
            <Printer className="w-4 h-4 text-[#9E8055]" />
            <span>Official Invoice Preview — #{order.id}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#222] text-white text-xs font-semibold rounded hover:bg-[#9E8055] transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Canvas */}
        <div className="space-y-6 text-xs text-[#333] p-4 bg-white font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#222] pb-4">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-[#222]">SASA OFFICIAL</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#777] mt-0.5">Luxury Pakistani Fashion</p>
              <p className="text-[11px] text-gray-500 mt-2">M.M. Alam Road, Gulberg III, Lahore, Pakistan</p>
              <p className="text-[11px] text-gray-500">Helpline: +92 42 111 727 200 | info@sasaofficial.com</p>
            </div>

            <div className="text-right">
              <span className="text-xl font-bold text-[#9E8055] block">TAX INVOICE</span>
              <p className="font-semibold text-[#222]">Invoice No: #{order.id}</p>
              <p className="text-gray-500">Date: {order.createdAt}</p>
              <p className="text-gray-500">Tracking: {order.trackingCode}</p>
            </div>
          </div>

          {/* Customer & Shipping Specs */}
          <div className="grid grid-cols-2 gap-6 bg-[#FAFAFA] p-4 rounded border border-gray-200">
            <div>
              <strong className="block font-bold text-[#222] uppercase tracking-wider text-[10px] mb-1">Billed & Delivered To:</strong>
              <p className="font-semibold text-[#222] text-sm">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}, Pakistan</p>
              <p>Phone: {order.shippingAddress.phone}</p>
              <p>Email: {order.shippingAddress.email}</p>
            </div>

            <div className="text-right">
              <strong className="block font-bold text-[#222] uppercase tracking-wider text-[10px] mb-1">Payment & Order Info:</strong>
              <p>Payment Method: <strong className="text-[#222]">{order.paymentMethod}</strong></p>
              <p>Payment Status: <strong className="text-green-700">{order.paymentStatus}</strong></p>
              <p>Order Status: <strong className="text-[#9E8055]">{order.orderStatus}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-[#222] text-white text-[11px]">
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Color</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Unit Price</th>
                <th className="p-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[11px]">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-semibold text-[#222]">{item.productName}</td>
                  <td className="p-2.5">{item.selectedSize}</td>
                  <td className="p-2.5">{item.selectedColor}</td>
                  <td className="p-2.5 text-center">{item.quantity}</td>
                  <td className="p-2.5 text-right">{formatPrice(item.price)}</td>
                  <td className="p-2.5 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-between items-start pt-2">
            <div className="text-[10px] text-gray-500 max-w-xs space-y-1">
              <p><strong>Note:</strong> 14-Day Exchange policy applies on unworn items with original tags attached.</p>
              <p className="flex items-center gap-1 text-green-700 font-semibold"><ShieldCheck className="w-3 h-3" /> System Verified Digital Invoice</p>
            </div>

            <div className="w-64 space-y-1 text-right text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({order.couponCode}):</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#222] pt-2 border-t border-gray-300">
                <span>Total Amount:</span>
                <span className="text-[#9E8055]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
