import React, { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";
import { Food, Order } from "../types";
import { ChefHat, Plus, Trash2, DollarSign, ShoppingCart, Users, Layers, Upload, Loader2, ArrowRight } from "lucide-react";

export default function AdminPanel() {
  const { foodList, fetchFoods, addToast, token } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersCount, setUsersCount] = useState(4); // default sample counters if unavailable

  // Form entries for adding food
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Burgers");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File uploading drag and drop states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Load all admin datasets
  const fetchAllAdminData = async () => {
    if (!token) return;
    try {
      // 1. Fetch orders
      const orderRes = await fetch("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrders(orderData.data);
      }

      // 2. Refresh foods
      await fetchFoods();
    } catch (err) {
      console.error("Admin data loading error", err);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [token]);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert uploaded image file to base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast("File must be an image (PNG, JPG, WEBP, etc.)", "error");
      return;
    }
    setUploadedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        addToast("Food image uploaded successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Form adding submit
  const handleAddFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      addToast("Missing culinary fields: Name, Price, Category", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/food/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          image: image || undefined // server provides standard fallback if empty
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Dish "${name}" added successfully!`, "success");
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setImage("");
        setUploadedFileName("");
        
        // Refresh culinary lists
        await fetchFoods();
      } else {
        addToast(data.message || "Failed to add food recipe", "error");
      }
    } catch (err) {
      addToast("Error contacting server. Check logs.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove food from database
  const handleRemoveFood = async (id: string, foodName: string) => {
    if (!confirm(`Are you sure you want to remove "${foodName}" from the menu?`)) return;

    try {
      const res = await fetch("/api/food/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Removed "${foodName}" from menu`, "info");
        await fetchFoods();
      } else {
        addToast(data.message || "Removal failed", "error");
      }
    } catch (e) {
      addToast("Failed to remove food", "error");
    }
  };

  // Update order status dropdown selector
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/order/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Order updated to status: ${status}`, "success");
        // Refresh orders log
        await fetchAllAdminData();
      } else {
        addToast(data.message || "Failure updating order", "error");
      }
    } catch (err) {
      addToast("Connection error updating order status", "error");
    }
  };

  // Analytics Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.payment === true)
    .reduce((sum, o) => sum + o.amount, 0);

  const pendingOrders = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12" id="admin-panel-views">
      
      {/* Header section with styling */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl" id="admin-header-card">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-500/30">
              Admin & Chef Control Center
            </span>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-amber-400" />
              Kitchen Console
            </h2>
            <p className="text-slate-400 text-sm max-w-xl font-medium">
              Manage core culinary recipes, check metrics analytics, modify active order dispatch delivery tracking live.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={fetchAllAdminData}
              className="text-xs font-bold text-slate-100 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-5 py-3 transition-colors cursor-pointer"
            >
              Sync Kitchen Datasets
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Sales</span>
            <span className="text-lg font-black text-gray-900">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Orders Placed</span>
            <span className="text-lg font-black text-gray-900">{orders.length} orders</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">Menu Items</span>
            <span className="text-lg font-black text-gray-900">{foodList.length} dishes</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 block uppercase">User Registrations</span>
            <span className="text-lg font-black text-gray-900">{usersCount} accounts</span>
          </div>
        </div>
      </div>

      {/* Main Core Section: Left form, Right Food List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ADD FOOD FORM (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="add-food-container">
          <form onSubmit={handleAddFoodSubmit} className="space-y-4">
            <div className="border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-gray-950">Add Gourmet Recipe</h3>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Food Name</label>
              <input
                type="text"
                required
                placeholder="E.g., Smoked Cheddar Burger"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
                id="input-add-food-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="12.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
                  id="input-add-food-price"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white cursor-pointer"
                  id="input-add-food-category"
                >
                  <option value="Italian">🍕 Italian</option>
                  <option value="Burgers">🍔 Burgers</option>
                  <option value="Salads">🥗 Salads</option>
                  <option value="Sides">🍟 Sides & Snacks</option>
                  <option value="Asian">🍜 Asian Special</option>
                  <option value="Desserts">🍰 Desserts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Description</label>
              <textarea
                rows={3}
                placeholder="Briefly review key ingredients, culinary styles or dressings used..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
                id="input-add-food-description"
              />
            </div>

            {/* Premium Drag and Drop File Upload */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase">Food Photo Asset Upload</label>
              
              <div
                className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[110px] ${
                  dragActive ? "border-rose-500 bg-rose-50/20" : "border-gray-200 bg-gray-50 hover:bg-gray-100/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("hidden-file-input")?.click()}
                id="file-dropzone"
              >
                <input
                  type="file"
                  id="hidden-file-input"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <Upload className="w-6 h-6 text-gray-400 mb-1.5" />
                <p className="text-[11px] font-bold text-gray-700">
                  {uploadedFileName ? `Attached: ${uploadedFileName.slice(0, 30)}` : "Drag-and-Drop image file click-to-select"}
                </p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Loads file directly into client DB</p>
              </div>

              {/* Provide direct URL entry fallback */}
              <div className="mt-3">
                <p className="text-[9px] text-gray-400 font-semibold text-center uppercase tracking-wider mb-2">— OR enter absolute graphic URL —</p>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={image && !image.startsWith("data:") ? image : ""}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setUploadedFileName("");
                  }}
                  className="w-full bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
                  id="input-add-food-image-url"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-rose-100 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              id="btn-add-food-submit"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  Publish To Client Menu
                </>
              )}
            </button>
          </form>
        </div>

        {/* FOOD CRUD LIST CATALOG (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col" id="foods-catalog-container">
          <div className="border-b border-gray-50 pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-950">Active Foods Catalog</h3>
            <span className="text-[10px] bg-slate-100 font-black px-2 py-0.5 rounded text-gray-600">{foodList.length} items listed</span>
          </div>

          <div className="overflow-y-auto max-h-[460px] pr-2 space-y-2.5 flex-1" id="foods-manage-list">
            {foodList.map((food) => (
              <div
                key={food.id}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors justify-between"
                id={`admin-food-row-${food.id}`}
              >
                <img
                  src={food.image}
                  alt={food.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{food.name}</h4>
                    <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                      {food.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{food.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs font-black text-rose-600">${food.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleRemoveFood(food.id, food.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    id={`btn-remove-food-${food.id}`}
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DISPATCH ORDER MANAGEMENT log */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm" id="dispatch-orders-log-container">
        <div className="border-b border-gray-100 pb-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-950">Active Kitchen Order Pipelines</h3>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase">Dispatch home couriers and direct preparation timers</p>
          </div>
          <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full">{orders.length} orders total</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-gray-450 text-xs font-medium" id="admin-orders-empty">
            No customer orders registered on server data files. Close the panel, order some pizzas, and come back!
          </div>
        ) : (
          <div className="overflow-x-auto" id="admin-orders-scroller">
            <table className="w-full text-left text-xs text-gray-500 border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4 font-black">Order ID</th>
                  <th className="py-3 px-4 font-black">Customer / Destination</th>
                  <th className="py-3 px-4 font-black">Ordered Food Items</th>
                  <th className="py-3 px-4 font-black">Bill Paid ($)</th>
                  <th className="py-3 px-4 font-black">Dispatch Status Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((ord) => {
                  const isFinished = ord.status === "Delivered";

                  return (
                    <tr key={ord.id} className="hover:bg-gray-55/40 transition-colors" id={`admin-table-row-${ord.id}`}>
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-gray-800">
                        #{ord.id.slice(6).toUpperCase()}
                      </td>

                      {/* Customer Address Details */}
                      <td className="py-4 px-4 leading-normal">
                        <p className="font-bold text-gray-900">{ord.address.firstName} {ord.address.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{ord.address.email}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px]">{ord.address.street}, {ord.address.city}</p>
                      </td>

                      {/* Basket items */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[11px] text-gray-700 font-semibold" id={`order-basket-preview-${ord.id}`}>
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex gap-1">
                              <span className="text-rose-600 block shrink-0">{it.quantity}x</span>
                              <span className="truncate max-w-[130px] font-medium">{it.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Price flag */}
                      <td className="py-4 px-4 font-bold text-slate-900 text-center md:text-left">
                        <span className="text-slate-950 font-black">${ord.amount.toFixed(2)}</span>
                        <span className="block text-[8px] font-black text-emerald-600 mt-0.5 uppercase">Approved</span>
                      </td>

                      {/* Dropdown status update controller */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className={`p-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                              ord.status === "Food Processing"
                                ? "bg-rose-50 text-rose-850 border-rose-200"
                                : ord.status === "Preparing"
                                ? "bg-amber-50 text-amber-850 border-amber-200"
                                : ord.status === "Out For Delivery"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-250 animate-glow"
                            }`}
                            id={`status-select-${ord.id}`}
                          >
                            <option value="Food Processing">Food Processing</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
