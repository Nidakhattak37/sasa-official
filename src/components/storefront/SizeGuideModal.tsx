import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#222] hover:bg-[#F5F1EC] rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-[#EAE4DC] pb-4">
          <div className="p-2.5 bg-[#F5F1EC] text-[#9E8055] rounded-full">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#222222]">
              Standard Women's Size Guide
            </h3>
            <p className="text-xs text-[#777777]">
              All measurements are in inches. Standard sizing for pret and stitched apparel.
            </p>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#222222] text-[#F5F1EC]">
                <th className="p-3 font-semibold uppercase tracking-wider rounded-tl">Size</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Chest</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Waist</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Hips</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Shirt Length</th>
                <th className="p-3 font-semibold uppercase tracking-wider rounded-tr">Trouser Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4DC] text-[#333333]">
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#222222]">XS (Extra Small)</td>
                <td className="p-3">34"</td>
                <td className="p-3">28"</td>
                <td className="p-3">37"</td>
                <td className="p-3">40" - 42"</td>
                <td className="p-3">37"</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#222222]">S (Small)</td>
                <td className="p-3">36"</td>
                <td className="p-3">30"</td>
                <td className="p-3">39"</td>
                <td className="p-3">40" - 42"</td>
                <td className="p-3">38"</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#222222]">M (Medium)</td>
                <td className="p-3">39"</td>
                <td className="p-3">33"</td>
                <td className="p-3">42"</td>
                <td className="p-3">42" - 44"</td>
                <td className="p-3">39"</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#222222]">L (Large)</td>
                <td className="p-3">42"</td>
                <td className="p-3">36"</td>
                <td className="p-3">45"</td>
                <td className="p-3">42" - 44"</td>
                <td className="p-3">40"</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3 font-bold text-[#222222]">XL (Extra Large)</td>
                <td className="p-3">45"</td>
                <td className="p-3">40"</td>
                <td className="p-3">48"</td>
                <td className="p-3">44" - 45"</td>
                <td className="p-3">40"</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="mt-6 p-4 bg-[#F5F1EC] rounded-lg text-xs text-[#555555] space-y-1">
          <h4 className="font-semibold text-[#222222] uppercase tracking-wider">
            Fitting Advice
          </h4>
          <p>
            If your measurements fall between two sizes, we recommend selecting the larger size for a comfortable, flattering fit and drape.
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#222222] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#9E8055] transition"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
