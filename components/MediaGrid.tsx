// components/MovieGrid.tsx
import MovieCard from './MovieCard'

interface MovieGridProps {
  movies: any[]
  title?: string
}

export default function MovieGrid({ movies, title }: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-20 border border-white/10 rounded-xl bg-card/50">
        <p className="text-white/40 font-medium italic">No movies discovered in this section</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic border-l-4 border-primary pl-4">
            {title}
          </h2>
          <button className="text-xs font-bold text-primary hover:text-white transition uppercase tracking-widest">
            View All
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}