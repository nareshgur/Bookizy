const express = require("express");
const router = express.Router();
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
    return res.status(result.status).send(result.data);
  } catch (err) {
    console.log("Error creating show:", err);
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
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error fetching shows by movie:", err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by Theatre
 */
router.get("/Show/Theatre/:theatreId", async (req, res) => {
  try {
    const result = await getShowsByTheatre(req.params.theatreId);
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error fetching shows by theatre:", err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Shows by Screen
 */
router.get("/Show/Screen/:screenId", async (req, res) => {
  try {
    const result = await getShowsByScreen(req.params.screenId);
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error fetching shows by screen:", err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Update Show
 */
router.put("/Show/:id", async (req, res) => {
  try {
    const result = await updateShow(req.params.id, req.body);
    return res.status(result.status).send(result.data.data);
  } catch (err) {
    console.log("Error updating show:", err);
    return res.status(500).send({ message: err.message });
  }
});

/**
 * Delete Show
 */
router.delete("/Show/:id", async (req, res) => {
  try {
    const result = await deleteShow(req.params.id);
    return res.status(result.status).send(result.data);
  } catch (err) {
    console.log("Error deleting show:", err);
    return res.status(500).send({ message: err.message });
  }
});


router.get("/Show/Filter", async (req, res) => {
  try {
    const { movieId, city, date } = req.query;

    if (!movieId || !city || !date) {
      return res.status(400).send({
        message: "movieId, city, and date are required"
      });
    }

    const result = await getShowsByMovieCityDate(movieId, city, date);
    return res.status(result.status).send(result.data);
  } catch (err) {
    console.log("Error fetching filtered shows:", err);
    return res.status(500).send({ message: err.message });
  }
});

// Search movies & theatres
router.get("/search", async (req, res) => {
  try {
    const { q, city } = req.query;


    console.log("Search query:", q, "City filter:", city);

    if (!q) return res.status(400).send({ message: "Search query is required" });

    const query = {
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
      .populate("theatreId", "name location");

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


    console.log(`Search found ${results.length} shows matching query "${q}"${city ? " in city " + city : ""}`);

    return res.status(200).send({ data: results });
  } catch (err) {
    console.log("Search Error:", err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});


router.get("/unified-search", async (req, res) => {
  try {
    const { q, city } = req.query;

    console.log("Unified Search Query:", q, "City:", city);

    if (!q) return res.status(400).send({ message: "Search query is required" });
    if (!city) return res.status(400).send({ message: "City is required" });

    // --- SEARCH MOVIES ---
    const movies = await Show.find({
      $or: [
        { movieName: { $regex: q, $options: "i" } },
        { movieLanguage: { $regex: q, $options: "i" } },
        { movieGenres: { $elemMatch: { $regex: q, $options: "i" } } }
      ]
    })
      .populate("theatreId", "name cityId") // Important: gives us the theatre's cityId
      .lean();

    // Filter movies ONLY from the provided cityId
    const filteredMovies = movies.filter(
      (m) => m.theatreId && m.theatreId.cityId.toString() === city
    );

    console.log("Filtered movies details is :", filteredMovies);

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
      theatres
    });

  } catch (err) {
    console.log("Unified Search Error:", err);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
});




module.exports = router;
