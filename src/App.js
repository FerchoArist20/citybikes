import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';
import ReactPaginate from 'react-paginate';

function App() {
  // useState: Hook de react para manejar el estado del componente
  const [data, setData] = useState([])
  const [company, setCompany] = useState('')
  const [companyData, setCompanyData] = useState()
  const [emptyStations, setEmptyStations] = useState(0)
  const [stations, setStations]= useState([])
  const [stationsOnView, setStationsOnView]= useState([])
  const [freeBikes, setFreeBikes] = useState(0)
  const items_per_view = 6
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  // beforemount
  // UseEffect Hook le permite realizar efectos secundarios al componente
  useEffect(function () {
    fetchData()
  }, [company])

  const fetchData = async () => {
    if (!!!company) {
      console.log('if');
      const response = await axios.get('https://api.citybik.es/v2/networks/')
      setData(response.data.networks)
    } else {
      console.log('else');
      setEmptyStations(0)
      //contador de los slots.empty
      const response = await axios.get(`https://api.citybik.es${company}`)
      setStations(response.data.network.stations)
      const endOffset = itemOffset + items_per_view;
      console.log(`Loading items from ${itemOffset} to ${endOffset}`);
      setPageCount(Math.ceil(stations.length / items_per_view));
      stations.map(station => {
        setEmptyStations(prevCounter => prevCounter + station.empty_slots)
        setFreeBikes(prevCounter => prevCounter + station.free_bikes)
      })  
      setStationsOnView(stations.slice(0, items_per_view))
      setCompanyData(response.data.network)
    }
  }
  
  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + items_per_view;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setStationsOnView(stations.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(stations.length / items_per_view));
  }, [itemOffset]);

  const cambioCompany = (e) => {
    setCompany(e.target.value)
  }

  const isoDateFormat = (isoDate) => {
    let date = new Date(isoDate);
    return date.toISOString().substring(0, 10);
  }

  const handlePageClick = (event) => {
    const newOffset = (event.selected * items_per_view) % data.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  }

  return (
    //jsx
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
          <div className='buttons-pagination'>

      <ReactPaginate
        breakLabel="..."
        className='buttons'
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={6}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
        />

      </div>
          <ol>
            {stationsOnView && stationsOnView.map(station => (
              <li key={station.id}>
                <h3>Nombre: {station.name}</h3>
                <h3>Fecha de actualiz ación: {isoDateFormat(station.timestamp)}</h3>
                <h3>Bicicletas libres: {station.free_bikes === null ? 'No hay Información' : station.free_bikes}</h3>
                <h3>Espacios libres: {station.empty_slots === null ? 'No hay Información' : station.empty_slots}</h3>
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
              <h2>Nombre de la red: {companyData.name ?? ''}</h2>
              <h2>Nombre de la empresa: {companyData.company[0] ?? ''}</h2>
              <h2>Pais: {companyData.location.country ?? ''}</h2>
              <h2>Total bicicletas libres: {freeBikes ?? ''}</h2>
              <h2>Total de espacios libres: {emptyStations ?? ''}</h2>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;
