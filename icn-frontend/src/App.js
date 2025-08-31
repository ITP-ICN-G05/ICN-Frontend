import './App.css';
import { useEffect, useState } from 'react';
import api from './api';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/hello').then(res => setMsg(res.data)).catch(console.error);
  }, []);

  return <div style={{padding:16}}>Backend says: {msg || 'loading...'}</div>;
}

export default App;
