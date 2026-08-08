"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminProductListPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    // Modals States
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [isViewBatchesModalOpen, setIsViewBatchesModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);

    // Excel Bulk Upload Preview
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    // 🌟 Preview တွင် အမြတ်ကို အစမ်းတွက်ကြည့်နိုင်ရန် State သစ်
    const [previewExchangeRate, setPreviewExchangeRate] = useState("6");

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);

    const [productForm, setProductForm] = useState({
        name: "", description: "", weightGram: "", currentPriceVND: "", sku: "", imageUrl: "", category: "",
        initialQuantity: "", originalPriceMMK: "", kiloRateMMK: "25000", expiryDate: "", modalExchangeRate: "6"
    });

    const [stockForm, setStockForm] = useState({
        initialQuantity: "", originalPriceMMK: "", kiloRateMMK: "25000",
        newSalePriceVND: "", arrivalDate: new Date().toISOString().split('T')[0], expiryDate: "", modalExchangeRate: "6"
    });

    const [editForm, setEditForm] = useState({
        name: "", description: "", weightGram: "", currentPriceVND: "", sku: "", imageUrl: "", category: ""
    });

    const [editBatchForm, setEditBatchForm] = useState({
        quantity: "", originalPriceMMK: "", kiloRateMMK: "", salePriceVND: "", expiryDate: "", modalExchangeRate: "6"
    });

    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get("/products");
            if (res.data.success) {
                setProducts(res.data.data);
                setSelectedProduct((prev: any) => {
                    if (!prev) return null;
                    return res.data.data.find((p: any) => p.id === prev.id) || prev;
                });
            }
        } catch (error) {
            toast.error("ပစ္စည်းစာရင်း ယူရာတွင် အမှားရှိပါသည်။");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // 🌟 Settings မှ default Kilo Rate ဆွဲယူ၍ form များတွင် ကြိုဖြည့်ရန်
    const [defaultKiloRate, setDefaultKiloRate] = useState("20000");
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/settings/all");
                const dk = res.data?.data?.DEFAULT_KILO_RATE;
                if (dk) {
                    setDefaultKiloRate(String(dk));
                    setProductForm((prev: any) => ({ ...prev, kiloRateMMK: String(dk) }));
                }
            } catch { /* setting မရှိရင် default 20000 */ }
        })();
    }, []);

    // 🌟 Bulk price update
    const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
    const [bulkPercent, setBulkPercent] = useState("");
    const [bulkCategory, setBulkCategory] = useState("");
    const [bulkSubmitting, setBulkSubmitting] = useState(false);

    const handleBulkPrice = async () => {
        const pct = Number(bulkPercent);
        if (!pct || isNaN(pct)) { toast.error("ရာခိုင်နှုန်း (ဥပမာ 5 သို့ -10) ထည့်ပါ"); return; }
        if (!confirm(`ပစ္စည်း${bulkCategory ? ` (${bulkCategory})` : "အားလုံး"}၏ ဈေးကို ${pct > 0 ? "+" : ""}${pct}% ချိန်ညှိမှာ သေချာပါသလား?`)) return;
        setBulkSubmitting(true);
        const toastId = toast.loading("ဈေးများ ချိန်ညှိနေသည်...");
        try {
            const res = await api.put(`/admin/inventory/products/bulk-price`, null, { params: { percent: pct, category: bulkCategory || undefined } });
            if (res.data.success) {
                toast.success(res.data.message || "ပြီးပါပြီ", { id: toastId });
                setIsBulkPriceOpen(false); setBulkPercent(""); setBulkCategory("");
                await fetchProducts();
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "မအောင်မြင်ပါ", { id: toastId });
        } finally { setBulkSubmitting(false); }
    };

    // 🌟 Dashboard ၏ "Stock ပြတ်လုနီးပါး" card မှ လာလျှင် (?lowstock=1) stock နည်းသော ပစ္စည်းများသာ ပြသည်
    const [lowStockOnly, setLowStockOnly] = useState(false);
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("lowstock") === "1") {
            setLowStockOnly(true);
        }
    }, []);

    const filteredProducts = products.filter((p: any) =>
        ((p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (!lowStockOnly || (p.totalStock ?? 0) <= 5)
    );

    const handleExcelUploadAndPreview = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading("Excel ဖိုင် ဖတ်နေပါသည်...");
        try {
            const res = await api.post("/admin/inventory/upload-preview", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setPreviewData(res.data.data);
                setIsPreviewModalOpen(true);
                toast.success("Preview အသင့်ဖြစ်ပါပြီ စစ်ဆေးပေးပါ", { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "ဖိုင်ဖတ်ရာတွင် အမှားရှိပါသည်", { id: toastId });
        }
        e.target.value = null;
    };

    // 🌟 Preview row ကို edit လုပ်ရန်
    const updatePreviewRow = (i: number, field: string, value: any) => {
        setPreviewData((prev: any[]) => prev.map((row, idx) => {
            if (idx !== i) return row;
            const updated = { ...row, [field]: value };
            // ရောင်းဈေး (currentPriceVND) နှင့် salePriceVND ကို sync
            if (field === "currentPriceVND") updated.salePriceVND = value;
            return updated;
        }));
    };

    const handleConfirmBulkSave = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading("ပစ္စည်းများ သိမ်းဆည်းနေပါသည်...");
        try {
            const res = await api.post("/admin/inventory/products/bulk", previewData);
            if (res.data.success) {
                toast.success("Excel မှ ပစ္စည်းများအားလုံး သိမ်းဆည်းပြီးပါပြီ", { id: toastId });
                setIsPreviewModalOpen(false);
                setPreviewData([]);
                await fetchProducts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "သိမ်းဆည်းရာတွင် အမှားရှိပါသည်", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (e: any, isEdit = false) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        const uploadToast = toast.loading("ပုံတင်နေပါသည်...");
        try {
            const res = await api.post("/admin/inventory/upload-image", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                if (isEdit) setEditForm((prev: any) => ({ ...prev, imageUrl: res.data.data }));
                else setProductForm((prev: any) => ({ ...prev, imageUrl: res.data.data }));
                toast.success("ပုံတင်ခြင်း အောင်မြင်ပါသည်။", { id: uploadToast });
            }
        } catch (error: any) {
            toast.error("ပုံတင်ရာတွင် အမှားရှိပါသည်။", { id: uploadToast });
        }
    };

    const handleCreateProduct = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post("/admin/inventory/products", {
                ...productForm, weightGram: Number(productForm.weightGram), currentPriceVND: Number(productForm.currentPriceVND),
                initialQuantity: Number(productForm.initialQuantity), originalPriceMMK: Number(productForm.originalPriceMMK), kiloRateMMK: Number(productForm.kiloRateMMK)
            });
            if (res.data.success) {
                toast.success("ပစ္စည်းနှင့် Stock သိမ်းဆည်းပြီးပါပြီ။");
                await fetchProducts();
                setIsAddProductModalOpen(false);
                setProductForm({ name: "", description: "", weightGram: "", currentPriceVND: "", sku: "", imageUrl: "", category: "", initialQuantity: "", originalPriceMMK: "", kiloRateMMK: defaultKiloRate, expiryDate: "", modalExchangeRate: "6" });
            }
        } catch (error: any) { toast.error("သိမ်းဆည်းရာတွင် အမှားရှိပါသည်။"); }
        finally { setIsSubmitting(false); }
    };

    const handleAddStock = async (e: any) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/admin/inventory/products/${selectedProduct.id}/batches`, {
                productId: selectedProduct.id, initialQuantity: Number(stockForm.initialQuantity),
                originalPriceMMK: Number(stockForm.originalPriceMMK), kiloRateMMK: Number(stockForm.kiloRateMMK),
                newSalePriceVND: Number(stockForm.newSalePriceVND) || selectedProduct.currentPriceVND,
                arrivalDate: stockForm.arrivalDate, expiryDate: stockForm.expiryDate || null
            });
            if (res.data.success) {
                toast.success("Stock ဖြည့်သွင်းပြီးပါပြီ။");
                await fetchProducts();
                setIsAddStockModalOpen(false);
            }
        } catch (error: any) { toast.error("အမှားရှိပါသည်။"); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdateProduct = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/admin/inventory/products/${selectedProduct.id}`, {
                ...editForm, weightGram: Number(editForm.weightGram), currentPriceVND: Number(editForm.currentPriceVND)
            });
            if (res.data.success) {
                toast.success("ပြင်ဆင်ပြီးပါပြီ။");
                await fetchProducts(); setIsEditProductModalOpen(false);
            }
        } catch (error: any) { toast.error("အမှားရှိပါသည်။"); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdateBatch = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put(`/admin/inventory/batches/${selectedBatch.id}`, {
                initialQuantity: Number(editBatchForm.quantity), originalPriceMMK: Number(editBatchForm.originalPriceMMK),
                kiloRateMMK: Number(editBatchForm.kiloRateMMK), newSalePriceVND: Number(editBatchForm.salePriceVND),
                expiryDate: editBatchForm.expiryDate || null
            });
            if (res.data.success) {
                toast.success("Batch ပြင်ဆင်ပြီးပါပြီ။");
                await fetchProducts(); setIsEditBatchModalOpen(false);
            }
        } catch (error: any) { toast.error("အမှားရှိပါသည်။"); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ဖျက်မည်မှာ သေချာပါသလား?")) return;
        try {
            const res = await api.delete(`/admin/inventory/products/${id}`);
            if (res.data.success) { toast.success("ဖျက်လိုက်ပါပြီ။"); await fetchProducts(); }
        } catch (error: any) { toast.error("ဖျက်ရာတွင် အမှားရှိပါသည်။"); }
    };

    const calculateLiveProfit = (original: any, kilo: any, sale: any, weight: any, rate: any) => {
        const netMMK = Number(original) + ((Number(weight) / 1000) * Number(kilo));
        return Number(sale) - (netMMK * Number(rate));
    };

    const openEditModal = (product: any) => {
        setSelectedProduct(product);
        setEditForm({ name: product.name, description: product.description, weightGram: product.weightGram, currentPriceVND: product.currentPriceVND, sku: product.sku, imageUrl: product.imageUrl, category: product.category || "" });
        setIsEditProductModalOpen(true);
    };

    const openEditBatchModal = (batch: any) => {
        setSelectedBatch(batch);
        setEditBatchForm({ quantity: batch.remainingQuantity, originalPriceMMK: batch.originalPriceMMK, kiloRateMMK: batch.kiloRateMMK, salePriceVND: batch.salePriceVND, expiryDate: batch.expiryDate || "", modalExchangeRate: "6" });
        setIsEditBatchModalOpen(true);
    };

    const getResolvedUrl = (url: string) => {
        if (!url) return "https://via.placeholder.com/150";
        if (url.startsWith("http")) return url;
        return `http://localhost:8080${url}`;
    };

    if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 font-myanmar">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-gray-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black border-l-4 border-yellow-400 pl-4 text-gray-900">ပစ္စည်းစာရင်း</h1>
                    <p className="text-sm text-gray-500 mt-2 pl-5">ပစ္စည်းအချက်အလက်များနှင့် Stock အဝင်အထွက်များကို စီမံပါ။</p>
                </div>
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                        <input
                            type="text" placeholder="အမည် (သို့) SKU ရှာရန်..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none transition-colors font-medium"
                        />
                    </div>
                    <label className="px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition-all cursor-pointer whitespace-nowrap">
                        + Excel ဖြင့်တင်မည်
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUploadAndPreview} />
                    </label>
                    <button onClick={() => setIsBulkPriceOpen(true)} className="px-5 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 border border-blue-200 transition-all whitespace-nowrap">
                        💱 ဈေး တစ်ပြိုင်နက်
                    </button>
                    <button onClick={() => { setProductForm((prev: any) => ({ ...prev, kiloRateMMK: defaultKiloRate })); setIsAddProductModalOpen(true); }} className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg transition-all whitespace-nowrap">
                        + တစ်ခုချင်းတင်မည်
                    </button>
                </div>
            </div>

            {/* 🌟 Low-stock filter ဖွင့်ထားကြောင်း ပြသော banner */}
            {lowStockOnly && (
                <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
                    <p className="text-sm font-bold text-red-600">📉 Stock ပြတ်လုနီးပါး (လက်ကျန် ၅ ခုနှင့်အောက်) ပစ္စည်းများသာ ပြနေသည် — {filteredProducts.length} မျိုး</p>
                    <button onClick={() => setLowStockOnly(false)} className="text-xs font-black text-red-500 hover:text-red-700 bg-white border border-red-200 rounded-lg px-3 py-1.5">
                        ✕ အားလုံးပြန်ပြ
                    </button>
                </div>
            )}

            {/* 🌟 Bulk Price Modal */}
            {isBulkPriceOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-black text-gray-900 mb-2">💱 ဈေး တစ်ပြိုင်နက် ချိန်ညှိ</h2>
                        <p className="text-sm text-gray-500 mb-6">ရောင်းဈေးများကို ရာခိုင်နှုန်းဖြင့် တစ်ပြိုင်နက် တိုး/လျှော့ (ငွေလဲနှုန်း ပြောင်းချိန် အသုံးဝင်)</p>

                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ရာခိုင်နှုန်း (%)</label>
                        <input type="number" value={bulkPercent} onChange={(e) => setBulkPercent(e.target.value)}
                            placeholder="ဥပမာ — 5 (တိုး) သို့ -10 (လျှော့)"
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 mb-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />

                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">အမျိုးအစား (optional — မထည့်ရင် အားလုံး)</label>
                        <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 mb-2 bg-white">
                            <option value="">— ပစ္စည်းအားလုံး —</option>
                            {Array.from(new Set(products.map((p: any) => p.category).filter((c: any) => c))).map((c: any) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {bulkPercent && !isNaN(Number(bulkPercent)) && (
                            <p className="text-xs text-gray-500 mb-4">ဥပမာ — 100,000 ₫ → <b className="text-blue-600">{Math.round(100000 * (1 + Number(bulkPercent) / 100)).toLocaleString()} ₫</b></p>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setIsBulkPriceOpen(false)} disabled={bulkSubmitting} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">မလုပ်တော့ပါ</button>
                            <button onClick={handleBulkPrice} disabled={bulkSubmitting} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50">
                                {bulkSubmitting ? "ချိန်ညှိနေသည်..." : "ချိန်ညှိမည်"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-gray-100">
                    <tr>
                        <th className="p-5 pl-6">ပစ္စည်းအချက်အလက်</th>
                        <th className="p-5">SKU / အလေးချိန်</th>
                        <th className="p-5">လက်ရှိ ရောင်းဈေး</th>
                        <th className="p-5 text-center">လက်ကျန် (Stock)</th>
                        <th className="p-5 pr-6 text-right">လုပ်ဆောင်ချက်</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-5 pl-6 flex items-center space-x-4">
                                <img src={getResolvedUrl(p.imageUrl)} alt={p.name || "Product Image"} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                <p className="font-bold text-gray-900 text-base">{p.name}</p>
                            </td>
                            <td className="p-5">
                                <p className="font-medium text-gray-600 text-sm">{p.sku}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{p.weightGram} g</p>
                            </td>
                            <td className="p-5 font-black text-blue-600 text-lg">{Number(p.currentPriceVND).toLocaleString()} ₫</td>
                            <td className="p-5 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black ${p.totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.totalStock} ခု</span>
                            </td>
                            <td className="p-5 pr-6 text-right space-x-2">
                                <button onClick={() => { setSelectedProduct(p); setIsViewBatchesModalOpen(true); }} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors" title="Batches စာရင်း">📋</button>
                                <button onClick={() => { setSelectedProduct(p); setStockForm((prev: any) => ({ ...prev, kiloRateMMK: defaultKiloRate })); setIsAddStockModalOpen(true); }} className="px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-600 hover:text-white transition-colors border border-green-100 text-sm">+ Add Stock</button>
                                <button onClick={() => openEditModal(p)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors" title="ပြင်ဆင်မည်">✏️</button>
                                <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors" title="ဖျက်မည်">🗑️</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-10 text-center text-gray-500 font-bold">ရှာဖွေထားသော ပစ္စည်း မရှိပါ 😢</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 🌟 0. Excel Preview Modal (အမြတ်ကော်လံ အသစ်ပါဝင်သည်) */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-7xl w-full shadow-2xl max-h-[90vh] flex flex-col relative border-t-8 border-green-500">
                        <button onClick={() => { setIsPreviewModalOpen(false); setPreviewData([]); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Excel မှတ်တမ်းများကို စစ်ဆေးပါ (Preview)</h2>
                                <p className="text-gray-500 text-sm">✏️ <b>အကွက်များကို တိုက်ရိုက် ပြင်နိုင်ပါသည်</b> (အမည်၊ ဈေး၊ အရေအတွက်...)။ ငွေလဲနှုန်းကို အရင်း (MMK→VND) ပြောင်း၍ အမြတ်ကြည့်ရန်သာ သုံးသည်။</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center space-x-3">
                                <label className="text-xs font-bold text-gray-500">Rate (1 MMK = ? VND)</label>
                                <input type="number" step="0.01" value={previewExchangeRate} onChange={e => setPreviewExchangeRate(e.target.value)} className="w-24 p-2 rounded-lg border bg-white font-black text-blue-600 outline-none text-center" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto border border-gray-100 rounded-xl mb-6 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="p-3">အမည်</th>
                                    <th className="p-3">အလေးချိန်</th>
                                    <th className="p-3 text-right">ဝယ်ဈေး<br/>(MMK)</th>
                                    <th className="p-3 text-right">Kilo Rate<br/>(MMK)</th>
                                    <th className="p-3 text-right bg-orange-50 text-orange-700">စုစုပေါင်း အရင်း<br/>(MMK → VND)</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right bg-blue-50 text-blue-700">ရောင်းဈေး<br/>(VND)</th>
                                    <th className="p-3 text-right bg-yellow-50 text-gray-900">အမြတ်/ခု<br/>(VND)</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {previewData.map((d: any, i: number) => {
                                    const rate = Number(previewExchangeRate) || 0;
                                    const origMMK = Number(d.originalPriceMMK) || 0;
                                    // သယ်ယူခ = အလေးချိန်(kg) × kilo rate
                                    const kiloCostMMK = ((Number(d.weightGram) || 0) / 1000) * (Number(d.kiloRateMMK) || 0);
                                    const totalCostMMK = origMMK + kiloCostMMK;
                                    const totalCostVND = totalCostMMK * rate;
                                    const salePrice = Number(d.currentPriceVND) || 0; // user ထည့်သော ရောင်းဈေး
                                    const profit = salePrice - totalCostVND;
                                    const cellInput = "w-full bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
                                    return (
                                        <tr key={i} className="hover:bg-green-50/30">
                                            <td className="p-2 font-bold text-gray-800 text-sm min-w-[130px]">
                                                <input value={d.name || ""} onChange={(e) => updatePreviewRow(i, "name", e.target.value)} className={cellInput} />
                                            </td>
                                            <td className="p-2 text-xs text-gray-600 w-16">
                                                <input type="number" value={d.weightGram ?? ""} onChange={(e) => updatePreviewRow(i, "weightGram", Number(e.target.value))} className={cellInput + " text-right"} />
                                            </td>
                                            <td className="p-2 text-xs text-gray-600 w-20">
                                                <input type="number" value={d.originalPriceMMK ?? ""} onChange={(e) => updatePreviewRow(i, "originalPriceMMK", Number(e.target.value))} className={cellInput + " text-right"} />
                                            </td>
                                            <td className="p-2 text-xs text-gray-600 w-20">
                                                <input type="number" value={d.kiloRateMMK ?? ""} onChange={(e) => updatePreviewRow(i, "kiloRateMMK", Number(e.target.value))} className={cellInput + " text-right"} />
                                            </td>
                                            <td className="p-3 text-right bg-orange-50/40">
                                                <p className="font-bold text-gray-800 text-sm">{Math.round(totalCostMMK).toLocaleString()} Ks</p>
                                                <p className="text-[11px] text-orange-600 font-bold">= {Math.round(totalCostVND).toLocaleString()} ₫</p>
                                            </td>
                                            <td className="p-2 text-center w-14">
                                                <input type="number" value={d.initialQuantity ?? ""} onChange={(e) => updatePreviewRow(i, "initialQuantity", Number(e.target.value))} className={cellInput + " text-center font-bold text-green-600"} />
                                            </td>
                                            <td className="p-2 text-right bg-blue-50/40 w-24">
                                                <input type="number" placeholder="ဈေးထည့်" value={d.currentPriceVND ?? ""} onChange={(e) => updatePreviewRow(i, "currentPriceVND", Number(e.target.value))} className={cellInput + " text-right font-black text-blue-600"} />
                                            </td>
                                            <td className={`p-3 text-right font-black text-sm bg-yellow-50/30 ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {profit > 0 ? '+' : ''}{Math.round(profit).toLocaleString()} ₫
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button disabled={isSubmitting} onClick={() => { setIsPreviewModalOpen(false); setPreviewData([]); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">မလုပ်တော့ပါ (Cancel)</button>
                            <button disabled={isSubmitting} onClick={handleConfirmBulkSave} className="px-8 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
                                {isSubmitting ? "သိမ်းဆည်းနေပါသည်..." : `အတည်ပြု၍ ပစ္စည်း (${previewData.length}) မျိုးကို သိမ်းမည်`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Create Product Modal */}
            {isAddProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar relative">
                        <button onClick={() => setIsAddProductModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>
                        <h2 className="text-xl font-black text-gray-900 mb-6 border-b pb-4">ပစ္စည်းအသစ် ဖန်တီးမည် (အဖွင့် Stock အပါအဝင်)</h2>
                        <form onSubmit={handleCreateProduct} className="space-y-6">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                                        {productForm.imageUrl ? <img alt="Preview" src={getResolvedUrl(productForm.imageUrl)} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-400">No Image</span>}
                                        <input type="file" onChange={(e) => handleImageUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input required type="text" placeholder="ပစ္စည်းအမည် *" value={productForm.name} onChange={e => setProductForm((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-yellow-400 outline-none" />
                                        <input type="text" placeholder="အမျိုးအစား Category (ဥပမာ — ပုဇွန်ခြောက်)" value={productForm.category} onChange={e => setProductForm((prev: any) => ({ ...prev, category: e.target.value }))} className="w-full p-2.5 mt-2 rounded-xl border bg-white focus:ring-2 focus:ring-yellow-400 outline-none" />
                                        <input required type="text" placeholder="SKU Code *" value={productForm.sku} onChange={e => setProductForm((prev: any) => ({ ...prev, sku: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-yellow-400 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="number" placeholder="အလေးချိန် (Gram) *" value={productForm.weightGram} onChange={e => setProductForm((prev: any) => ({ ...prev, weightGram: e.target.value }))} className="p-2.5 rounded-xl border bg-white outline-none" />
                                    <input required type="number" placeholder="ရောင်းဈေး (VND) *" value={productForm.currentPriceVND} onChange={e => setProductForm((prev: any) => ({ ...prev, currentPriceVND: e.target.value }))} className="p-2.5 rounded-xl border bg-white outline-none font-black text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest">၂။ ပထမဆုံးအသုတ် (FIRST BATCH)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="number" placeholder="အရေအတွက် *" value={productForm.initialQuantity} onChange={e => setProductForm((prev: any) => ({ ...prev, initialQuantity: e.target.value }))} className="p-3 rounded-xl border bg-white outline-none font-bold" />
                                    <input type="date" value={productForm.expiryDate} onChange={e => setProductForm((prev: any) => ({ ...prev, expiryDate: e.target.value }))} className="p-3 rounded-xl border bg-white outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required type="number" placeholder="ဝယ်ရင်းဈေး (MMK) *" value={productForm.originalPriceMMK} onChange={e => setProductForm((prev: any) => ({ ...prev, originalPriceMMK: e.target.value }))} className="p-3 rounded-xl border bg-white outline-none" />
                                    <input required type="number" placeholder="Kilo Rate — 1kg နှုန်း (MMK) *" value={productForm.kiloRateMMK} onChange={e => setProductForm((prev: any) => ({ ...prev, kiloRateMMK: e.target.value }))} className="p-3 rounded-xl border bg-white outline-none" />
                                </div>
                                {Number(productForm.weightGram) > 0 && Number(productForm.kiloRateMMK) > 0 && (
                                    <p className="text-xs text-gray-500 -mt-2">🚚 ဒီပစ္စည်း ({productForm.weightGram}g) အတွက် သယ်ယူခ = <b className="text-blue-600">{Math.round((Number(productForm.weightGram) / 1000) * Number(productForm.kiloRateMMK)).toLocaleString()} MMK</b></p>
                                )}
                                <div className="pt-2">
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">Exchange Rate (1 MMK = ? VND)</label>
                                    <input required type="number" step="0.01" value={productForm.modalExchangeRate} onChange={e => setProductForm((prev: any) => ({ ...prev, modalExchangeRate: e.target.value }))} className="w-full p-3 rounded-xl border bg-white outline-none font-black text-gray-600 text-sm" />
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-2xl p-5 text-white flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-400">တစ်ခုရောင်းရလျှင် ကျန်မည့်အမြတ် :</span>
                                <span className={`text-xl font-black ${calculateLiveProfit(productForm.originalPriceMMK, productForm.kiloRateMMK, productForm.currentPriceVND, productForm.weightGram, productForm.modalExchangeRate) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {calculateLiveProfit(productForm.originalPriceMMK, productForm.kiloRateMMK, productForm.currentPriceVND, productForm.weightGram, productForm.modalExchangeRate).toLocaleString()} ₫
                                </span>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-lg">
                                {isSubmitting ? "သိမ်းဆည်းနေပါသည်..." : "ပစ္စည်းနှင့် Stock သိမ်းဆည်းမည်"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Edit Product Profile Modal */}
            {isEditProductModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
                        <button onClick={() => setIsEditProductModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">ပစ္စည်းအချက်အလက် ပြင်ဆင်မည်</h2>
                        <form onSubmit={handleUpdateProduct} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
                                    {editForm.imageUrl ? <img alt="Preview" src={getResolvedUrl(editForm.imageUrl)} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-400">No Image</span>}
                                    <input type="file" onChange={(e) => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input required type="text" placeholder="ပစ္စည်းအမည် *" value={editForm.name} onChange={e => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none" />
                                    <input type="text" placeholder="အမျိုးအစား Category" value={editForm.category} onChange={e => setEditForm((prev: any) => ({ ...prev, category: e.target.value }))} className="w-full p-2.5 mt-2 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none" />
                                    <input required type="text" placeholder="SKU Code *" value={editForm.sku} onChange={e => setEditForm((prev: any) => ({ ...prev, sku: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">အလေးချိန် (Gram)</label>
                                    <input required type="number" value={editForm.weightGram} onChange={e => setEditForm((prev: any) => ({ ...prev, weightGram: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">ရောင်းဈေး (VND)</label>
                                    <input required type="number" value={editForm.currentPriceVND} onChange={e => setEditForm((prev: any) => ({ ...prev, currentPriceVND: e.target.value }))} className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none font-black text-blue-600" />
                                </div>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg">
                                {isSubmitting ? "ပြင်ဆင်နေပါသည်..." : "အတည်ပြု ပြင်ဆင်မည်"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Add Stock Modal */}
            {isAddStockModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
                        <button onClick={() => setIsAddStockModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Stock အသစ် ဖြည့်မည် ({selectedProduct.name})</h2>
                        <form onSubmit={handleAddStock} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" placeholder="အရေအတွက် *" value={stockForm.initialQuantity} onChange={e => setStockForm((prev: any) => ({ ...prev, initialQuantity: e.target.value }))} className="p-3 rounded-xl bg-gray-50 border-none font-bold outline-none" />
                                <input type="date" value={stockForm.expiryDate} onChange={e => setStockForm((prev: any) => ({ ...prev, expiryDate: e.target.value }))} className="p-3 rounded-xl bg-gray-50 border-none outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" placeholder="ဝယ်ရင်းဈေး (MMK) *" value={stockForm.originalPriceMMK} onChange={e => setStockForm((prev: any) => ({ ...prev, originalPriceMMK: e.target.value }))} className="p-3 rounded-xl bg-blue-50 border-blue-100 outline-none" />
                                <input required type="number" placeholder="Kilo Rate — 1kg နှုန်း (MMK) *" value={stockForm.kiloRateMMK} onChange={e => setStockForm((prev: any) => ({ ...prev, kiloRateMMK: e.target.value }))} className="p-3 rounded-xl bg-blue-50 border-blue-100 outline-none" />
                            </div>
                            {Number(selectedProduct?.weightGram) > 0 && Number(stockForm.kiloRateMMK) > 0 && (
                                <p className="text-xs text-gray-500">🚚 {selectedProduct.name} ({selectedProduct.weightGram}g) အတွက် သယ်ယူခ = <b className="text-blue-600">{Math.round((Number(selectedProduct.weightGram) / 1000) * Number(stockForm.kiloRateMMK)).toLocaleString()} MMK</b></p>
                            )}
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <input type="number" placeholder="ရောင်းဈေးအသစ် (VND)" value={stockForm.newSalePriceVND} onChange={e => setStockForm((prev: any) => ({ ...prev, newSalePriceVND: e.target.value }))} className="p-3 rounded-xl bg-green-50 border-green-100 font-black text-green-700 outline-none" />
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">Rate (1 MMK = ? VND)</label>
                                    <input required type="number" step="0.01" value={stockForm.modalExchangeRate} onChange={e => setStockForm((prev: any) => ({ ...prev, modalExchangeRate: e.target.value }))} className="w-full p-3 rounded-xl bg-gray-100 font-bold text-gray-600 outline-none" />
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-2xl p-5 text-white flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-400">တစ်ခုရောင်းရလျှင် ကျန်မည့်အမြတ် :</span>
                                <span className={`text-xl font-black ${calculateLiveProfit(stockForm.originalPriceMMK, stockForm.kiloRateMMK, stockForm.newSalePriceVND || String(selectedProduct.currentPriceVND), selectedProduct.weightGram, stockForm.modalExchangeRate) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {calculateLiveProfit(stockForm.originalPriceMMK, stockForm.kiloRateMMK, stockForm.newSalePriceVND || String(selectedProduct.currentPriceVND), selectedProduct.weightGram, stockForm.modalExchangeRate).toLocaleString()} ₫
                                </span>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg">
                                {isSubmitting ? "သိမ်းဆည်းနေပါသည်..." : "Stock အသစ် ဖြည့်သွင်းမည်"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. View Batches Modal */}
            {isViewBatchesModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative">
                        <button onClick={() => setIsViewBatchesModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center"><span className="mr-3">📦</span> Batch မှတ်တမ်းများ ({selectedProduct.name})</h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {!selectedProduct.batches || selectedProduct.batches.length === 0 ? (
                                <p className="text-center py-10 text-gray-400">မှတ်တမ်းများ မရှိသေးပါ။</p>
                            ) : (
                                selectedProduct.batches.map((b: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center ${b.remainingQuantity === 0 ? 'bg-gray-50 opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}>
                                        <div>
                                            <p className="font-black text-gray-800">လက်ကျန်: <span className="text-blue-600">{b.remainingQuantity} ခု</span></p>
                                            <p className="text-xs text-gray-400">ဝယ်ရင်း: {Number(b.originalPriceMMK).toLocaleString()} Ks | ကီလိုခ: {Number(b.kiloRateMMK).toLocaleString()} Ks</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-sm font-bold text-gray-800 mb-1">ရောင်းဈေး: {Number(b.salePriceVND).toLocaleString()} ₫</p>
                                            <div className="flex space-x-2 items-center">
                                                <span className="text-[10px] font-black px-2 py-1 rounded bg-green-100 text-green-700">EXP: {b.expiryDate || 'N/A'}</span>
                                                <button onClick={() => openEditBatchModal(b)} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded hover:bg-yellow-200 transition-colors">EDIT</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Edit Specific Batch Modal */}
            {isEditBatchModalOpen && selectedBatch && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative border-t-8 border-yellow-400">
                        <button onClick={() => setIsEditBatchModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 font-bold text-xl">✕</button>
                        <h2 className="text-xl font-black text-gray-900 mb-6 border-b pb-4">Batch အချက်အလက် ပြင်ဆင်မည်</h2>
                        <form onSubmit={handleUpdateBatch} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">အရေအတွက် (လက်ကျန်)</label>
                                    <input required type="number" value={editBatchForm.quantity} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, quantity: e.target.value }))} className="w-full p-3 rounded-xl border bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-yellow-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">EXP Date</label>
                                    <input type="date" value={editBatchForm.expiryDate} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, expiryDate: e.target.value }))} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-yellow-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">ဝယ်ရင်းဈေး (MMK)</label>
                                    <input required type="number" value={editBatchForm.originalPriceMMK} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, originalPriceMMK: e.target.value }))} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-yellow-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">၁ ကီလို သယ်ယူခ (MMK)</label>
                                    <input required type="number" value={editBatchForm.kiloRateMMK} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, kiloRateMMK: e.target.value }))} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-yellow-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">ရောင်းဈေး (VND)</label>
                                    <input required type="number" value={editBatchForm.salePriceVND} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, salePriceVND: e.target.value }))} className="w-full p-3 rounded-xl border bg-gray-50 outline-none font-black text-blue-600 focus:ring-2 focus:ring-yellow-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1">Rate (1 MMK = ? VND)</label>
                                    <input required type="number" step="0.01" value={editBatchForm.modalExchangeRate} onChange={e => setEditBatchForm((prev: any) => ({ ...prev, modalExchangeRate: e.target.value }))} className="w-full p-3 rounded-xl bg-gray-100 font-bold text-gray-600 outline-none" />
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-2xl p-5 text-white flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-400">တစ်ခုရောင်းရလျှင် ကျန်မည့်အမြတ် :</span>
                                <span className={`text-xl font-black ${calculateLiveProfit(editBatchForm.originalPriceMMK, editBatchForm.kiloRateMMK, editBatchForm.salePriceVND, selectedProduct.weightGram, editBatchForm.modalExchangeRate) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {calculateLiveProfit(editBatchForm.originalPriceMMK, editBatchForm.kiloRateMMK, editBatchForm.salePriceVND, selectedProduct.weightGram, editBatchForm.modalExchangeRate).toLocaleString()} ₫
                                </span>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-yellow-500 text-gray-900 font-black rounded-xl hover:bg-yellow-400 transition-all shadow-lg">
                                {isSubmitting ? "သိမ်းဆည်းနေပါသည်..." : "အတည်ပြု ပြင်ဆင်မည်"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}