"use client";
import { useState } from "react";

export default function IncidentPage() {
  const [message, setMessage] = useState("");

  async function createIncident(formData: FormData) {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      },
      body: JSON.stringify({
        eventId: formData.get("eventId"),
        summary: formData.get("summary"),
        visibility: formData.get("visibility")
      })
    });
    setMessage(JSON.stringify(await res.json()));
  }

  async function listIncidents(formData: FormData) {
    const res = await fetch("/api/incidents", {
      headers: {
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      }
    });
    setMessage(JSON.stringify(await res.json()));
  }

  return (
    <div className="space-y-4">
      <form action={createIncident} className="space-y-2">
        <h1 className="text-xl font-semibold">Incident logging</h1>
        <input name="tenantId" placeholder="tenant id" className="p-2 rounded" />
        <input name="userId" placeholder="ref user id" className="p-2 rounded" />
        <input name="eventId" placeholder="event id" className="p-2 rounded" />
        <textarea name="summary" placeholder="incident summary" className="p-2 rounded w-full" />
        <select name="visibility" className="p-2 rounded">
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        <button className="bg-rose-600 text-white px-4 py-2 rounded">Create incident</button>
      </form>

      <form action={listIncidents} className="space-y-2">
        <input name="tenantId" placeholder="tenant id" className="p-2 rounded" />
        <input name="userId" placeholder="ref/admin user id" className="p-2 rounded" />
        <button className="bg-slate-600 text-white px-4 py-2 rounded">List incidents</button>
      </form>
      <pre>{message}</pre>
    </div>
  );
}
