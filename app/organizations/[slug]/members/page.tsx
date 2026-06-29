"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function MembersPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    fetchMembers();
  }, [slug, router]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/organizations/${slug}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`/api/organizations/${slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to add member");
        return;
      }

      setNewMemberEmail("");
      fetchMembers();
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <main className="page-shell"><p>Loading...</p></main>;
  }

  return (
    <main className="page-shell">
      <Link href={`/organizations/${slug}`} className="back-link">← Back to Organization</Link>

      <h1>Manage Members</h1>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Team Members</h2>
        </div>

        <form onSubmit={handleAddMember} className="add-member-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member email"
              required
            />
            <button type="submit" className="btn-primary">Add Member</button>
          </div>
        </form>

        {members.length === 0 ? (
          <div className="empty-state">
            <p>No members yet.</p>
          </div>
        ) : (
          <div className="members-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
            </div>
            {members.map((member) => (
              <div key={member.id} className="table-row">
                <div>{member.name || "—"}</div>
                <div>{member.email}</div>
                <div>{member.role}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}