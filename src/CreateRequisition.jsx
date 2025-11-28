import React, { useState } from "react";
import "./App.css";

export default function CreateRequisition({ onCancel }) {
  const [caseName, setCaseName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Example requisition ID logic
  const requisitionId = `XXX-${clientName || "ClientName"}`;

  return (
    <div className="requisition-container">
      <h2 className="requisition-title">Create New Requisition</h2>
      <p className="requisition-subtitle">
        Start a new demand workflow by creating a case and sending an intake form to your client
      </p>
      <form className="requisition-form" onSubmit={e => e.preventDefault()}>
        <label className="requisition-label">Case Name</label>
        <input
          className="requisition-input"
          type="text"
          placeholder="Johnson v. State Farm"
          value={caseName}
          onChange={e => setCaseName(e.target.value)}
        />
        <span className="requisition-helper">Enter the case name (e.g., Plaintiff v. Defendant)</span>

        <label className="requisition-label">Client Name</label>
        <input
          className="requisition-input"
          type="text"
          placeholder="Sarah Johnson"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
        />

        <label className="requisition-label">Client Email</label>
        <input
          className="requisition-input"
          type="email"
          placeholder="client@email.com"
          value={clientEmail}
          onChange={e => setClientEmail(e.target.value)}
        />
        <span className="requisition-helper">
          A secure intake form link will be sent to this email
        </span>

        <hr className="requisition-divider" />

        <div className="requisition-id-box">
          <span className="requisition-id-label">Requisition ID (Auto-Generated):</span>
          <span className="requisition-id-value">{requisitionId}</span>
        </div>

        <div className="requisition-actions">
          <button type="button" className="requisition-cancel" onClick={() => onCancel && onCancel()}>Cancel</button>
          <button type="submit" className="requisition-send">
            <span role="img" aria-label="send">✈️</span> Send Intake Form
          </button>
        </div>
      </form>
    </div>
  );
}
