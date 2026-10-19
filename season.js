function getCurrentSeasonYear(date = new Date()) {
  const month = date.getMonth();
  return month >= 8 ? date.getFullYear() : date.getFullYear() - 1;
}

module.exports = { getCurrentSeasonYear };
