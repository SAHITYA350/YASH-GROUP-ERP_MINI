import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, User, Mail, Calendar, CheckCircle } from 'lucide-react';
import PageHeader from '../../../layouts/PageHeader';
import userApi from '../api/userApi';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorState from '../../../components/common/ErrorState';

export function UserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getUser(id);
      setUser(res.user || res);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading user profile..." />;
  if (error) return <ErrorState message={error} onRetry={loadUser} />;
  if (!user) return <ErrorState message="User record not found." />;

  return (
    <div>
      <PageHeader
        title={user.name}
        subtitle={`System Profile & Security Credentials (${user.role})`}
        breadcrumbs={[
          { label: 'Users', to: '/users' },
          { label: user.name },
        ]}
        actions={
          <Link to="/users" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Users</span>
          </Link>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700,
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{user.name}</h2>
                <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {user.email}
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Role & Privileges
              </h4>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                <Shield size={14} />
                <span>{user.role}</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Account Identity
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'var(--font-family-mono)' }}>
                UUID: {user.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsPage;
