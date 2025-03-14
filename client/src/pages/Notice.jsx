import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useNavigate } from 'react-router-dom';
const baseURL = process.env.REACT_APP_BASE_URL;

// Notice Component with Toast
const Notice = ({ fetchNotices }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    date: '',
    gender: 'all',
    price: '',
    location: '',  // Added for location
    jobType: '',   // Added for job type
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
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

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showToastMessage('Iltimos, avval tizimga kiring', 'danger');
      navigate('/auth/login');
      return;
    }

    const data = {
      description: formData.description,
      date: formData.date,
      gender: formData.gender,
      price: parseFloat(formData.price),
      location: formData.location,   // Added for location
      jobType: formData.jobType,     // Added for job type
    };

    try {
      const response = await fetch(`${baseURL}/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        showToastMessage("Eʼlon muvaffaqiyatli joylandi!");
        setFormData({
          description: '',
          date: '',
          gender: 'male',
          price: '',
          location: '',  // Reset location
          jobType: '',   // Reset job type
        });
        fetchNotices();
        handleClose();
      } else {
        showToastMessage(result.error || 'Xatolik yuz berdi', 'danger');
      }
    } catch (error) {
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow} className="mb-3">
        E'lon joylash
      </Button>
      
      <ToastContainer position="top-center" className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant}
          text={toastVariant === 'dark' ? 'white' : 'dark'}
        >
          <Toast.Header>
            <strong className="me-auto">Xabar</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>E'lon qo'shish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="price" className="form-label">Ish haqi</label>
                <input
                  type="number"
                  placeholder='So`m'
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
              <div className="col-md-4">
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

  
                <div className="col-md-4 mb-3">
                  <label htmlFor="location" className="form-label">Manzil</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="Manzilni kiriting"
                    required
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="jobType" className="form-label">Ish turi</label>
                  <select
                    className="form-select"
                    id="jobType"
                    name="jobType"
                    value={formData.jobType || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Ish turini tanlang</option>
                    <option value="fullTime">Yuk tashish</option>
                    <option value="partTime">Tozalash</option>
                    <option value="contract">Dala ishlari</option>  
                    <option value="temporary">Qurilish</option>
                    <option value="freelance">Online</option>
                  </select>
                </div>
              </div>

            <div className="col-md-12">
              <label htmlFor="description" className="form-label">Tavsif</label>
              <textarea
                className="form-control"
                placeholder='Ish haqida batafsil ma`lumot (davomiylik,manzil va qo`shimcha raqam...)'
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </form>
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
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const navigate = useNavigate();

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const fetchNotices = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/notice`, {
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
        showToastMessage('E\'lonlarni yuklashda xatolik', 'danger');
      }
    } catch (error) {
      console.error('Server error:', error);
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteClick = (noticeId) => {
    setSelectedNoticeId(noticeId);
    setShowFeedbackModal(true);
  };

  const handleFeedback = async (wasHelpful) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/notice/${selectedNoticeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wasHelpful: wasHelpful })
      });

      if (response.ok) {
        setNotices(notices.filter(notice => notice.id !== selectedNoticeId));
        setShowFeedbackModal(false);
        setSelectedNoticeId(null);
        showToastMessage('E\'lon muvaffaqiyatli o\'chirildi');
      } else {
        console.error('Error deleting notice');
        showToastMessage('E\'lonni o\'chirishda xatolik', 'danger');
      }
    } catch (error) {
      console.error('Server error:', error);
      showToastMessage('Server bilan bogʻlanishda xatolik', 'danger');
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
      
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant}
          text={toastVariant === 'dark' ? 'white' : 'dark'}
        >
          <Toast.Header>
            <strong className="me-auto">Xabar</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
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
                <span>Manzil:<strong> {notice.jobType} </strong></span>
                <span>Ish turi <strong> {notice.location} </strong> </span>
              </div>             
              <div className="d-flex card-footer justify-content-between">
                <span>Telefon:<strong> {notice.phone_number} </strong></span>
                <span>Ish haqi: <strong> {notice.price} </strong> </span>
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Status: <strong className={getStatusClass(notice.status)}>{getStatusText(notice.status)}</strong></span>
                <button 
                  className='btn btn-danger'
                  onClick={() => handleDeleteClick(notice.id)}
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
          Ushbu platforma sizga yordam berdimi?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => handleFeedback(false)}
          >
            Yo'q
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleFeedback(true)}
          >
            Ha
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;