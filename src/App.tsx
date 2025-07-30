import { useEffect, useState } from 'react'
import { api } from './api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57']

function App() {
  const [gamesByGenre, setGamesByGenre] = useState<{ genre: string; count: number }[]>([])
  const [topRatedGames, setTopRatedGames] = useState<{ name: string; rating: number }[]>([])
  const [creators, setCreators] = useState([])
  const [platforms, setPlatforms] = useState([])

  useEffect(() => {
    api.get('/games').then((res) => {
      const genreCount: Record<string, number> = {}
      const sortedByRating = [...res.data]
        .sort((a: any, b: any) => b.rating - a.rating)
        .slice(0, 5)
        .map((game: any) => ({
          name: game.name,
          rating: game.rating
        }))

      res.data.forEach((game: any) => {
        game.genres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      })

      const genreData = Object.entries(genreCount).map(([genre, count]) => ({
        genre,
        count
      }))

      setGamesByGenre(genreData)
      setTopRatedGames(sortedByRating)
    })

    api.get('/creators').then((res) => {
      const data = res.data
        .sort((a: any, b: any) => b.rating - a.rating)
        .slice(0, 5)
        .map((creator: any) => ({
          name: creator.name,
          rating: creator.rating
        }))
      setCreators(data)
    })

    api.get('/platforms').then((res) => {
      const data = res.data.map((p: any) => ({
        name: p.name,
        exclusives: p.exclusive_count
      }))
      setPlatforms(data)
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
                label
              >
                {creators.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
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
              <Line type="monotone" dataKey="exclusives" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
