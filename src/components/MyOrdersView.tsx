import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";
import { ClipboardList, Clock, CheckCircle, Truck, Package, RefreshCw, Smartphone } from "lucide-react";

export default function MyOrdersView() {
  const { orders, fetchUserOrders, addToast } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserOrders();
      addToast("Order list updated!", "info");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const getStatusIndex = (status: string) => {
    const steps = ["Food Processing", "Preparing", "Out For Delivery", "Delivered"];
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const steps = [
    { title: "Processed", desc: "Received", icon: ClipboardList, color: "rose" },
    { title: "Cooking", desc: "Chef Preps", icon: Package, color: "amber" },
    { title: "On The Way", desc: "In Transit", icon: Truck, color: "blue" },
    { title: "Arrived", desc: "Bon Appétit!", icon: CheckCircle, color: "emerald" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" id="orders-tracking-view">
      
      {/* Title Header Section */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Track My Orders
          </h2>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
            Real-time delivery progress counters
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-gray-100 rounded-xl px-4 py-2.5 transition-all cursor-pointer box-shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Tracking
        </button>
      </div>

      {orders.length === 0 ? (
        /* Empty History State */
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" id="empty-orders-slate">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-400 rounded-full mb-4">
            <ClipboardList className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Orders Tracked</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
            You don't have any placed order histories under this email. Venture over to the explore tab, add gourmet meals, and checkout!
          </p>
        </div>
      ) : (
        /* Orders list */
        <div className="space-y-6" id="orders-cards-list">
          {orders.map((order) => {
            const currentStepIndex = getStatusIndex(order.status);
            const isDelivered = order.status === "Delivered";

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-6"
                id={`order-row-${order.id}`}
              >
                
                {/* ID Header Panel */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Order Reference</p>
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 py-1 px-2.5 rounded-lg border border-gray-100">
                      #{order.id.slice(6).toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 font-semibold flex items-center gap-1.5 bg-gray-50/50 px-3 py-1 rounded-xl">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Paid Total</p>
                    <span className="text-base font-black text-rose-600 block">
                      ${order.amount.toFixed(2)}
                    </span>
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 mt-0.5 uppercase">
                      Payment Approved
                    </span>
                  </div>
                </div>

                {/* Recipe details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Items and delivery details */}
                  <div className="md:col-span-1 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Culinary Items</p>
                      <div className="space-y-1.5 text-xs text-gray-700 font-medium">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex justify-between border-b border-gray-50 pb-1">
                            <span className="truncate max-w-[150px]">{it.name}</span>
                            <span className="text-gray-400">QTY {it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Delivering To</p>
                      <p className="text-xs text-gray-650 font-semibold leading-normal">
                        {order.address.firstName} {order.address.lastName} <br />
                        {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: High Fidelity Step tracker */}
                  <div className="md:col-span-2 bg-gray-50/55 p-4 rounded-xl border border-gray-100 relative overflow-hidden">
                    
                    {/* Background subtle color indicator */}
                    <div className="absolute top-0 right-0 h-1 left-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500" />

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 animate-pulse">
                        LIVE TRACKING STATUS
                      </span>
                      <span className="text-xs font-bold text-gray-800 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full">
                        {order.status}
                      </span>
                    </div>

                    {/* Step Nodes Row */}
                    <div className="relative mt-8">
                      {/* Connecting line */}
                      <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-10 rounded-full" />
                      <div
                        className="absolute top-4 left-4 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 -z-10 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                        }}
                      />

                      <div className="flex justify-between select-none">
                        {steps.map((st, sIdx) => {
                          const isCompleted = sIdx < currentStepIndex;
                          const isActive = sIdx === currentStepIndex;
                          const isUpcoming = sIdx > currentStepIndex;

                          const StepIcon = st.icon;

                          return (
                            <div key={sIdx} className="flex flex-col items-center text-center max-w-[80px]">
                              {/* Step circle node */}
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCompleted
                                    ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-100"
                                    : isActive
                                    ? "bg-amber-400 border-amber-500 text-gray-900 shadow-md shadow-amber-100 animate-pulse"
                                    : "bg-white border-gray-200 text-gray-400"
                                }`}
                              >
                                <StepIcon className="w-4.5 h-4.5" />
                              </div>

                              <span className={`mt-2 text-[10px] font-black ${
                                isActive ? "text-gray-900" : isCompleted ? "text-rose-600" : "text-gray-450"
                              }`}>
                                {st.title}
                              </span>
                              <span className="text-[8px] text-gray-400 font-semibold block leading-none mt-0.5">
                                {st.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
