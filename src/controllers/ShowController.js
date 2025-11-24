const express = require("express");
const router = express.Router();

const {
  CreateShow,
  getShowsByCity,
  getShowsByMovie,
  getShowsByTheatre,
  getShowsByScreen,
  updateShow,
  deleteShow,
} = require("../services/ShowService");
const { getMoviesByCity } = require("../services/MovieSearchService");

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

module.exports = router;
