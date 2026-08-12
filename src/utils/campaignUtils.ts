import { Product, SaleCampaign } from '../types';

export interface EffectivePricingResult {
  originalPrice: number;
  effectivePrice: number;
  isOnSale: boolean; // True ONLY if assigned to a currently active campaign
  isExpired: boolean; // True if product was marked on sale but campaign is past end date
  campaign: SaleCampaign | null;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  discountAmount: number;
  discountPercent: number; // e.g., 20 for 20%
}

/**
 * Validates whether a campaign is currently active based on its toggle status and date/time range.
 */
export function isCampaignActive(campaign: SaleCampaign | null | undefined, now = new Date()): boolean {
  if (!campaign) return false;
  
  // Manual admin active toggle
  if (campaign.isActive === false || campaign.status === 'Inactive') {
    return false;
  }

  // Time window validation
  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates live pricing for a product given all available campaigns.
 * Retains original price in database and automatically reverts when campaign expires.
 */
export function getProductEffectivePricing(
  product: Product,
  campaigns: SaleCampaign[] = [],
  now = new Date()
): EffectivePricingResult {
  const baseOriginalPrice = Math.max(0, Number(product.originalPrice || product.price || 0));

  let assignedCampaign: SaleCampaign | null = null;
  let isExplicitSale = Boolean(product.isOnSale);

  // 1. Direct campaign assignment via product.campaignId
  if (product.campaignId && Array.isArray(campaigns)) {
    const found = campaigns.find(c => c.id === product.campaignId);
    if (found) {
      assignedCampaign = found;
    }
  }

  // 2. Fallback: Target-based campaign assignment if product has no explicit campaignId but is marked on sale
  if (!assignedCampaign && product.isOnSale && Array.isArray(campaigns)) {
    assignedCampaign = campaigns.find(c => {
      if (!isCampaignActive(c, now)) return false;
      if (c.targetType === 'all') return true;
      if (c.targetType === 'category') {
        const prodCat = (product.category || '').toLowerCase();
        const targetCat = (c.targetValue || '').toLowerCase();
        return prodCat.includes(targetCat) || targetCat.includes(prodCat);
      }
      if (c.targetType === 'pieceType') {
        return (product.pieceType || '').toLowerCase() === (c.targetValue || '').toLowerCase();
      }
      if (c.targetType === 'year') {
        return String(product.year) === String(c.targetValue);
      }
      return false;
    }) || null;
  }

  // If no campaign found or product is not marked on sale
  if (!assignedCampaign || (!isExplicitSale && !product.campaignId)) {
    return {
      originalPrice: baseOriginalPrice,
      effectivePrice: baseOriginalPrice,
      isOnSale: false,
      isExpired: false,
      campaign: null,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      discountPercent: 0
    };
  }

  // Check if assigned campaign is currently active
  const active = isCampaignActive(assignedCampaign, now);

  if (!active) {
    // Campaign has expired or is inactive -> product automatically reverts to normal original price!
    return {
      originalPrice: baseOriginalPrice,
      effectivePrice: baseOriginalPrice,
      isOnSale: false,
      isExpired: true,
      campaign: assignedCampaign,
      discountType: assignedCampaign.discountType || 'percentage',
      discountValue: Number(assignedCampaign.discountValue ?? assignedCampaign.discountPercentage ?? 0),
      discountAmount: 0,
      discountPercent: 0
    };
  }

  // Calculate discount
  const type = assignedCampaign.discountType || 'percentage';
  const val = Number(assignedCampaign.discountValue ?? assignedCampaign.discountPercentage ?? 0);

  let discountAmount = 0;
  if (type === 'percentage') {
    discountAmount = Math.round(baseOriginalPrice * (val / 100));
  } else {
    // Fixed amount
    discountAmount = val;
  }

  // Prevent price from becoming negative or zero
  let calculatedSalePrice = Math.max(1, baseOriginalPrice - discountAmount);
  discountAmount = baseOriginalPrice - calculatedSalePrice;

  const discountPercent = baseOriginalPrice > 0
    ? Math.round((discountAmount / baseOriginalPrice) * 100)
    : 0;

  return {
    originalPrice: baseOriginalPrice,
    effectivePrice: calculatedSalePrice,
    isOnSale: true,
    isExpired: false,
    campaign: assignedCampaign,
    discountType: type,
    discountValue: val,
    discountAmount,
    discountPercent
  };
}

/**
 * Calculates price preview for admin forms.
 */
export function calculateCampaignPricePreview(originalPrice: number, campaign: Partial<SaleCampaign>) {
  const basePrice = Math.max(0, Number(originalPrice || 0));
  const type = campaign.discountType || 'percentage';
  const val = Number(campaign.discountValue ?? campaign.discountPercentage ?? 0);

  let discountAmount = 0;
  if (type === 'percentage') {
    discountAmount = Math.round(basePrice * (val / 100));
  } else {
    discountAmount = val;
  }

  const salePrice = Math.max(1, basePrice - discountAmount);
  const actualDiscountAmount = basePrice - salePrice;
  const discountPercent = basePrice > 0 ? Math.round((actualDiscountAmount / basePrice) * 100) : 0;

  return {
    originalPrice: basePrice,
    salePrice,
    discountAmount: actualDiscountAmount,
    discountPercent
  };
}
