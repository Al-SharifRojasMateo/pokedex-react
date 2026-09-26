import axios from 'axios'
import './App.css'
import pokemonLogo from './assets/Pokemon-Logo-PNG-Transparent-Image-1358767904.png'
import { useState, useEffect } from 'react'

const typeColors = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

const genRanges = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
}

function getIdFromUrl(url) {
  const parts = url.split('/').filter(Boolean)
  return parts[parts.length - 1]
}

function App() {
  const [value, setValue] = useState()
  const [pokeList, setPokeList] = useState([])
  const [pokemon, setPokemon] = useState()
  const [selectedGen, setSelectedGen] = useState(1)
  const [typeCache, setTypeCache] = useState({})

  const url = `http://pokeapi.co/api/v2/pokemon/${pokemon}`

  // Fetch full Pokémon list once on mount
  useEffect(() => {
    axios.get('http://pokeapi.co/api/v2/pokemon?limit=1302&offset=0')
      .then((response) => {
        setPokeList(response.data.results)
      })
  }, [])

  function buttonHandle() {
    axios.get(url).then((response) => {
      setValue(response.data)
      console.log(response.data)
    })
  }

  function handleInputChange(event) {
    setPokemon(event.target.value)
  }

  function handlePokeClick(name) {
    axios.get(`http://pokeapi.co/api/v2/pokemon/${name}`).then((response) => {
      setValue(response.data)
    })
    setPokemon('')
  }

  // Filter by search text if typing, otherwise by selected generation
  const filteredList = pokeList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().startsWith(pokemon?.toLowerCase() || '')

    if (pokemon && pokemon.length > 0) {
      return matchesSearch
    }

    const id = parseInt(getIdFromUrl(p.url))
    const [min, max] = genRanges[selectedGen]
    const inGenRange = id >= min && id <= max
    return inGenRange
  })

  // Fetch and cache types for whatever's currently visible
  useEffect(() => {
    filteredList.forEach((p) => {
      setTypeCache((prev) => {
        if (prev[p.name]) return prev
        axios.get(p.url).then((response) => {
          setTypeCache((current) => ({
            ...current,
            [p.name]: response.data.types.map((t) => t.type.name)
          }))
        })
        return prev
      })
    })
  }, [filteredList])

  return (
    <div className='pokedex_card'>
      <div className='poke_header'>
        <img src={pokemonLogo} alt="pokemon logo" className='poke_logo' />
        <div className='poke_search_group'>
          <input
            type="text"
            className='poke_input'
            placeholder='Enter Pokemon'
            value={pokemon}
            onChange={handleInputChange}
          />
          <button className='poke_button' onClick={buttonHandle}>Fetch Pokemon</button>
        </div>
      </div>

      <div className='poke_all'>
        <div className='poke_list'>
          {filteredList.map((p) => {
            const id = getIdFromUrl(p.url)
            const types = typeCache[p.name] || []
            return (
              <div
                key={p.name}
                className='poke_list_item'
                onClick={() => handlePokeClick(p.name)}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                  alt={p.name}
                  className='poke_list_sprite'
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                  }}
                />
                <span>#{id} {p.name}</span>
                <div className='poke_types'>
                  {types.map((t) => (
                    <span
                      key={t}
                      className='poke_type_badge'
                      style={{ backgroundColor: typeColors[t] || '#777' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className='poke_gen_sidebar'>
          {Object.keys(genRanges).map((gen) => (
            <button
              key={gen}
              className={`poke_gen_button ${selectedGen === Number(gen) ? 'active' : ''}`}
              onClick={() => setSelectedGen(Number(gen))}
            >
              Gen {gen}
            </button>
          ))}
        </div>

        <div className='poke_detail'>
          <div className='poke_detail_img'>
            {value?.id && (
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value.id}.png`}
                alt='pokemon sprites'
              />
            )}
          </div>
          <div className='poke_detail_info'>
            <p>Pokemon name: {value?.name}</p>
            <p>Pokemon ID: {value?.id}</p>
            <p>Weight: {value?.weight} Height: {value?.height}</p>
            <div className='poke_types'>
              <p>Type/s:</p>
              {value?.types?.map((t) => (
                <span
                  key={t.type.name}
                  className='poke_type_badge'
                  style={{ backgroundColor: typeColors[t.type.name] || '#777' }}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='poke_footer'>
        <p><b>Project By:</b> Al-Sharif H. Rojas Mateo BSCS-2A</p>
      </div>
    </div>
  )
}

export default App