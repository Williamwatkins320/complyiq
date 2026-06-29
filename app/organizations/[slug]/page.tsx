"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function OrganizationPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    fetchOrganization();
  }, [slug, router]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
        setProjects(data.projects || []);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <main className="page-shell"><p>Loading...</p></main>;
  }

  if (!organization) {
    return <main className="page-shell"><p>Organization not found</p></main>;
  }

  return (
    <main className="page-shell">
      <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>

      <div className="org-header">
        <div>
          <h1>{organization.name}</h1>
          <p>Manage your compliance projects and workflows</p>
        </div>
        <Link href={`/organizations/${slug}/members`} className="btn-secondary">
          Manage Members
        </Link>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Projects</h2>
          <Link href={`/organizations/${slug}/projects/create`} className="btn-primary">
            Create Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create one to get started with compliance workflows!</p>
          </div>
        ) : (
          <div className="grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/organizations/${slug}/projects/${project.slug}`}
                className="project-card"
              >
                <h3>{project.name}</h3>
                <p>Created {new Date(project.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}