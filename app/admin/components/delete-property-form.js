"use client";

import { useState } from "react";

export default function DeletePropertyForm({ propertyId, propertyName }) {
  const [confirmation, setConfirmation] = useState("");
  const [isArmed, setIsArmed] = useState(false);
  const canDelete = confirmation === propertyName;

  if (!isArmed) {
    return (
      <button className="danger-button" type="button" onClick={() => setIsArmed(true)}>
        Delete property and its submissions
      </button>
    );
  }

  return (
    <form className="delete-confirmation" action={`/api/admin/properties/${propertyId}`} method="post">
      <input type="hidden" name="_action" value="delete" />
      <label>
        Type <strong>{propertyName}</strong> to confirm deletion.
        <input
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
        />
      </label>
      <div className="delete-actions">
        <button className="danger-button compact-button" type="submit" disabled={!canDelete}>
          Confirm delete
        </button>
        <button
          className="secondary-button compact-button"
          type="button"
          onClick={() => {
            setIsArmed(false);
            setConfirmation("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
