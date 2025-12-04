const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const {Theatre} = require("../models/Theatre");
const {
  CreateShow,
  getShowsByCity,
  getShowsByMovie,
  getShowsByTheatre,
  getShowsByScreen,
  updateShow,
  getShowsByMovieCityDate,  
  deleteShow,
} = require("../services/ShowService");
const { getMoviesByCity } = require("../services/MovieSearchService");
const Show = require("../models/Show");

/**
 * Create a Show
 */
router.post("/Show", async (req, res) => {
  try {
    const result = await CreateShow(req.body);
    logger.info("Show created successfully", { movieId: req.body.movieId, theatreId: req.body.theatreId });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error creating show", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by City
 */
// router.get("/Show/City/:city", async (req, res) => {
//   try {
//     const result = await getShowsByCity(req.params.city);
//     return res.status(result.status).send(result.data.data);
//   } catch (err) {
//     console.log("Error fetching shows by city:", err);
//     return res.status(500).send({ message: err.message });
//   }
// });
router.get("/Show/City/:city", async (req, res) => {
  try {
    const result = await getMoviesByCity(req.params.city);
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error fetching shows by city:", err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by Movie (TMDB ID)
 */
router.get("/Show/Movie/:movieId", async (req, res) => {
  try {
    const result = await getShowsByMovie(req.params.movieId);
    logger.info("Fetched shows by movie", { movieId: req.params.movieId, count: result.data.data?.length || 0 });
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    logger.error("Error fetching shows by movie", { movieId: req.params.movieId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by Theatre
 */
router.get("/Show/Theatre/:theatreId", async (req, res) => {
  try {
    const result = await getShowsByTheatre(req.params.theatreId);
    logger.info("Fetched shows by theatre", { theatreId: req.params.theatreId, count: result.data.data?.length || 0 });
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    logger.error("Error fetching shows by theatre", { theatreId: req.params.theatreId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by Screen
 */
router.get("/Show/Screen/:screenId", async (req, res) => {
  try {
    const result = await getShowsByScreen(req.params.screenId);
    logger.info("Fetched shows by screen", { screenId: req.params.screenId, count: result.data.data?.length || 0 });
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    logger.error("Error fetching shows by screen", { screenId: req.params.screenId, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Update Show
 */
router.put("/Show/:id", async (req, res) => {
  try {
    const result = await updateShow(req.params.id, req.body);
    logger.info("Show updated successfully", { showId: req.params.id });
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    logger.error("Error updating show", { showId: req.params.id, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Delete Show
 */
router.delete("/Show/:id", async (req, res) => {
  try {
    const result = await deleteShow(req.params.id);
    logger.info("Show deleted successfully", { showId: req.params.id });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error deleting show", { showId: req.params.id, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});


router.get("/Show/Filter", async (req, res) => {
  try {
    const { movieId, city, date } = req.query;
    logger.info("Show filter request received", { movieId, city, date });

    if (!movieId || !city || !date) {
      return res.status(400).send({
        message: "movieId, city, and date are required"
      });
    }

    const result = await getShowsByMovieCityDate(movieId, city, date);
    logger.info("Filtered shows fetched", { movieId, city, date, count: result.data?.length || 0 });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error fetching filtered shows", { error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

// Search movies & theatres
router.get("/search", async (req, res) => {
  try {
    const { q, city } = req.query;
    logger.info("Show search request received", { query: q, city });

    if (!q) return res.status(400).send({ message: "Search query is required" });

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const query = {
      date: { $gte: todayString }, // Only future/today's shows
      $or: [
        { movieName: { $regex: q, $options: "i" } },
        { movieLanguage: { $regex: q, $options: "i" } },
        { movieGenres: { $elemMatch: { $regex: q, $options: "i" } } }
      ]
    };

    // Optional filter if city is selected
    if (city) {
      query.city = city;
    }

    const shows = await Show.find(query)
      .populate("theatreId", "name location")
      .sort({ date: 1, startTime: 1 });

    const results = shows.map((show) => ({
      movieId: show.movieId,
      movieName: show.movieName,
      moviePoster: show.moviePoster,
      movieLanguage: show.movieLanguage,
      movieGenres: show.movieGenres,
      theatreName: show.theatreId?.name,
      theatreLocation: show.theatreId?.location,
      showId: show._id,
      screenId: show.screenId,
      city: show.city,
      startTime: show.startTime,
      date: show.date
    }));

    logger.info(`Show search found results`, { query: q, city, resultCount: results.length });
    return res.status(200).send({ data: results });
  } catch (err) {
    logger.error("Show search error", { query: req.query.q, error: err.message });
    return res.status(500).send({ message: "Internal Server Error" });
  }
});


router.get("/unified-search", async (req, res) => {
  try {
    const { q, city } = req.query;

    logger.info("Unified search request", { query: q, city });

    if (!q) return res.status(400).send({ message: "Search query is required" });
    if (!city) return res.status(400).send({ message: "City is required" });

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: "2025-12-04"

    // --- SEARCH MOVIES (with future date filter) ---
    const movies = await Show.find({
      date: { $gte: todayString }, // Only shows from today onwards
      $or: [
        { movieName: { $regex: q, $options: "i" } },
        { movieLanguage: { $regex: q, $options: "i" } },
        { movieGenres: { $elemMatch: { $regex: q, $options: "i" } } }
      ]
    })
      .populate("theatreId", "name cityId") // Important: gives us the theatre's cityId
      .lean()
      .sort({ date: 1, startTime: 1 }); // Sort by date and time ascending

    // Filter movies ONLY from the provided cityId
    const filteredMovies = movies.filter(
      (m) => m.theatreId && m.theatreId.cityId.toString() === city
    );

    logger.info("Unified search results", { query: q, city, movieCount: filteredMovies.length });

    // --- SEARCH THEATRES ---
    const theatres = await Theatre.find({
      cityId: city,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } }
      ]
    });

    return res.status(200).send({
      status: 200,
      movies: filteredMovies,
      theatres,
      message: `Found ${filteredMovies.length} upcoming movies and ${theatres.length} theatres`
    });

  } catch (err) {
    logger.error("Unified search error", { error: err.message });
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
});




module.exports = router;
