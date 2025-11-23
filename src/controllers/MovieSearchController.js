const { searchMovies } = require("../services/MovieSearchService");
const express = require("express");
const router = express.Router();

router.get("/Movie/search", async (req, res) => {
  try {
    const query = req.query.q;
    const result = await searchMovies(query);

    return res.status(200).send(result.data);
  } catch (err) {
    console.log("Movie search failed:", err);
    return res.status(500).send({ message: err.message });
  }
});


router.get("/Movies/City/:city", async (req, res) => {
  try {
    const result = await getMoviesByCity(req.params.city);
    return res.status(200).send(result.data);
  } catch (err) {
    console.log("Error fetching movies by city:", err);
    return res.status(500).send({ message: err.message });
  }
});


module.exports = router