import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    country: '',
    cityType: '',
    age: '',
    name: ''
  });
  const [countries, setCountries] = useState([]);
  const [cityTypes, setCityTypes] = useState([
    "Capital", "County seat", "City", "Village"
  ]);

  useEffect(() => {
    fetch('/api/countries')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        const names = data.map(c => c.name).filter(Boolean).sort();
        setCountries(names);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStart = async () => {
    try {
      const response = await fetch('/api/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Failed to send form data');
      
      const result = await response.json();
      console.log('Backend response:', result);

      navigate('/media', { state: form });
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="form-section">
          <select name="country" value={form.country} onChange={handleChange}>
            <option value="">Choose country</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select name="cityType" value={form.cityType} onChange={handleChange}>
            <option value="">Settlement type</option>
            {cityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Age"
          />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        <div className="start-section">
          <button onClick={handleStart}>Start</button>
        </div>
      </div>

      <footer className="footer">Media@detective</footer>
    </div>
  );
}
