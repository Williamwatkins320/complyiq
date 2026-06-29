"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function CreateProject() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [formData, setFormData] = useState({
    name: "",
    projectSlug: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.projectSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/organizations/${slug}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.projectSlug,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const data = await response.json();
      router.push(`/organizations/${slug}/projects/${data.project.slug}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <Link href={`/organizations/${slug}`} className="back-link">← Back to Organization</Link>
      <div className="form-container">
        <h1>Create Project</h1>
        <p>Add a new compliance project to track workflows</p>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Q4 Compliance Audit"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectSlug">Project Slug</label>
            <input
              id="projectSlug"
              name="projectSlug"
              type="text"
              value={formData.projectSlug}
              onChange={handleChange}
              required
              placeholder="q4-compliance-audit"
            />
            <small>Auto-generated from project name</small>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </main>
  );
}