import React from 'react';
import './CasesDashboard.css';

const cases = [
  { id: '001-Johnson', name: 'Johnson v. State Farm', client: 'Sarah Johnson', type: 'Motor Vehicle', state: 'Texas', status: 'In Progress', updated: '2025-10-20' },
  { id: '002-Martinez', name: 'Martinez v. Allstate', client: 'Carlos Martinez', type: 'Motor Vehicle', state: 'Texas', status: 'Draft Ready', updated: '2025-10-19' },
  { id: '003-Williams', name: 'Williams v. Progressive', client: 'Emily Williams', type: 'Motor Vehicle', state: 'Texas', status: 'Awaiting Client', updated: '2025-10-18' },
];

export default function CasesDashboard({ onSignOut, onCreateNew }) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Cases Dashboard</h1>
          <p className="dashboard-sub">Manage and track all your demand letter cases</p>
        </div>
        <div>
          <button className="auth-button primary" onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-wrap">
          <input className="search-input" placeholder="Search cases..." />
        </div>
        <div style={{ marginLeft: 12 }}>
          <select className="status-select">
            <option>All Statuses</option>
            <option>In Progress</option>
            <option>Draft Ready</option>
            <option>Awaiting Client</option>
          </select>
        </div>
        <div style={{ marginLeft: 12 }}>
          <button className="cta-button" onClick={() => onCreateNew && onCreateNew()}>+ New Requisition</button>
        </div>
      </div>

      <div className="cases-card">
        <h3>Active Cases</h3>
        <table className="cases-table">
          <thead>
            <tr>
              <th>Requisition ID</th>
              <th>Case Name</th>
              <th>Client Name</th>
              <th>Case Type</th>
              <th>State</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id}>
                <td className="requisition-id"><strong>{c.id}</strong></td>
                <td>{c.name}</td>
                <td>{c.client}</td>
                <td>{c.type}</td>
                <td>{c.state}</td>
                <td><span className={`status-badge ${c.status.replace(/\s+/g,'-').toLowerCase()}`}>{c.status}</span></td>
                <td>{c.updated}</td>
                <td><button className="link-button">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
