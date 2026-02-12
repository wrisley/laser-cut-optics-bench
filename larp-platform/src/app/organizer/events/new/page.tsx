"use client";
import { useState } from "react";

export default function NewEventPage() {
  const [message, setMessage] = useState("");
  async function onSubmit(formData: FormData) {
    const payload = {
      name: String(formData.get("name")),
      capacity: Number(formData.get("capacity")),
      startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
      campaignId: String(formData.get("campaignId") || "") || undefined
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      },
      body: JSON.stringify(payload)
    });
    setMessage(JSON.stringify(await res.json()));
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <h1 className="text-xl font-semibold">Create event</h1>
      <input name="tenantId" placeholder="tenant id" className="p-2 rounded" />
      <input name="userId" placeholder="organizer user id" className="p-2 rounded" />
      <input name="campaignId" placeholder="campaign id (optional)" className="p-2 rounded" />
      <input name="name" placeholder="event name" className="p-2 rounded" />
      <input name="capacity" placeholder="capacity" type="number" className="p-2 rounded" />
      <input name="startsAt" placeholder="YYYY-MM-DDTHH:mm:ssZ" className="p-2 rounded" />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
      <pre>{message}</pre>
    </form>
  );
}
