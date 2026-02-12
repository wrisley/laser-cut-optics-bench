"use client";
import { useState } from "react";

export default function CheckInPage() {
  const [message, setMessage] = useState("");
  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      },
      body: JSON.stringify({ eventId: formData.get("eventId"), registrationId: formData.get("registrationId") })
    });
    setMessage(JSON.stringify(await res.json()));
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <h1 className="text-xl font-semibold">Staff Check-in</h1>
      <input name="tenantId" placeholder="tenant id" className="p-2 rounded" />
      <input name="userId" placeholder="ref/organizer/admin user id" className="p-2 rounded" />
      <input name="eventId" placeholder="event id" className="p-2 rounded" />
      <input name="registrationId" placeholder="registration id" className="p-2 rounded" />
      <button className="bg-emerald-600 text-white px-4 py-2 rounded">Check in</button>
      <pre>{message}</pre>
    </form>
  );
}
