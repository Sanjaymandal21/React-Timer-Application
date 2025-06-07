import React, { useState, useEffect } from 'react';
import './styles.css'; // Optional styles for the app

export default function App() {
  const [timers, setTimers] = useState([]);
  const [newTimer, setNewTimer] = useState({ name: '', duration: '', category: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(null);

  useEffect(() => {
    const loadTimers = async () => {
      const storedTimers = await localStorage.getItem('timers');
      if (storedTimers) {
        setTimers(JSON.parse(storedTimers));
      }
    };
    loadTimers();
  }, []);

  const handleAddTimer = async () => {
    const newTimerObject = { ...newTimer, id: Date.now(), status: 'paused', remaining: parseInt(newTimer.duration) };
    const updatedTimers = [...timers, newTimerObject];
    setTimers(updatedTimers);
    await localStorage.setItem('timers', JSON.stringify(updatedTimers));
    setNewTimer({ name: '', duration: '', category: '' });
  };

  const handleStart = (id) => {
    setTimers(timers.map((timer) =>
      timer.id === id ? { ...timer, status: 'running' } : timer
    ));
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((timer) => {
          if (timer.id === id && timer.status === 'running') {
            if (timer.remaining <= 1) {
              clearInterval(interval);
              setIsModalVisible(true);
              setSelectedTimer(timer);
              return { ...timer, status: 'completed', remaining: 0 };
            }
            return { ...timer, remaining: timer.remaining - 1 };
          }
          return timer;
        });
        localStorage.setItem('timers', JSON.stringify(updatedTimers));
        return updatedTimers;
      });
    }, 1000);
  };

  const handlePause = (id) => {
    setTimers(timers.map((timer) =>
      timer.id === id ? { ...timer, status: 'paused' } : timer
    ));
  };

  const handleReset = (id) => {
    setTimers(timers.map((timer) =>
      timer.id === id ? { ...timer, remaining: parseInt(timer.duration), status: 'paused' } : timer
    ));
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTimer(null);
  };

  return (
    <div className="container">
      <h1 className="header">React Timer App</h1>
      <input
        className="input"
        placeholder="Timer Name"
        value={newTimer.name}
        onChange={(e) => setNewTimer({ ...newTimer, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Duration in seconds"
        value={newTimer.duration}
        onChange={(e) => setNewTimer({ ...newTimer, duration: e.target.value })}
      />
      <input
        className="input"
        placeholder="Category"
        value={newTimer.category}
        onChange={(e) => setNewTimer({ ...newTimer, category: e.target.value })}
      />
      <button className="button" onClick={handleAddTimer}>Add Timer</button>

      <div className="timer-list">
        {timers.map((item) => (
          <div key={item.id} className="timer">
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>Status: {item.status}</p>
            <p>Remaining: {item.remaining} sec</p>
            <progress value={item.remaining / parseInt(item.duration)} max={1}></progress>
            <div className="buttons">
              <button onClick={() => handleStart(item.id)} disabled={item.status === 'running'}>Start</button>
              <button onClick={() => handlePause(item.id)} disabled={item.status !== 'running'}>Pause</button>
              <button onClick={() => handleReset(item.id)}>Reset</button>
            </div>
          </div>
        ))}
      </div>

      {isModalVisible && (
        <div className="modal">
          <p className="modal-text">Congratulations! {selectedTimer?.name} is complete!</p>
          <button onClick={handleCloseModal}>Close</button>
        </div>
      )}
    </div>
  );
}

