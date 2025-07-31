import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHR } from "@/contexts/HRContext"; // adjust path if needed

const AuditLogs = () => {
  const { currentUser } = useHR();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/api/leaves/audit-logs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setLogs(response.data);
      } catch (err) {
        console.error("Error fetching audit logs", err);
      }
    };

    fetchLogs();
  }, []);

  if (currentUser?.role !== "manager") {
    return <p>Access denied.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Target ID</th>
              <th className="px-4 py-2 border">Details</th>
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 border">{log.userId}</td>
                <td className="px-4 py-2 border">{log.action}</td>
                <td className="px-4 py-2 border">{log.targetId}</td>
                <td className="px-4 py-2 border">{log.details}</td>
                <td className="px-4 py-2 border">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
