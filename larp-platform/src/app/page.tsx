export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">LARP Platform MVP</h1>
      <p>Runnable scaffold with auth, campaign/event/ticket creation, registration, check-in, and incident logging APIs.</p>
      <p>Set <code>X-User-Id</code> and <code>X-Tenant-Id</code> headers in API calls for role-protected endpoints.</p>
    </div>
  );
}
