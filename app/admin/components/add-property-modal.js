"use client";

import { useState } from "react";

export default function AddPropertyModal({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="submit-button compact-button" type="button" onClick={() => setIsOpen(true)}>
        Add property
      </button>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="add-property-title">
            <div className="modal-heading">
              <div>
                <p className="card-label">Property setup</p>
                <h2 id="add-property-title">Add property</h2>
              </div>
              <button className="modal-close" type="button" aria-label="Close add property form" onClick={() => setIsOpen(false)}>
                x
              </button>
            </div>
            {children}
          </section>
        </div>
      ) : null}
    </>
  );
}
