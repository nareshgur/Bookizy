const {
  searchMovies,
  getMoviesByCity,
} = require("../services/MovieSearchService");
const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();

router.get("/Movie/search", async (req, res) => {
  try {
    const query = req.query.q;
    logger.info("Movie search request", { query });
    const result = await searchMovies(query);
    logger.info("Movie search results", { query, count: result.data?.length || 0 });
    return res.status(200).send(result.data);
  } catch (err) {
    logger.error("Movie search error", { query: req.query.q, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

router.get("/Movies/City/:city", async (req, res) => {
  try {
    logger.info("Fetching movies by city", { city: req.params.city });
    const result = await getMoviesByCity(req.params.city);
    logger.info("Movies by city retrieved", { city: req.params.city, count: result.data?.length || 0 });
    return res.status(200).send(result.data);
  } catch (err) {
    logger.error("Error fetching movies by city", { city: req.params.city, error: err.message });
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
