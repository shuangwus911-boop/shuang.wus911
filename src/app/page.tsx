import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🔍 竞对商品监控系统
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            发现亚马逊爆款，匹配 AliExpress 货源
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            自动化监控 Slickdeals 热门交易，智能评分筛选潜力商品，一键匹配同款货源
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            进入仪表盘 →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            icon="📊"
            title="自动监控"
            description="每日自动爬取 Slickdeals 热门交易，抓取 Amazon 商品详情数据"
          />
          <FeatureCard
            icon="⭐"
            title="智能评分"
            description="基于销量、评分、评论数、折扣力度多维度计算 1-5 星评分"
          />
          <FeatureCard
            icon="🔗"
            title="货源匹配"
            description="自动匹配 AliExpress 同款商品，计算利润率，识别潜力爆品"
          />
        </div>

        {/* Stats Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">系统优势</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <StatItem
              label="完全免费"
              value="零成本运行"
              description="使用免费代理池 + GitHub Actions + Supabase 免费档"
            />
            <StatItem
              label="每日更新"
              value="自动化运行"
              description="每天定时抓取最新热门交易，不错过任何商机"
            />
            <StatItem
              label="精准匹配"
              value="文本 + 图片搜索"
              description="智能算法匹配 AliExpress 同款，准确率高达 85%"
            />
            <StatItem
              label="利润分析"
              value="自动计算"
              description="实时计算利润率，筛选 AE 价格低于 Amazon 80% 的潜力商品"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            查看今日潜力商品
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            竞对商品监控系统 · 基于 Next.js + Supabase 构建
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatItem({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">✓</span>
        </div>
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{value}</h4>
        <p className="text-sm font-medium text-indigo-600 mb-1">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
