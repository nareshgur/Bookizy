// services/MovieSearchService.js
const axios = require("axios");
const Show = require("../models/Show");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

exports.searchMovies = async (query) => {
  if (!query) throw new Error("Search query is required");

  // 1. Search TMDB by movie name
  const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
    params: { api_key: TMDB_API_KEY, query },
  });

  const tmdbMovies = tmdbRes.data.results || [];

  if (tmdbMovies.length === 0) {
    return { status: 200, data: [] }; // no movies found
  }

  // Extract TMDB movieIds
  const movieIds = tmdbMovies.map((m) => m.id);

  // 2. Check which movies exist in our Show collection
  const shows = await Show.find({ movieId: { $in: movieIds } });

  // Group shows by movieId
  const showsByMovie = {};
  shows.forEach((s) => {
    if (!showsByMovie[s.movieId]) showsByMovie[s.movieId] = [];
    showsByMovie[s.movieId].push(s);
  });

  // 3. Attach showtimes to TMDB movies
 const finalMovies = tmdbMovies
    .filter((movie) => showsByMovie[movie.id])
    .map((movie) => ({
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      overview: movie.overview,
      releaseDate: movie.release_date,
      shows: showsByMovie[movie.id] || [],
    }));

  return { status: 200, data: finalMovies };
};


exports.getMoviesByCity = async (city) => {
  const shows = await Show.find({ city });

  if (shows.length === 0)
    return { status: 200, data: [] };

  const uniqueMovies = {};

  shows.forEach(show => {
    if (!uniqueMovies[show.movieId]) {
      uniqueMovies[show.movieId] = {
        movieId: show.movieId,
        movieName: show.movieName,
        moviePoster: show.moviePoster,
        movieGenres: show.movieGenres,
        movieLanguage: show.movieLanguage,
        movieRating: show.movieRating
      }
    }
  });

  return {
    status: 200,
    data: Object.values(uniqueMovies)
  };
}

