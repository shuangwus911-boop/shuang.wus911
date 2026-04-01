interface ProductData {
  rating: number;
  reviewCount: number;
  bsrRank: number;
  bsrCategory?: string;
  price: number;
  originalPrice?: number;
}

/**
 * 计算商品评分 (1-5 星)
 * 
 * 评分维度：
 * - 用户评分 (30%): 直接反映产品质量
 * - 评论数量 (25%): 反映市场热度
 * - BSR 排名 (30%): 反映销量表现
 * - 折扣力度 (15%): 反映促销机会
 */
export function calculateProductScore(product: ProductData): number {
  // 1. 用户评分得分 (0-5 分)
  const ratingScore = Math.min(5, product.rating);

  // 2. 评论数得分 (对数增长，避免头部效应)
  // log10(1)=0, log10(10)=1, log10(100)=2, log10(1000)=3, log10(10000)=4
  const reviewScore = Math.min(5, Math.log10(product.reviewCount + 1) * 1.5);

  // 3. BSR 得分 (类目归一化)
  // 假设 Top 1000 为优秀，Top 10000 为良好
  const bsrScore = calculateBSRScore(product.bsrRank, product.bsrCategory);

  // 4. 折扣力度得分
  const discountRate = product.originalPrice && product.originalPrice > product.price
    ? (product.originalPrice - product.price) / product.originalPrice
    : 0;
  const discountScore = Math.min(5, discountRate * 10); // 50% 折扣=5 分

  // 权重配置
  const weights = {
    rating: 0.30,
    reviews: 0.25,
    bsr: 0.30,
    discount: 0.15
  };

  // 加权总分
  const totalScore = 
    ratingScore * weights.rating +
    reviewScore * weights.reviews +
    bsrScore * weights.bsr +
    discountScore * weights.discount;

  // 确保在 1-5 范围内，保留 2 位小数
  return Math.round(Math.min(5, Math.max(1, totalScore)) * 100) / 100;
}

/**
 * 根据 BSR 排名计算得分
 * 不同类目的 BSR 标准不同，这里使用通用算法
 */
function calculateBSRScore(bsrRank: number, category?: string): number {
  if (!bsrRank || bsrRank <= 0) return 2.5; // 无数据时给平均分

  // 类目系数（可选优化点）
  const categoryCoefficients: Record<string, number> = {
    'Home & Kitchen': 1.2,
    'Beauty & Personal Care': 1.1,
    'Electronics': 0.9,
    'Toys & Games': 1.0,
    'Sports & Outdoors': 1.0
  };

  const coeff = category ? (categoryCoefficients[category] || 1.0) : 1.0;
  const adjustedRank = bsrRank * coeff;

  // BSR 得分计算（指数衰减）
  // Top 100 = 5 分，Top 1000 = 4 分，Top 10000 = 3 分，Top 100000 = 2 分
  if (adjustedRank <= 100) return 5;
  if (adjustedRank <= 1000) return 5 - (adjustedRank - 100) / 900; // 4-5 分
  if (adjustedRank <= 10000) return 4 - (adjustedRank - 1000) / 9000; // 3-4 分
  if (adjustedRank <= 100000) return 3 - (adjustedRank - 10000) / 90000; // 2-3 分
  return Math.max(1, 2 - Math.log10(adjustedRank / 100000)); // 1-2 分
}

/**
 * 判断是否为潜力商品（3 星以上）
 */
export function isPotentialProduct(score: number): boolean {
  return score >= 3.0;
}

/**
 * 计算利润率
 */
export function calculateProfitMargin(amazonPrice: number, aePrice: number): number {
  if (amazonPrice <= 0) return 0;
  return Math.round(((amazonPrice - aePrice) / amazonPrice) * 100 * 100) / 100;
}
