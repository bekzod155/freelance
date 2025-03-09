import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

// Notice Component (unchanged)
const Notice = ({ fetchNotices }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    date: '',
    gender: 'all',
    phone: '',
    price: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Iltimos, avval tizimga kiring');
      navigate('/auth/login');
      return;
    }

    const data = {
      description: formData.description,
      date: formData.date,
      gender: formData.gender,
      phone_number: formData.phone,
      price: parseFloat(formData.price),
    };

    try {
      const response = await fetch('http://localhost:5000/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage("Eʼlon muvaffaqiyatli joylandi!");
        setFormData({
          description: '',
          date: '',
          gender: 'male',
          phone: '',
          price: '',
        });
        fetchNotices();
        handleClose();
      } else {
        setMessage(result.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      setMessage('Server bilan bogʻlanishda xatolik');
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="mb-3">
        E'lon joylash
      </Button>
      
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>E'lon qo‘shish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Telefon</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998901234567"
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="date" className="form-label">Sana</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Jins</label><br />
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="all"
                    name="gender"
                    value="all"
                    checked={formData.gender === 'all'}
                    onChange={handleChange}
                  />
                  <label htmlFor="all" className="form-check-label">Hammasi</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="male"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="male" className="form-check-label">Erkak</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    id="female"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                  />
                  <label htmlFor="female" className="form-check-label">Ayol</label>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="price" className="form-label">Narx</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="col-md-12">
              <label htmlFor="description" className="form-label">Tavsif</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </form>
          {message && <div className="text-center mt-2">{message}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Yopish
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Joylash
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const App = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null); // Stores the ID of the notice to be deleted
  const navigate = useNavigate();

  const fetchNotices = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/notice', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setNotices(data);
      } else {
        console.error('Error fetching notices:', data.error);
      }
    } catch (error) {
      console.error('Server error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When delete button is clicked, store the notice ID and show modal
  const handleDeleteClick = (noticeId) => {
    setSelectedNoticeId(noticeId); // Set the ID of the notice to be deleted
    setShowFeedbackModal(true);
  };

  // Handle feedback and delete the notice with the stored ID
  const handleFeedback = async (wasHelpful) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      // Use selectedNoticeId in the URL to identify which notice to delete
      const response = await fetch(`http://localhost:5000/notice/${selectedNoticeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wasHelpful: wasHelpful }) // Send feedback value
      });

      if (response.ok) {
        // Remove the notice with the matching ID from the state
        setNotices(notices.filter(notice => notice.id !== selectedNoticeId));
        setShowFeedbackModal(false);
        setSelectedNoticeId(null); // Clear the selected ID
      } else {
        console.error('Error deleting notice');
      }
    } catch (error) {
      console.error('Server error:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'process':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      case 'denied':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'process':
        return 'Koʻrib chiqilmoqda...';
      case 'completed':
        return 'Joylandi';
      case 'denied':
        return 'Rad etilgan';
      default:
        return 'Nomaʼlum';
    }
  };

  return (
    <div className="container mt-2 d-flex flex-column justify-content-center align-items-center">
      <Notice fetchNotices={fetchNotices} />
      {loading ? (
        <p>Loading...</p>
      ) : notices.length === 0 ? (
        <h5>Hozircha e'lon yo'q</h5>
      ) : (
        <div id='cardContainer' className="w-100">
          {notices.map((notice) => (
            <div id='shadow' key={notice.id} className="card border-primary bg-body rounded mb-3">
              <div className="d-flex card-header justify-content-between mb-2">
                <span><strong>{notice.user_name}</strong></span>
                <span>E'lon sanasi: <strong> {new Date(notice.created_at).toLocaleDateString("en-GB")} </strong> </span>
              </div>
              <div className="card-body mb-2">
                <textarea
                  className="form-control"
                  value={notice.description}
                  readOnly
                  rows="3"
                />
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Ish tugash vaqti: <strong> {new Date(notice.date).toLocaleDateString("en-GB")} </strong> </span>
                <span>Jins: <strong> {notice.gender === 'male' ? 'Erkak' : notice.gender === 'female' ? 'Ayol' : 'Hamma'}</strong></span>
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Telefon:<strong> {notice.phone_number} </strong></span>
                <span>Narx: <strong> {notice.price} </strong> so'm</span>
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Status: <strong className={getStatusClass(notice.status)}>{getStatusText(notice.status)}</strong></span>
                <button 
                  className='btn btn-danger'
                  onClick={() => handleDeleteClick(notice.id)} // Pass the notice ID here
                >
                  <i className="bi bi-trash"></i> O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        show={showFeedbackModal} 
        onHide={() => setShowFeedbackModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Fikr-mulohaza</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ushbu frilans platformasi sizga yordam berdimi?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => handleFeedback(false)} // Delete with false feedback
          >
            Yo'q
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleFeedback(true)} // Delete with true feedback
          >
            Ha
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;