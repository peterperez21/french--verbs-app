//Since you are at an A2 level, you probably want your app to feel smooth. Here is how you can now write a very clean filter function using these parent levels:

const filterBySlider = (cefrLevel, schema) => {
  const levelOrder = ["A1", "A2", "B1", "B2"];
  const userLevelIndex = levelOrder.indexOf(cefrLevel);

  const isLevelAllowed = (itemLevels) => {
    if (!itemLevels) return true;
    // Check if any of the item's levels are at or below the user's slider
    return itemLevels.some((lvl) => levelOrder.indexOf(lvl) <= userLevelIndex);
  };

  const filteredMoods = {};
  Object.entries(schema.moods).forEach(([mood, data]) => {
    if (isLevelAllowed(data.levels)) {
      filteredMoods[mood] = data;
    }
  });

  return filteredMoods;
};
