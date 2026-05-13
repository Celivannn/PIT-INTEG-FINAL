import React, { useState, useEffect } from 'react';
import { getRooms, getRoomTypes, createRoom, updateRoom, deleteRoom, createRoomType, updateRoomType, uploadRoomImage, deleteRoomImage } from '../api';
import toast from 'react-hot-toast';

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: 'var(--gray-400)', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rooms');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [deletingImage, setDeletingImage] = useState(false);

  const [roomForm, setRoomForm] = useState({ room_number: '', room_type: '', floor: '', status: 'available' });
  const [typeForm, setTypeForm] = useState({ name: '', description: '', capacity: 2, base_price: 0, amenities: '' });
  const [imageFile, setImageFile] = useState(null);
  const [roomImages, setRoomImages] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([getRooms(), getRoomTypes()]).then(([r, t]) => {
      const roomsData = r.data.results || r.data;
      const typesData = t.data.results || t.data;
      
      // Ensure all IDs are strings to handle CockroachDB 64-bit integers
      const formattedTypes = typesData.map(type => ({
        ...type,
        id: String(type.id)
      }));
      
      const formattedRooms = roomsData.map(room => ({
        ...room,
        id: String(room.id),
        room_type: room.room_type ? {
          ...room.room_type,
          id: String(room.room_type.id)
        } : null
      }));
      
      setRooms(formattedRooms);
      setRoomTypes(formattedTypes);
    }).catch(error => {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const openAddRoom = () => {
    if (!roomTypes.length) {
      toast.error('Please create a room type first');
      setModal('addType');
      return;
    }
    
    // Use the correct room type ID as string
    setRoomForm({
      room_number: '',
      room_type: String(roomTypes[0].id),
      floor: '',
      status: 'available',
    });
    setRoomImages([]);
    setImageFile(null);
    setEditing(null);
    setModal('addRoom');
  };

  const openEditRoom = (r) => {
    setRoomForm({
      room_number: r.room_number,
      room_type: String(r.room_type?.id || ''),
      floor: r.floor,
      status: r.status,
    });
    setEditing(r);
    setModal('editRoom');
  };

  const openAddType = () => {
    setTypeForm({ name: '', description: '', capacity: 2, base_price: 0, amenities: '' });
    setEditing(null);
    setModal('addType');
  };

  const openEditType = (t) => {
    setTypeForm({
      name: t.name,
      description: t.description,
      capacity: t.capacity,
      base_price: t.base_price,
      amenities: (t.amenities || []).join(', '),
    });
    setEditing(t);
    setModal('editType');
  };

  const saveRoom = async () => {
    if (!roomForm.room_number?.trim()) { toast.error('Room number is required'); return; }
    if (!roomForm.room_type) { toast.error('Room type is required'); return; }
    if (!roomForm.floor) { toast.error('Floor number is required'); return; }

    // Verify room type exists
    const selectedTypeExists = roomTypes.some(t => String(t.id) === String(roomForm.room_type));
    if (!selectedTypeExists) {
      toast.error('Selected room type does not exist. Please refresh and try again.');
      load();
      return;
    }

    setSaving(true);
    try {
      const data = {
        room_number: roomForm.room_number.trim(),
        room_type: String(roomForm.room_type),
        floor: parseInt(roomForm.floor),
        status: roomForm.status,
      };
      
      console.log('Sending room data:', data);

      let roomResponse;
      if (editing) {
        roomResponse = await updateRoom(editing.id, data);
        toast.success('Room updated successfully.');
      } else {
        roomResponse = await createRoom(data);
        toast.success('Room created successfully.');

        if (roomImages.length > 0) {
          const uploadToast = toast.loading(`Uploading ${roomImages.length} image(s)...`);
          const newRoom = roomResponse.data;
          for (let i = 0; i < roomImages.length; i++) {
            const fd = new FormData();
            fd.append('image', roomImages[i]);
            fd.append('is_primary', i === 0 ? 'true' : 'false');
            fd.append('order', i);
            try {
              await uploadRoomImage(newRoom.id, fd);
            } catch (err) {
              console.error(`Failed to upload image ${i + 1}:`, err);
              toast.error(`Failed to upload image ${i + 1}`);
            }
          }
          toast.success(`${roomImages.length} image(s) uploaded!`, { id: uploadToast });
        }
      }

      setModal(null);
      load();
    } catch (e) {
      console.error('Save error:', e);
      const errors = e.response?.data;
      if (errors && typeof errors === 'object') {
        const msg = Object.entries(errors).map(([k, v]) =>
          k === 'non_field_errors' ? v : `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
        ).join('; ');
        toast.error(msg);
      } else {
        toast.error('Failed to save room. Please check all fields.');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveType = async () => {
    if (!typeForm.name?.trim()) { toast.error('Room type name is required'); return; }
    if (!typeForm.capacity || parseInt(typeForm.capacity) < 1) { toast.error('Capacity must be at least 1'); return; }
    if (!typeForm.base_price || parseFloat(typeForm.base_price) <= 0) { toast.error('Base price must be greater than 0'); return; }

    setSaving(true);
    try {
      const amenities = typeForm.amenities.split(',').map(a => a.trim()).filter(Boolean);
      const data = {
        name: typeForm.name.trim().toLowerCase(),
        description: typeForm.description || '',
        capacity: parseInt(typeForm.capacity),
        base_price: parseFloat(typeForm.base_price),
        amenities,
      };

      if (editing) {
        await updateRoomType(editing.id, data);
        toast.success('Room type updated successfully.');
      } else {
        await createRoomType(data);
        toast.success('Room type created successfully.');
      }
      setModal(null);
      load();
    } catch (e) {
      const errors = e.response?.data;
      if (errors && typeof errors === 'object') {
        const msg = Object.entries(errors).map(([k, v]) =>
          k === 'non_field_errors' ? v : `${k}: ${Array.isArray(v) ? v.join(', ') : v}`
        ).join('; ');
        toast.error(msg);
      } else {
        toast.error('Failed to save room type.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room? This action cannot be undone.')) return;
    try {
      await deleteRoom(id);
      toast.success('Room deleted successfully.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Cannot delete room with existing reservations.');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    setDeletingImage(true);
    try {
      await deleteRoomImage(editing.id, imageId);
      toast.success('Image deleted successfully.');
      setEditing(prev => ({ ...prev, images: prev.images.filter(img => String(img.id) !== String(imageId)) }));
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete image.');
    } finally {
      setDeletingImage(false);
    }
  };

  const saveImage = async () => {
    if (!imageFile) { toast.error('Please select an image file.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('is_primary', (editing.images?.length === 0).toString());
      fd.append('order', editing.images?.length || 0);
      await uploadRoomImage(editing.id, fd);
      toast.success('Image uploaded successfully.');
      setImageFile(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Upload failed. Check file size and format.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (roomImages.length >= 5) { toast.error('Maximum 5 images per room'); return; }
    setRoomImages(prev => [...prev, file]);
    toast.success(`Image ${roomImages.length + 1} added`);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const filtered = filterType ? rooms.filter(r => r.room_type?.name === filterType) : rooms;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>Room Management</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 2 }}>Manage rooms and room types</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={openAddType}>+ Add Room Type</button>
          <button className="btn btn-primary" onClick={openAddRoom}>+ Add Room</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 20, borderBottom: '2px solid var(--gray-100)' }}>
        {[['rooms', 'Rooms'], ['types', 'Room Types']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 20px', border: 'none', background: 'none', fontSize: '0.875rem',
            fontWeight: 600, cursor: 'pointer',
            color: tab === key ? 'var(--blue)' : 'var(--gray-400)',
            borderBottom: tab === key ? '2px solid var(--blue)' : '2px solid transparent',
            marginBottom: -2, transition: 'color 0.2s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Rooms Tab */}
      {tab === 'rooms' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {['', ...roomTypes.map(t => t.name)].map(type => (
              <button key={type || 'all'} onClick={() => setFilterType(type)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s',
                background: filterType === type ? 'var(--blue)' : 'var(--gray-100)',
                color: filterType === type ? 'white' : 'var(--gray-600)',
              }}>
                {type || 'All'}
              </button>
            ))}
          </div>

          <div className="card">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏨</div>
                <p>{filterType ? 'No rooms for this type.' : 'No rooms yet. Click "+ Add Room" to get started.'}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Room No.</th><th>Type</th><th>Floor</th>
                      <th>Status</th><th>Price/Night</th><th>Images</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id}>
                        <td><span style={{ fontWeight: 700 }}>{r.room_number}</span></td>
                        <td><span style={{ textTransform: 'capitalize' }}>{r.room_type?.name}</span></td>
                        <td>Floor {r.floor}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td>PHP {Number(r.room_type?.base_price).toLocaleString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline"
                            onClick={() => { setEditing(r); setModal('images'); }}>
                            📷 {r.images?.length || 0}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-outline" onClick={() => openEditRoom(r)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRoom(r.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Room Types Tab */}
      {tab === 'types' && (
        <div className="card">
          {roomTypes.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏷️</div>
              <p>No room types yet. Click "+ Add Room Type" to create one.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Capacity</th><th>Base Price</th><th>Amenities</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {roomTypes.map(t => (
                  <tr key={t.id}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{t.name}</td>
                    <td>Up to {t.capacity} guests</td>
                    <td>PHP {Number(t.base_price).toLocaleString()}/night</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{(t.amenities || []).join(', ') || '—'}</td>
                    <td><button className="btn btn-sm btn-outline" onClick={() => openEditType(t)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {(modal === 'addRoom' || modal === 'editRoom') && (
        <Modal title={modal === 'addRoom' ? 'Add New Room' : 'Edit Room'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Room Number <span style={{ color: 'red' }}>*</span></label>
              <input placeholder="e.g. 101" value={roomForm.room_number}
                onChange={e => setRoomForm(f => ({ ...f, room_number: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Room Type <span style={{ color: 'red' }}>*</span></label>
              <select value={roomForm.room_type}
                onChange={e => setRoomForm(f => ({ ...f, room_type: e.target.value }))}>
                <option value="">Select room type</option>
                {roomTypes.map(t => (
                  <option key={t.id} value={String(t.id)} style={{ textTransform: 'capitalize' }}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Floor <span style={{ color: 'red' }}>*</span></label>
              <input type="number" min={1} placeholder="1" value={roomForm.floor}
                onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={roomForm.status}
                onChange={e => setRoomForm(f => ({ ...f, status: e.target.value }))}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {modal === 'addRoom' && (
              <div className="form-group">
                <label>Room Images (Optional, max 5)</label>
                <input type="file" accept="image/*" onChange={handleAddImage}
                  style={{ padding: 8, marginBottom: 8 }} disabled={roomImages.length >= 5} />
                {roomImages.length > 0 && (
                  <div>
                    <small style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>
                      Selected: {roomImages.length}/5 — First image will be set as primary
                    </small>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {roomImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`}
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--gray-200)' }} />
                          {idx === 0 && (
                            <div style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(30,95,168,0.85)', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 3 }}>
                              Primary
                            </div>
                          )}
                          <button onClick={() => removeImage(idx)} style={{
                            position: 'absolute', top: -6, right: -6, background: 'var(--danger)',
                            color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18,
                            cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={saveRoom} disabled={saving}>
                {saving ? 'Saving...' : (modal === 'addRoom' ? 'Create Room' : 'Update Room')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Room Type Modal */}
      {(modal === 'addType' || modal === 'editType') && (
        <Modal title={modal === 'addType' ? 'Add Room Type' : 'Edit Room Type'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Type Name <span style={{ color: 'red' }}>*</span></label>
              <input placeholder="e.g. Standard, Deluxe, Suite, Family Room"
                value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} />
              <small style={{ color: 'var(--gray-400)', fontSize: '0.72rem' }}>Any custom room type name</small>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Optional description of this room type"
                value={typeForm.description} onChange={e => setTypeForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Capacity (guests) <span style={{ color: 'red' }}>*</span></label>
                <input type="number" min={1} value={typeForm.capacity}
                  onChange={e => setTypeForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Base Price (PHP) <span style={{ color: 'red' }}>*</span></label>
                <input type="number" min={0} step="0.01" placeholder="0.00" value={typeForm.base_price}
                  onChange={e => setTypeForm(f => ({ ...f, base_price: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Amenities (comma separated)</label>
              <input placeholder="WiFi, TV, Air Conditioning, Mini Bar"
                value={typeForm.amenities} onChange={e => setTypeForm(f => ({ ...f, amenities: e.target.value }))} />
              <small style={{ color: 'var(--gray-400)', fontSize: '0.72rem' }}>Separate multiple amenities with commas</small>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={saveType} disabled={saving}>
                {saving ? 'Saving...' : (modal === 'addType' ? 'Create Type' : 'Update Type')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Image Management Modal */}
      {modal === 'images' && editing && (
        <Modal title={`Images — Room ${editing.room_number}`} onClose={() => { setModal(null); setImageFile(null); }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Current Images ({(editing.images || []).length}/5)
            </div>
            {(editing.images || []).length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No images yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {editing.images.map(img => (
                  <div key={img.id} style={{ position: 'relative', width: 110, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={img.image} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                    {img.is_primary && (
                      <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(30,95,168,0.85)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 3 }}>
                        Primary
                      </div>
                    )}
                    <button onClick={() => handleDeleteImage(img.id)} disabled={deletingImage}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Upload New Image
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                style={{ padding: 8 }} disabled={(editing.images || []).length >= 5} />
              {(editing.images || []).length >= 5 && (
                <small style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>
                  Maximum 5 images reached. Delete one to upload more.
                </small>
              )}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={saveImage} disabled={saving || !imageFile || (editing.images || []).length >= 5}>
              {saving ? 'Uploading...' : '⬆ Upload Image'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}