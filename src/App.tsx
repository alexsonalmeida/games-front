import { useEffect, useState } from 'react'
import { api } from './api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige ícones padrão do Leaflet
delete (L.Icon.Default as any).prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57']

function App() {
  const [gamesByGenre, setGamesByGenre] = useState<{ genre: string; count: number }[]>([])
  const [topRatedGames, setTopRatedGames] = useState<{ name: string; rating: number }[]>([])
  const [creators, setCreators] = useState<{ name: string; rating: number }[]>([])
  const [platforms, setPlatforms] = useState<{ name: string; exclusive_count: number }[]>([])
  const [mapData, setMapData] = useState<
    { name: string; local: string; games_count: number; latitude: number; longitude: number }[]
  >([])

  useEffect(() => {
    // Dashboard
    api.get('/consultas_complexas/dashboard').then((res) => {
      setGamesByGenre(res.data.gamesByGenre)
      setTopRatedGames(res.data.topRatedGames)
      setCreators(res.data.creators)
      setPlatforms(res.data.platforms)
    }).catch(err => {
      console.error('Erro ao carregar dados do dashboard:', err)
    })

    // Mapa
    api.get('/consultas_complexas/geocache').then((res) => {
      setMapData(
        Object.entries(res.data)
          .filter(([_, coords]: any) => coords[0] !== null && coords[1] !== null)
          .map(([local, [lat, lon]]: any) => ({
            name: local,
            local,
            games_count: 1,
            latitude: lat,
            longitude: lon
          }))
      )
    }).catch(err => {
      console.error('Erro ao carregar dados do geocache:', err)
    })
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Jogos por gênero */}
      <Card>
        <CardHeader>
          <CardTitle>Jogos por Gênero</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gamesByGenre}>
              <XAxis dataKey="genre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Criadores mais bem avaliados */}
      <Card>
        <CardHeader>
          <CardTitle>Criadores Mais Bem Avaliados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={creators}
                dataKey="rating"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name }) => name} // Mostra apenas o nome como label externo
              >
                {creators.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}`, 'Rating']}
                labelFormatter={(label: string) => `Criador: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      {/* Top jogos por avaliação */}
      <Card>
        <CardHeader>
          <CardTitle>Top Jogos por Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRatedGames}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Exclusivos por plataforma */}
      <Card>
        <CardHeader>
          <CardTitle>Exclusivos por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={platforms}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="exclusive_count" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mapa de desenvolvedoras */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Distribuição Global de Desenvolvedoras</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 400 }}>
          <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {mapData.map((dev, idx) => (
              <Marker key={idx} position={[dev.latitude, dev.longitude]}>
                <Popup>
                  <strong>{dev.name}</strong><br />
                  Jogos: {dev.games_count}<br />
                  Local: {dev.local}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
