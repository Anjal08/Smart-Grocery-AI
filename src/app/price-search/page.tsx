import PriceSearch from '@/components/PriceSearch';

export const metadata = {
  title: 'AI Price Search - SmartGrocery',
  description: 'Search and compare grocery prices instantly using AI.',
};

export default function PriceSearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
          Smart Market <span className="text-indigo-600">Auditor</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Enter any grocery item below. Our AI pricing engine will instantly scan Blinkit, Zepto, Flipkart Minutes, and local markets to find your best deal.
        </p>
      </div>
      
      <PriceSearch />
    </div>
  );
}