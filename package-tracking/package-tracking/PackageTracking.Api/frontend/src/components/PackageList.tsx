import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Package {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  currentStatus: string;
  createdAt: string;
}

const allowedTransitions: Record<string, string[]> = {
  Created: ["Sent", "Canceled"],
  Sent: ["Accepted", "Returned", "Canceled"],
  Returned: ["Sent", "Canceled"],
  Accepted: [],
  Canceled: []
};

const statusColors: Record<string, string> = {
  Created: "bg-blue-200 text-blue-900",
  Sent: "bg-yellow-200 text-yellow-900",
  Accepted: "bg-green-200 text-green-900",
  Returned: "bg-orange-200 text-orange-900",
  Canceled: "bg-red-200 text-red-900"
};

const cardBgColors: Record<string, string> = {
  Created: "#DBEAFE",
  Sent: "#FEF9C3",
  Accepted: "#DCFCE7",
  Returned: "#FFEDD5",
  Canceled: "#FEE2E2"
};

const API_BASE = "http://localhost:5000/api/packages";

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTracking, setFilterTracking] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  function PackageStatusToString(status: number) {
    switch (status) {
      case 0: return "Created";
      case 1: return "Sent";
      case 2: return "Accepted";
      case 3: return "Returned";
      case 4: return "Canceled";
      default: return "Unknown";
    }
  }

  function PackageStatusToEnum(status: string) {
    switch (status) {
      case "Created": return 0;
      case "Sent": return 1;
      case "Accepted": return 2;
      case "Returned": return 3;
      case "Canceled": return 4;
      default: return 0;
    }
  }

  async function fetchPackages() {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Fetch error ${res.status}`);
      const data = await res.json();
      const packagesWithStatus = data.map((p: any) => ({
        ...p,
        currentStatus: PackageStatusToString(p.currentStatus)
      }));
      setPackages(packagesWithStatus);
    } catch (err) {
      console.error(err);
      alert("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: number, newStatus: string) {
    if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: PackageStatusToEnum(newStatus) })
      });

      if (!res.ok) throw new Error("Failed to change status");

      await fetchPackages();
      alert(`Status successfully changed to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      alert("Failed to change status");
    }
  }

  async function createPackage() {
    const senderName = prompt("Sender Name:");
    if (!senderName) return alert("Sender name is required!");
    
    const senderAddress = prompt("Sender Address:");
    if (!senderAddress) return alert("Sender address is required!");
    
    const senderPhone = prompt("Sender Phone Number:");
    if (!senderPhone) return alert("Sender phone number is required!");
    
    const recipientName = prompt("Recipient Name:");
    if (!recipientName) return alert("Recipient name is required!");
    
    const recipientAddress = prompt("Recipient Address:");
    if (!recipientAddress) return alert("Recipient address is required!");
    
    const recipientPhone = prompt("Recipient Phone Number:");
    if (!recipientPhone) return alert("Recipient phone number is required!");

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderAddress,
          senderPhone,
          recipientName,
          recipientAddress,
          recipientPhone
        })
      });

      if (!res.ok) throw new Error("Failed to create package");

      await fetchPackages();
      alert("Package successfully created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create package");
    }
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(p =>
    p.trackingNumber.toLowerCase().includes(filterTracking.toLowerCase()) &&
    (filterStatus === "" || p.currentStatus === filterStatus)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">My Packages</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-[900px]">
        <input
          type="text"
          placeholder="Filter by Tracking Number"
          className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          value={filterTracking}
          onChange={e => setFilterTracking(e.target.value)}
        />
        <select
          className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <button
        onClick={createPackage}
        className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
      >
        Create Package
      </button>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-[1200px]">
          {filteredPackages.map((p) => (
            <div
              key={p.id}
              style={{ backgroundColor: cardBgColors[p.currentStatus] }}
              className="border-2 border-gray-300 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition flex flex-col justify-between"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-center mb-3 text-gray-900">{p.trackingNumber}</h2>
                <p className="text-gray-800"><span className="font-semibold">Sender:</span> {p.senderName}</p>
                <p className="text-gray-800"><span className="font-semibold">Recipient:</span> {p.recipientName}</p>
                <p className={`inline-block mt-3 px-4 py-1 rounded-full font-semibold ${statusColors[p.currentStatus]}`}>
                  {p.currentStatus}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Created: {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t pt-3 justify-center">
                {(allowedTransitions[p.currentStatus] || []).map((status) => (
                  <button
                    key={status}
                    onClick={() => changeStatus(p.id, status)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[status]} hover:opacity-80 transition`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => navigate(`/packages/${p.id}`)}
                  className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition font-semibold"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
