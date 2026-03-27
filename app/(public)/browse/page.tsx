// app/(public)/browse/page.tsx
import { getMediaItems } from '@/lib/database'
import MovieGrid from '@/components/MovieGrid'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { type?: string; search?: string }
}) {
  try {
    // Fetch media with optional filters
    const media = await getMediaItems({
      type: searchParams.type,
      search: searchParams.search,
      limit: 50,
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 pl-4">
          <h1 className="text-4xl font-bold mb-4 pt-20">Browse All Content</h1>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <a
              href="/browse"
              className={`px-4 py-2 rounded-lg ${
                !searchParams.type
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All
            </a>
            <a
              href="/browse?type=movie"
              className={`px-4 py-2 rounded-lg ${
                searchParams.type === 'movie'
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Movies
            </a>
            <a
              href="/browse?type=tv"
              className={`px-4 py-2 rounded-lg ${
                searchParams.type === 'tv'
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              TV Shows
            </a>
          </div>
        </div>

        {/* Search Form */}
        <form className="mb-8 pl-4 pr-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search by title, director, or description..."
              defaultValue={searchParams.search}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/20 text-white rounded-lg focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {media && media.length > 0 ? (
          <div className="pl-4 pr-4">
            <p className="text-white/60 mb-4">
              Found {media.length} {media.length === 1 ? 'item' : 'items'}
            </p>
            <MovieGrid movies={media} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg mb-4">No content found</p>
            {(searchParams.type || searchParams.search) && (
              <a
                href="/browse"
                className="text-primary hover:text-accent font-medium italic underline"
              >
                Clear filters
              </a>
            )}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading content:', error)
    
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-black mb-4 text-primary uppercase italic">
          Error Loading Content
        </h1>
        <p className="text-white/60 mb-8">
          Unable to load content right now. Please try again later.
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded font-bold uppercase tracking-widest hover:bg-accent transition"
        >
          Go Home
        </a>
      </div>
    )
  }
}
