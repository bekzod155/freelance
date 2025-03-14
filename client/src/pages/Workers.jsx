import React, { useState, useEffect, useRef } from 'react';
const baseURL = process.env.REACT_APP_BASE_URL;

const Workers = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all'); // New state for jobType filter
  const hasMounted = useRef(false);

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

  // Filter notices based on both gender and jobType
  const filteredNotices = notices.filter(notice => {
    const genderMatch = genderFilter === 'all' || notice.gender === genderFilter;
    const jobTypeMatch = jobTypeFilter === 'all' || notice.jobType === jobTypeFilter;
    return genderMatch && jobTypeMatch;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='d-flex flex-column justify-content-center align-items-center'>
      <div id='filter' className="pt-2 w-75 d-flex flex-row align-items-center justify-content-between  gap-2">
        {/* Gender Filter Buttons */}
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

        {/* Job Type Filter Dropdown */}
        <div className="justify-content-end">
          
          <select
            className="form-select "
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
          >
            <option value="all">Barcha ish turlari</option>
            <option value="Yuk tashish">Yuk tashish</option>
            <option value="Tozalash">Tozalash</option>
            <option value="Dala ishlari">Dala ishlari</option>  
            <option value="Qurilish">Qurilish</option>
            <option value="Online">Online</option>
          </select>
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
                <span>Ishning tugash vaqti: <strong> {new Date(notice.date).toLocaleDateString("en-GB")} </strong> </span>
                <span>Jins: <strong> {notice.gender === 'male' ? 'Erkak' : notice.gender === 'female' ? 'Ayol' : 'Hamma'}</strong></span>               
              </div>
              <div className="d-flex card-footer justify-content-between">
                <span>Manzil: <strong>{notice.location}</strong></span>
                <span>Ish turi: <strong>{notice.jobType}</strong></span>
              </div>
              <div className="d-flex card-footer justify-content-between">
              <span>Ish haqi: <strong className='text-success'> {notice.price} </strong></span>
                <a href={`tel:${notice.phone_number}`} className="text-decoration-none">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={trackCallClick}
                  >
                    <i className="bi bi-telephone-fill me-1"></i>
                    <small className=''>Telefon qilish</small>
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