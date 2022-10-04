import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';

function App() {
  const [data, setData] = useState([])
  const [company, setCompany] = useState('')
  const [companyData, setCompanyData] = useState()
  const [emptyStations, setEmptyStations] = useState(0)
  const [freeBikes, setFreeBikes] = useState(0)

  //beforemount
  useEffect(function () {
    const fetchData = async () => {
      if (!!!company) {
        const response = await axios.get('https://api.citybik.es/v2/networks/')
        setData(response.data.networks)
      } else {
        setEmptyStations(0)
        const response = await axios.get(`https://api.citybik.es${company}`)
        response.data.network.stations.map(station => {
          setEmptyStations(prevCounter => prevCounter + station.empty_slots)
          setFreeBikes(prevCounter => prevCounter + station.free_bikes)
        })
        setCompanyData(response.data.network)
      }
    }
    fetchData()
  }, [company])

  const cambioCompany = (e) => {
    setCompany(e.target.value)
  }

  const isoDateFormat = (isoDate) => {
    let date = new Date(isoDate);
    return date.toISOString().substring(0, 10);
  }

  return (
    <div className="App">
      <div className='left-side'>
        <h3 style={{ marginRight: 10 }}>Escoge una compañia:</h3>
        <select className='select-companies' defaultValue={'default'}  onChange={cambioCompany}>
          <option value={'default'} disabled hidden>Escoge una red</option>
          {
            data && data.map(network =>
            (
              <option value={network.href} key={network.id}>
                {network.id}
              </option>
            ))
          }
        </select>
        <span>
          <h4>Estaciones:</h4>
          <ol>
            {companyData && companyData.stations.map(station => (
              <li key={station.id}>
                <h3>Nombre: {station.name}</h3>
                <h3>Fecha de actualización: {isoDateFormat(station.timestamp)}</h3>
                <h3>Bicicletas libres: {station.free_bikes}</h3>
                <h3>Espacios libres: {station.empty_slots}</h3>
                <h3>Total espacios: {station.free_bikes + station.empty_slots}</h3>
                <hr />
              </li>
            ))}

          </ol>

        </span>
      </div>
      <div className='right-side'>
        {
          companyData && (
            <div>
              <h2>Nombre de la red: {companyData.name}</h2>
              <h2>Nombre de la empresa: {companyData.company[0]}</h2>
              <h2>Pais: {companyData.location.country}</h2>
              <h2>Total bicicletas libres: {freeBikes}</h2>
              <h2>Total de espacios libres: {emptyStations}</h2>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;
