const { City } = require("../models/City");
const { createCity } = require("../services/CityService");
const express = require("express");
const logger = require("../utils/logger");
const router = express.Router();

router.post("/city", async (req, res) => {
  try {
    const result = await createCity(req.body);
    logger.info("City created successfully", { cityName: req.body.name });
    return res.status(result.status).send(result.data);
  } catch (err) {
    logger.error("Error creating city", { error: err.message });
    return res.status(500).send("Internal Server error", err);
  }
});

router.get("/cities", async (req, res) => {
  try {
    const cities = await City.find();
    logger.info("Fetched all cities", { count: cities?.length || 0 });

    if (!cities) return res.status(404).send("No Cities Exists");

    res.status(200).send({ data: cities });
  } catch (err) {
    logger.error("Error fetching cities", { error: err.message });
    return res.status(500).send({ message: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const city = await City.find({ _id: req.params.id });
    logger.info("Fetched city by ID", { cityId: req.params.id });

    if (!city) return res.status(404).send("No Cities Exists");

    res.status(200).send({ data: city });
  } catch (err) {
    logger.error("Error fetching city by ID", { cityId: req.params.id, error: err.message });
    return res.status(500).send({ message: err });
  }
});

router.get("/state/:state", async (req, res) => {
  try {
    const cities = await City.find({ state: req.params.state });
    logger.info("Fetched cities by state", { state: req.params.state, count: cities?.length || 0 });

    if (!cities) return res.status(404).send("No cities are found");

    return res.status(200).send({ data: cities });
  } catch (err) {
    logger.error("Error fetching cities by state", { state: req.params.state, error: err.message });
    return res.status(500).send({ message: err });
  }
});

module.exports = router;
