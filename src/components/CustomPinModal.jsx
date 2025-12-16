import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import './CustomPinModal.css'

const CustomPinModal = ({ isOpen, onClose, onSave, lat, lon }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(lat, lon, name.trim(), description.trim())
      setName('')
      setDescription('')
      onClose()
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
    onClose()
  }

  return createPortal(
    <div className="custom-pin-modal-overlay" onClick={handleCancel}>
      <div className="custom-pin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-pin-modal-header">
          <h2>📍 Add Custom Pin</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="custom-pin-form">
          <div className="form-group">
            <label htmlFor="pin-name">Location Name *</label>
            <input
              id="pin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Favorite Spot"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="pin-description">Description (optional)</label>
            <textarea
              id="pin-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this location..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <p className="coordinates-info">
              Coordinates: {lat.toFixed(6)}°N, {lon.toFixed(6)}°W
            </p>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Pin
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default CustomPinModal

