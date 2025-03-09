import React, { useState, useEffect,useRef } from 'react';
const baseURL = process.env.BASE_URL || 'http://localhost:5000';

const Workers = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');
  const hasMounted = useRef(false)

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${baseURL}/worker`);
      if (!response.ok) throw new Error('Failed to fetch notices');
      const data = await response.json();
      setNotices(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const trackCallClick = async () => {
    try {
      await fetch(`${baseURL}/stats/track-call-click`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track call click:', error.message);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true; // Mark as mounted
      fetchNotices();
    }
  }, []); // Runs once on mount

  const filteredNotices = notices.filter(notice => {
    if (genderFilter === 'all') return true;
    return notice.gender === genderFilter;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      <div className="pt-2">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${genderFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setGenderFilter('all')}
          >
            Barcha
          </button>
          <button
            type="button"
            className={`btn ${genderFilter === 'male' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setGenderFilter('male')}
          >
            Erkaklar
          </button>
          <button
            type="button"
            className={`btn ${genderFilter === 'female' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setGenderFilter('female')}
          >
            Ayollar
          </button>
        </div>
      </div>

      {filteredNotices.length === 0 ? (
        <p>Hozircha bu toifada ishlar mavjud emas</p>
      ) : (
        <div id='cardContainer' className="w-100 p-5">
          {filteredNotices.map((notice) => (
            <div id='shadow' key={notice.id} className="card border-primary bg-body rounded mb-3">
              <div className="d-flex card-header justify-content-between mb-2">
                <span><strong>{notice.user_name}</strong></span>
                <span>E'lon sanasi: <strong> {new Date(notice.created_at).toLocaleDateString("en-GB")} </strong> </span>
              </div>
              <div className="card-body mb-2">
                <textarea className="form-control" value={notice.description} readOnly rows="3" />
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Ish tugash vaqti: <strong> {new Date(notice.date).toLocaleDateString("en-GB")} </strong> </span>
                <span>Narx: <strong> {notice.price} </strong> so'm</span>
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Jins: <strong> {notice.gender === 'male' ? 'Erkak' : notice.gender === 'female' ? 'Ayol' : 'Hamma'}</strong></span>
                <a href={`tel:${notice.phone_number}`} className="text-decoration-none">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={trackCallClick}
                  >
                    <i className="bi bi-telephone-fill me-1"></i>
                    Telefon qilish
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workers;