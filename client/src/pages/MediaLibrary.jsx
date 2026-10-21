import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Stepper from '../components/Stepper';
import MetricCard from '../components/MetricCard';
import { FileText, ExternalLink, Search, AlertCircle, RefreshCw } from 'lucide-react';

export default function MediaLibrary() {
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMediaAssets();
      setMediaAssets(res.data || []);
    } catch (err) {
      console.error('Error fetching media assets:', err);
      setError(err.message || 'Unable to fetch media assets from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const steps = [
    { title: 'Upload Asset', sub: 'Drawings · proof · SOP' },
    { title: 'Associate Job', sub: 'SO / WO / Task link' },
    { title: 'Verify QC', sub: 'Dimensional signoff' },
    { title: 'Archive & Access', sub: 'Audit ready' },
  ];

  const filtered = mediaAssets.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.linkedEntity || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalCount = mediaAssets.length;
  const drawingsCount = mediaAssets.filter((m) => m.type === 'DRAWING').length;
  const docsCount = mediaAssets.filter((m) => m.type === 'DOCUMENT').length;
  const approvedCount = mediaAssets.filter((m) => m.isApproved).length;

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="submodule-banner">
        <div className="banner-content">
          <div className="banner-kicker">MODULE 7 · WORKFORCE, ADMIN & MIS</div>
          <h2 className="banner-heading">Media & Document Proof Library</h2>
          <p className="banner-description">
            Central repository for engineering drawings, inspection reports, delivery proofs, job attachments and compliance records tied to ERP tasks.
          </p>
        </div>
      </div>

      <Stepper steps={steps} />

      {error && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '0.5rem',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#9f1239',
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            <strong>Database Status:</strong> {error}
          </span>
        </div>
      )}

      <div className="metrics-grid">
        <MetricCard
          label="Total Files"
          value={totalCount.toString()}
          sub={totalCount > 0 ? 'Verified proofs' : 'No records'}
          accent="green"
          barWidth={totalCount > 0 ? '100%' : '0%'}
        />
        <MetricCard
          label="Drawings"
          value={drawingsCount.toString()}
          sub="Technical drawings"
          accent="blue"
          barWidth={totalCount > 0 ? `${Math.round((drawingsCount / totalCount) * 100)}%` : '0%'}
        />
        <MetricCard
          label="QC Documents"
          value={docsCount.toString()}
          sub="Reports & certs"
          accent="purple"
          barWidth={totalCount > 0 ? `${Math.round((docsCount / totalCount) * 100)}%` : '0%'}
        />
        <MetricCard
          label="Approved"
          value={approvedCount.toString()}
          sub="Verified proofs"
          accent="orange"
          barWidth={totalCount > 0 ? `${Math.round((approvedCount / totalCount) * 100)}%` : '0%'}
        />
      </div>

      <div className="panel-card content-full-width">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Attached Media & Verification Proofs</h3>
            <p className="panel-subtitle">Access evidence links associated with workforce tasks and customer jobs</p>
          </div>
          <button className="btn-secondary" onClick={fetchMedia} disabled={loading} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <RefreshCw size={13} className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search file, task, or job code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Asset Types</option>
            <option value="DOCUMENT">Documents & Reports</option>
            <option value="DRAWING">Technical Drawings</option>
            <option value="PHOTO">Photos & Logs</option>
            <option value="OTHER">Other Media</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Document / Asset Title</th>
                <th>Type</th>
                <th>Linked Task / Job</th>
                <th>Department</th>
                <th>Size</th>
                <th>Updated</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading media assets from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No media assets or verification proofs found in the database.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color="#047857" />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill in-progress">{item.type}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{item.linkedEntity}</td>
                    <td>{item.department}</td>
                    <td style={{ color: '#64748b' }}>{item.size}</td>
                    <td style={{ color: '#64748b' }}>{item.updatedAt}</td>
                    <td style={{ textAlign: 'center' }}>
                      {item.url && item.url !== '#' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-table-action primary"
                          style={{ textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} /> View Evidence
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No URL</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
