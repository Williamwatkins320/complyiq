"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateOrganization() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from name
      if (name === "name") {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/auth/signin");
        return;
      }

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create organization");
        return;
      }

      const data = await response.json();
      router.push(`/organizations/${data.organization.slug}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
      <div className="form-container">
        <h1>Create Organization</h1>
        <p>Set up a new organization to manage your compliance workflows</p>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Organization Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Acme Inc"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Organization Slug</label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="acme-inc"
            />
            <small>Auto-generated from organization name</small>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating..." : "Create Organization"}
          </button>
        </form>
      </div>
    </main>
  );
}