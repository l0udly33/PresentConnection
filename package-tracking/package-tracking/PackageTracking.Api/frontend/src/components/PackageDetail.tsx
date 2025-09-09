import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface StatusHistory {
  status: number;
  timestamp: string;
}

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
  statusHistory: StatusHistory[];
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

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function fetchPackage() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error("Failed to load package");

      const data = await res.json();
      setPkg({
        ...data,
        currentStatus: PackageStatusToString(data.currentStatus),
        statusHistory: data.statusHistory.map((h: any) => ({
          status: h.status,
          timestamp: h.timestamp
        }))
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load package");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(newStatus: string) {
    if (!pkg) return;
    if (!window.confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/${pkg.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: PackageStatusToEnum(newStatus) })
      });

      if (!res.ok) throw new Error("Failed to change status");

      await fetchPackage();
      alert(`Status successfully changed to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      alert("Failed to change status");
    }
  }

  useEffect(() => {
    fetchPackage();
  }, [id]);

  if (loading || !pkg) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }

  const currentStatusHistory = pkg.statusHistory.length > 0
    ? pkg.statusHistory[pkg.statusHistory.length - 1]
    : { status: 0, timestamp: pkg.createdAt };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col items-center">
      <button
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition self-start"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-lg max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">{pkg.trackingNumber}</h1>

        <div className="mb-4">
          <p className="text-gray-800"><span className="font-semibold">Sender:</span> {pkg.senderName}</p>
          <p className="text-gray-800"><span className="font-semibold">Address:</span> {pkg.senderAddress}</p>
          <p className="text-gray-800"><span className="font-semibold">Phone:</span> {pkg.senderPhone}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-800"><span className="font-semibold">Recipient:</span> {pkg.recipientName}</p>
          <p className="text-gray-800"><span className="font-semibold">Address:</span> {pkg.recipientAddress}</p>
          <p className="text-gray-800"><span className="font-semibold">Phone:</span> {pkg.recipientPhone}</p>
        </div>

        <div className="mb-4">
          <p className={`inline-block px-4 py-2 rounded-full font-semibold ${statusColors[pkg.currentStatus]}`}>
            {pkg.currentStatus}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Updated: {new Date(currentStatusHistory.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {(allowedTransitions[pkg.currentStatus] || []).map((status) => (
            <button
              key={status}
              onClick={() => changeStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[status]} hover:opacity-80 transition`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2 text-center">Status History List</h2>
          {pkg.statusHistory.length > 0 ? (
            <ul className="list-disc list-inside text-gray-800">
              {pkg.statusHistory.map((h, idx) => {
                const statusString = PackageStatusToString(h.status);
                return (
                  <li key={idx} className={`mb-1 font-semibold ${statusColors[statusString]}`}>
                    {statusString} — {new Date(h.timestamp).toLocaleString()}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No status history available</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Status Timeline</h2>
          <div className="flex flex-col relative ml-4">
            {pkg.statusHistory.length > 0 ? pkg.statusHistory.map((h, idx) => {
              const statusString = PackageStatusToString(h.status);
              return (
                <div key={idx} className="flex items-start mb-6">
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-gray-400"
                      style={{ backgroundColor: cardBgColors[statusString] }}
                    ></div>
                    {idx !== pkg.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-300 mt-0.5"></div>}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${statusColors[statusString]}`}>
                      {statusString}
                    </p>
                    <p className="text-gray-500 text-sm">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-gray-500">No status history available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
