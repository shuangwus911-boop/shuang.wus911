'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  price: number;
  score: number;
  rating: number;
  review_count: number;
  bsr_rank: number;
  created_at: string;
}

interface AEMatch {
  id: string;
  amazon_product_id: string;
  ae_product_id: string;
  ae_title: string;
  ae_price: number;
  profit_margin: number;
  status: string;
}

interface PotentialProduct extends AmazonProduct {
  ae_matches?: AEMatch[];
}

export default function Dashboard() {
  const [products, setProducts] = useState<PotentialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    goodProducts: 0,
    totalMatches: 0,
    avgProfitMargin: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // 获取潜力商品（3-5 星）
      const { data: productsData, error } = await supabase
        .from('amazon_products')
        .select('*')
        .gte('score', 3.0)
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;

      // 获取 AE 匹配
      const productIds = productsData?.map(p => p.id) || [];
      let matches: AEMatch[] = [];
      
      if (productIds.length > 0) {
        const { data: matchesData } = await supabase
          .from('ae_matches')
          .select('*')
          .in('amazon_product_id', productIds)
          .eq('status', 'potential');
        
        matches = matchesData || [];
      }

      // 合并数据
      const merged = productsData?.map(product => ({
        ...product,
        ae_matches: matches.filter(m => m.amazon_product_id === product.id)
      })) || [];

      setProducts(merged);

      // 计算统计
      const { data: summary } = await supabase
        .from('daily_summary')
        .select('*')
        .limit(7);

      if (summary && summary.length > 0) {
        const latest = summary[0];
        setStats({
          totalProducts: latest.total_products || 0,
          goodProducts: latest.good_products || 0,
          totalMatches: latest.total_matches || 0,
          avgProfitMargin: parseFloat(latest.avg_profit_margin) || 0
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              📊 仪表盘
            </h1>
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="总商品数"
            value={stats.totalProducts}
            icon="📦"
            color="blue"
          />
          <StatCard
            label="潜力商品 (3-5 星)"
            value={stats.goodProducts}
            icon="⭐"
            color="green"
          />
          <StatCard
            label="AE 匹配数"
            value={stats.totalMatches}
            icon="🔗"
            color="purple"
          />
          <StatCard
            label="平均利润率"
            value={`${stats.avgProfitMargin.toFixed(1)}%`}
            icon="💰"
            color="yellow"
          />
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              潜力商品列表
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              显示评分 3 星以上的商品，包含 AliExpress 匹配结果
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无数据，请等待爬虫运行或手动触发任务
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: string | number; 
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: PotentialProduct }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              product.score >= 4.5 ? 'bg-green-100 text-green-700' :
              product.score >= 4.0 ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              ⭐ {product.score.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              ASIN: {product.asin}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.title}
          </h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            <span>评分：{product.rating}⭐</span>
            <span>评论：{product.review_count.toLocaleString()}</span>
            {product.bsr_rank > 0 && (
              <span>BSR: #{product.bsr_rank.toLocaleString()}</span>
            )}
          </div>

          {product.ae_matches && product.ae_matches.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                {expanded ? '收起' : `查看 ${product.ae_matches.length} 个匹配货源`} →
              </button>
            </div>
          )}
        </div>

        <div className="ml-4">
          <a
            href={`https://www.amazon.com/dp/${product.asin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            查看 Amazon
          </a>
        </div>
      </div>

      {/* AE Matches */}
      {expanded && product.ae_matches && product.ae_matches.length > 0 && (
        <div className="mt-4 ml-4 mr-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">AliExpress 匹配货源</h4>
          <div className="space-y-3">
            {product.ae_matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {match.ae_title || `AE Product ${match.ae_product_id}`}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="font-bold text-green-600">
                        ${match.ae_price.toFixed(2)}
                      </span>
                      <span className="text-green-600 font-semibold">
                        利润：{match.profit_margin?.toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        ID: {match.ae_product_id}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.aliexpress.com/item/${match.ae_product_id}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 inline-block bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    查看 AE
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
