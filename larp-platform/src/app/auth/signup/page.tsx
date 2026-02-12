"use client";
import { useState } from "react";

export default function SignUpPage() {
  const [message, setMessage] = useState("");
  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") })
    });
    setMessage(JSON.stringify(await res.json()));
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <input name="email" placeholder="email" className="p-2 rounded" />
      <input name="password" type="password" placeholder="password" className="p-2 rounded" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Create account</button>
      <pre>{message}</pre>
    </form>
  );
}
