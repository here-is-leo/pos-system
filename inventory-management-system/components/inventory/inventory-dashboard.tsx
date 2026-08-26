// components/inventory/inventory-dashboard.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus } from 'lucide-react';
import InventoryStats from './inventory-stats';
import InventoryCard from './inventory-card';
import AddStockModal from './add-stock-modal';
import InventorySearch from './inventory-search';
import InventoryHeader from './inventory-header';
import { getInventoryItems, InventoryItem } from '@/lib/inventory';
import { normalize } from '@/lib/utils';

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [userName, setUserName] = useState('انباردار');
  const router = useRouter();

  // 🔥 بررسی احراز هویت
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('🔍 بررسی داشبورد:', { token: !!token, userStr: !!userStr });

    if (!token || !userStr) {
      console.log('❌ بدون توکن در داشبورد، هدایت به لاگین');
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('👤 کاربر در داشبورد:', user);

      if (user.role !== 'warehouse' && user.role !== 'admin') {
        console.log('❌ نقش مجاز نیست در داشبورد:', user.role);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      setUserName(user.fullName || 'انباردار');
      console.log('✅ کاربر مجاز در داشبورد');
    } catch (error) {
      console.error('❌ خطا در خواندن کاربر:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router]);

  // بارگذاری داده‌ها
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getInventoryItems();
        setItems(data);
      } catch (error) {
        console.error('خطا در بارگذاری:', error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const normalizedSearch = normalize(searchQuery);
    return items.filter(
      (item) =>
        normalize(item.product.name).includes(normalizedSearch) ||
        (item.product.barcode && normalize(item.product.barcode).includes(normalizedSearch))
    );
  }, [items, searchQuery]);

  const stats = {
    total: items.length,
    inStock: items.filter((i) => i.quantity > 10).length,
    lowStock: items.filter((i) => i.quantity > 0 && i.quantity <= 10).length,
    outOfStock: items.filter((i) => i.quantity === 0).length,
  };

  const handleGlobalAddStock = () => {
    let targetProduct: InventoryItem | undefined;
    if (pendingProductId !== null) {
      targetProduct = items.find((item) => item.product.id === pendingProductId);
    }
    if (!targetProduct) {
      targetProduct = filteredItems[0] || items[0];
    }
    if (targetProduct) {
      setSelectedProduct(targetProduct);
      setIsModalOpen(true);
      setPendingProductId(null);
    }
  };

  const handleAddStock = (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleStockAdded = (newQuantity: number) => {
    if (selectedProduct) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedProduct.id ? { ...item, quantity: item.quantity + newQuantity } : item
        )
      );
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
    setPendingProductId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9]" dir="rtl">
      <InventoryHeader userName={userName} itemCount={filteredItems.length} />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <InventoryStats stats={stats} />

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <InventorySearch onSearch={setSearchQuery} />

          <button
            onClick={() => {
              setPendingProductId(filteredItems[0]?.product.id || items[0]?.product.id || null);
              handleGlobalAddStock();
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            افزودن موجودی
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>هیچ محصولی یافت نشد</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <InventoryCard key={item.id} item={item} onAddStock={() => handleAddStock(item)} />
            ))
          )}
        </div>
      </main>

      {/* FAB برای موبایل */}
      <button
        onClick={() => {
          setPendingProductId(filteredItems[0]?.product.id || items[0]?.product.id || null);
          handleGlobalAddStock();
        }}
        className="fixed bottom-6 left-6 z-20 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {selectedProduct && (
        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            setPendingProductId(null);
          }}
          product={selectedProduct.product}
          currentStock={selectedProduct.quantity}
          onSuccess={handleStockAdded}
        />
      )}
    </div>
  );
}