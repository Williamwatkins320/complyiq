"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    if (!id || !email) {
      router.push("/auth/signin");
      return;
    }

    setUserId(id);
    setUserEmail(email);
    fetchOrganizations(id);
  }, [router]);

  const fetchOrganizations = async (userId: string) => {
    try {
      const response = await fetch(`/api/organizations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  if (loading) {
    return <main className="page-shell"><p>Loading...</p></main>;
  }

  return (
    <main className="page-shell">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {userEmail}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Your Organizations</h2>
          <Link href="/organizations/create" className="btn-primary">
            Create Organization
          </Link>
        </div>

        {organizations.length === 0 ? (
          <div className="empty-state">
            <p>No organizations yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid">
            {organizations.map((org) => (
              <Link
                key={org.id}
                href={`/organizations/${org.slug}`}
                className="org-card"
              >
                <h3>{org.name}</h3>
                <p>Created {new Date(org.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}