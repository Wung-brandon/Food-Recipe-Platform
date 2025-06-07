import { useState, useEffect } from "react";
import axios from "axios";
import UserDashboardLayout from "../Layout/UserDashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Recipe {
  id: number;
  title: string;
  image?: string | null;
  slug: string;
  average_rating?: number;
}

const API_BASE_URL = 'http://localhost:8000';
const RecommendedRecipes: React.FC = () => {
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token, isLoading } = useAuth();

  useEffect(() => {
    const fetchRecommendedRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/ai/recommendations/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setRecommendedRecipes(response.data);
        console.log("Recommended Recipes:", response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recommended recipes.');
        setLoading(false);
      }
    };

    if (token) fetchRecommendedRecipes();
  }, [token]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!recommendedRecipes.length) return <div>No recommendations available.</div>;

  return (
    <UserDashboardLayout title="Recommended Recipes">
      <h3 className="text-xl font-bold mb-4">Recommended Recipes for You</h3>
      <div
        className="recommended-recipes-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {recommendedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="recommended-recipe-card"
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "1rem",
              background: "#fff",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={
                recipe.image ||
                "https://placehold.co/300x200?text=No+Image"
              }
              alt={recipe.title}
              style={{
                width: "100%",
                height: "140px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "0.75rem",
              }}
            />
            <h4 className="font-semibold text-lg mb-1 text-center">{recipe.title}</h4>
            {typeof recipe.average_rating === "number" && !isNaN(recipe.average_rating) && (
            <div style={{ color: "#f59e0b", marginBottom: "0.5rem" }}>
                Average Rating: {recipe.average_rating.toFixed(1)}
            </div>
            )}
            <Link
              to={`/recipe/${recipe.slug}`}
              className="text-amber-600 hover:underline font-medium mt-auto"
              style={{ marginTop: "0.5rem" }}
            >
              View Recipe
            </Link>
          </div>
        ))}
      </div>
    </UserDashboardLayout>
  );
};

export default RecommendedRecipes;