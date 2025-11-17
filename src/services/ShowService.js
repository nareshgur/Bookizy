const Show = require("../models/Show");

/**
 * Create a new Show
 */
exports.CreateShow = async (data) => {
  const result = await Show.create(data);
  return {
    status: 200,
    data: {
      message: "Successfully created the Show",
      data: result
    }
  };
};


/**
 * Get shows by City
 */
exports.getShowsByCity = async (city) => {
  const result = await Show.find({ city });

  if (result.length === 0)
    throw new Error("No Shows found for this city");

  return {
    status: 200,
    data: {
      message: "Fetched shows by city",
      data: result
    }
  };
};


/**
 * Get shows by Movie (TMDB movieId)
 */
exports.getShowsByMovie = async (movieId) => {
  const result = await Show.find({ movieId });

  if (result.length === 0)
    throw new Error("No Shows found for this movie");

  return {
    status: 200,
    data: {
      message: "Fetched shows by movie",
      data: result
    }
  };
};


/**
 * Get shows by Theatre
 */
exports.getShowsByTheatre = async (theatreId) => {
  const result = await Show.find({ theatreId });

  if (result.length === 0)
    throw new Error("No Shows found for this theatre");

  return {
    status: 200,
    data: {
      message: "Fetched shows by theatre",
      data: result
    }
  };
};


/**
 * Get shows by Screen
 */
exports.getShowsByScreen = async (screenId) => {
  const result = await Show.find({ screenId });

  if (result.length === 0)
    throw new Error("No Shows found for this screen");

  return {
    status: 200,
    data: {
      message: "Fetched shows by screen",
      data: result
    }
  };
};


/**
 * Update show
 */
exports.updateShow = async (id, body) => {
  const result = await Show.findByIdAndUpdate(id, body, { new: true });

  return {
    status: 200,
    data: {
      message: "Successfully updated the Show details",
      data: result
    }
  };
};


/**
 * Delete Show
 */
exports.deleteShow = async (id) => {
  await Show.findByIdAndDelete(id);

  return {
    status: 200,
    data: { message: "Show Deleted Successfully" }
  };
};
