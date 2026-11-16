import React, { useState, useEffect, useRef } from 'react';
import { queueApi } from '../api/queueApi';

const DisplayBoardPage = () => {
  const [boardData, setBoardData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const prevServingRef = useRef({});

  const fetchBoard = async () => {
    try {
      const data = await queueApi.getDisplayBoard();
      setBoardData(data);

      // Check if any service's currently serving token changed
      data.forEach(item => {
        const prev = prevServingRef.current[item.serviceId];
        if (prev && item.currentlyServingToken && prev !== item.currentlyServingToken) {
          playChime();
        }
        if (item.currentlyServingToken) {
          prevServingRef.current[item.serviceId] = item.currentlyServingToken;
        }
      });
    } catch (err) {
      console.error('Error fetching display board:', err);
    } finally {
      setLoading(false);
    }
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio not allowed', e);
    }
  };

  useEffect(() => {
    fetchBoard();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const poller = setInterval(fetchBoard, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, []);

  return (
    <div className="display-board-screen d-flex flex-column justify-content-between">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-50 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-3 fs-3">
            <i className="bi bi-display-fill"></i>
          </div>
          <div>
            <h2 className="fw-extrabold text-white mb-0 tracking-wide">
              NOW SERVING <span className="text-primary">•</span> LIVE QUEUE
            </h2>
            <small className="text-secondary">Please proceed to your assigned counter when your token is called</small>
          </div>
        </div>

        <div className="text-end">
          <div className="display-6 fw-bold text-white font-monospace">
            {currentTime.toLocaleTimeString()}
          </div>
          <span className="badge bg-success-subtle text-success small">
            <span className="spinner-grow spinner-grow-sm me-1" role="status"></span>
            LIVE BROADCAST
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container-fluid px-0 flex-grow-1">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="text-secondary mt-3">Connecting to queue feed...</p>
          </div>
        ) : (
          <div className="row g-4">
            {boardData.map((item) => (
              <div key={item.serviceId} className="col-md-6 col-xl-3">
                <div className={`display-counter-card h-100 ${item.currentlyServingToken ? 'active-serving' : ''}`}>
                  {/* Service Header */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary fs-6 px-3 py-1 rounded-pill">
                      Zone {item.servicePrefix}
                    </span>
                    <span className="text-secondary small">
                      Waiting: <strong className="text-white">{item.waitingCount}</strong>
                    </span>
                  </div>

                  <h4 className="fw-bold text-white mb-3 text-truncate" title={item.serviceName}>
                    {item.serviceName}
                  </h4>

                  {/* Active Serving Box */}
                  <div className="p-3 rounded-4 bg-dark bg-opacity-75 text-center border border-secondary border-opacity-50 mb-4">
                    <small className="text-uppercase text-secondary fw-bold d-block mb-1" style={{ fontSize: '0.75rem' }}>
                      NOW CALLING
                    </small>
                    <div className="display-big-token">
                      {item.currentlyServingToken || '---'}
                    </div>
                    <div className="badge bg-primary bg-opacity-25 text-info px-3 py-1 rounded-pill mt-2">
                      {item.counterName || 'Waiting Room'}
                    </div>
                  </div>

                  {/* Next in Line */}
                  <div>
                    <small className="text-uppercase text-secondary fw-bold d-block mb-2" style={{ fontSize: '0.72rem' }}>
                      NEXT IN QUEUE
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {item.nextWaitingTokens && item.nextWaitingTokens.length > 0 ? (
                        item.nextWaitingTokens.map((nextTok, idx) => (
                          <span
                            key={idx}
                            className="badge bg-secondary bg-opacity-25 text-light font-monospace fs-6 px-2 py-1 rounded-3"
                          >
                            {nextTok}
                          </span>
                        ))
                      ) : (
                        <span className="text-secondary small italic">No customers waiting</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer ticker */}
      <div className="pt-4 border-top border-secondary border-opacity-50 text-center text-secondary small">
        <i className="bi bi-info-circle me-1"></i> Keep your digital ticket open on your smartphone for real-time vibration alerts.
      </div>
    </div>
  );
};

export default DisplayBoardPage;
