// Production URL Configuration
const BASE_URL = "https://dailyneedstore2-0.onrender.com";

// Levenshtein distance algorithm for finding similarity between search query & product names
function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

export function filterAndFuzzySearchProducts(
  products,
  searchQuery,
  selectedCategory,
) {
  if (!Array.isArray(products))
    return { filteredProducts: [], isFuzzyMatch: false, nearestKeyword: "" };

  // 1. Filter by Category
  let categoryFiltered = products;
  if (selectedCategory && selectedCategory !== "All") {
    categoryFiltered = products.filter((p) => {
      const cat = p.category ? p.category.toLowerCase() : "";
      const name = p.name ? p.name.toLowerCase() : "";
      return (
        cat.includes(selectedCategory.toLowerCase()) ||
        name.includes(selectedCategory.toLowerCase())
      );
    });
  }

  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return {
      filteredProducts: categoryFiltered,
      isFuzzyMatch: false,
      nearestKeyword: "",
    };
  }

  // 2. Direct exact or substring search match
  const exactMatches = categoryFiltered.filter((p) =>
    p.name.toLowerCase().includes(query),
  );

  if (exactMatches.length > 0) {
    return {
      filteredProducts: exactMatches,
      isFuzzyMatch: false,
      nearestKeyword: "",
    };
  }

  // 3. Nearest Keyword Matching if no exact matches found
  let bestMatch = null;
  let minDistance = Infinity;

  categoryFiltered.forEach((p) => {
    const words = p.name.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      const dist = getLevenshteinDistance(query, word);
      if (dist < minDistance && dist <= 4) {
        // Distance threshold
        minDistance = dist;
        bestMatch = word;
      }
    });
  });

  if (bestMatch) {
    const nearestMatches = categoryFiltered.filter((p) =>
      p.name.toLowerCase().includes(bestMatch),
    );
    return {
      filteredProducts: nearestMatches,
      isFuzzyMatch: true,
      nearestKeyword: bestMatch,
    };
  }

  return { filteredProducts: [], isFuzzyMatch: false, nearestKeyword: "" };
}
