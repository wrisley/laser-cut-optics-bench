"use client";
import { useEffect, useState } from "react";

export default function EventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/events/${params.id}`).then((r) => r.json()).then(setEvent);
  }, [params.id]);

  async function register(formData: FormData) {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(formData.get("userId")),
        "X-Tenant-Id": String(formData.get("tenantId"))
      },
      body: JSON.stringify({ eventId: params.id, ticketTierId: formData.get("ticketTierId") })
    });
    setMessage(JSON.stringify(await res.json()));
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{event.name}</h1>
      <p>Capacity: {event.capacity}</p>
      <ul className="list-disc pl-6">
        {event.ticketTiers?.map((tier: any) => (
          <li key={tier.id}>{tier.name} - {tier.priceCents / 100} {tier.currency}</li>
        ))}
      </ul>
      <form action={register} className="space-y-2">
        <input name="tenantId" className="p-2 rounded" placeholder="tenant id" />
        <input name="userId" className="p-2 rounded" placeholder="player user id" />
        <input name="ticketTierId" className="p-2 rounded" placeholder="ticket tier id" />
        <button className="bg-blue-700 text-white rounded px-4 py-2">Register</button>
      </form>
      <pre>{message}</pre>
    </div>
  );
}
