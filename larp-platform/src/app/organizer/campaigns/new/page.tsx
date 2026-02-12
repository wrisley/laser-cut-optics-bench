"use client";
import { useState } from "react";

export default function NewCampaignPage() {
  const [message, setMessage] = useState("");
  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      },
      body: JSON.stringify({ name: formData.get("name") })
    });
    setMessage(JSON.stringify(await res.json()));
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <h1 className="text-xl font-semibold">Create campaign</h1>
      <input name="tenantId" placeholder="tenant id" className="p-2 rounded" />
      <input name="userId" placeholder="organizer user id" className="p-2 rounded" />
      <input name="name" placeholder="campaign name" className="p-2 rounded" />
      <button className="bg-purple-600 text-white px-4 py-2 rounded">Create</button>
      <pre>{message}</pre>
    </form>
  );
}
