import requests
import json
import logging
import os
import re
from django.conf import settings
from typing import List, Dict, Any
from django.db.models import Q
from .models import UserPreference, RecipeView, Recipe

logger = logging.getLogger(__name__)

class DeepSeekAIService:
    def __init__(self):
        self.api_key = getattr(settings, 'DEEPSEEK_API_KEY', os.environ.get('DEEPSEEK_API_KEY', ''))
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "deepseek/deepseek-r1-0528:free"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173/",
            "X-Title": "Recipe Recommendation Platform",
        }

    def _make_request(self, messages: List[Dict[str, str]], max_tokens: int = 2000) -> Dict[str, Any]:
        """Make a request to the DeepSeek API"""
        try:
            logger.info("[DeepSeek] Sending request to DeepSeek API...")
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.3,  # Lower temperature for more consistent JSON output
                "top_p": 0.9
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                data=json.dumps(payload),
                timeout=45  # Increased timeout
            )
            
            logger.info(f"[DeepSeek] Response status: {response.status_code}")
            response.raise_for_status()
            
            response_data = response.json()
            logger.info(f"[DeepSeek] Response: {json.dumps(response_data, indent=2)}")
            
            return response_data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"[DeepSeek] API request failed: {str(e)}")
            raise Exception(f"AI service unavailable: {str(e)}")

    def get_recipe_recommendations(self, user, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate personalized recipe recommendations for a user"""
        try:
            logger.info("[DeepSeek] get_recipe_recommendations called for user %s", user)
            # Get user preferences
            preferences = getattr(user, 'recommendation_preference', None)
            
            # Get user's viewing history (last 20 recipes)
            recent_views = RecipeView.objects.filter(user=user).order_by('-viewed_at')[:20]
            viewed_recipes = [view.recipe.title for view in recent_views]
            
            # Build context for AI
            context = self._build_user_context(preferences, viewed_recipes)
            
            # Get available recipes from database (limit to prevent token overflow)
            all_recipes = Recipe.objects.all().values('id', 'title', 'description', 'preparation_time', 'cooking_time')
            recipe_data = list(all_recipes[:50])  # Reduced limit to prevent token overflow
            
            # Create AI prompt
            prompt = self._create_recommendation_prompt(context, recipe_data, limit)
            
            messages = [
                {
                    "role": "system",
                    "content": "You are a professional chef AI assistant. You must respond with valid JSON only. No explanations, no markdown, just pure JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            response = self._make_request(messages, max_tokens=1500)
            logger.info("[DeepSeek] AI response received for recommendations.")
            
            # Parse AI response
            if 'choices' in response and len(response['choices']) > 0:
                ai_content = response['choices'][0]['message']['content']
                recommendations = self._parse_recommendations(ai_content)
                
                if recommendations:
                    return recommendations
            
            logger.warning("[DeepSeek] No valid recommendations from AI, using fallback")
            return self._fallback_recommendations(user, limit)
            
        except Exception as e:
            logger.error(f"[DeepSeek] Failed to get AI recommendations: {str(e)}. Using fallback.")
            return self._fallback_recommendations(user, limit)

    def get_ingredient_based_recipes(self, ingredients: List[str], max_results: int = 10) -> Dict[str, Any]:
        """Find recipes based on available ingredients using AI"""
        try:
            logger.info("[DeepSeek] get_ingredient_based_recipes called with ingredients: %s", ingredients)
            
            # Get recipes from database that might match (more targeted search)
            ingredient_queries = []
            for ingredient in ingredients[:3]:  # Limit to first 3 ingredients to avoid too complex queries
                ingredient_queries.append(Q(description__icontains=ingredient) | Q(title__icontains=ingredient))
            
            if ingredient_queries:
                query = ingredient_queries[0]
                for q in ingredient_queries[1:]:
                    query |= q
                matching_recipes = Recipe.objects.filter(query)[:30]  # Reduced limit
            else:
                matching_recipes = Recipe.objects.all()[:30]

            recipe_data = [
                {
                    'id': recipe.id,
                    'title': recipe.title,
                    'description': recipe.description[:200] if recipe.description else "",  # Truncate description
                    'preparation_time': recipe.preparation_time,
                    'cooking_time': recipe.cooking_time
                }
                for recipe in matching_recipes
            ]

            prompt = self._create_ingredient_search_prompt(ingredients, recipe_data, max_results)

            messages = [
                {
                    "role": "system",
                    "content": "You are a culinary AI assistant. You must respond with valid JSON only. No explanations, no markdown, just pure JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            response = self._make_request(messages, max_tokens=1500)
            logger.info("[DeepSeek] AI response received for ingredient search.")
            
            if 'choices' in response and len(response['choices']) > 0:
                ai_content = response['choices'][0]['message']['content']
                logger.info(f"[DeepSeek] AI raw content: {ai_content}")

                result = self._parse_ingredient_search_result(ai_content)
                
                if result and 'recipes' in result:
                    # Add additional AI suggestions for missing ingredients
                    result['ai_suggestions'] = self._get_ingredient_suggestions(ingredients)
                    return result

            logger.warning("[DeepSeek] No valid result from AI, using fallback")
            return self._fallback_ingredient_search(ingredients, max_results)

        except Exception as e:
            logger.error(f"[DeepSeek] Failed to get AI ingredient search: {str(e)}. Using fallback.")
            return self._fallback_ingredient_search(ingredients, max_results)

    def _build_user_context(self, preferences, viewed_recipes) -> str:
        """Build user context string for AI prompt"""
        context = "User Profile:\n"
        
        if preferences:
            if preferences.dietary_needs:
                context += f"- Dietary Requirements: {', '.join(preferences.dietary_needs)}\n"
            if preferences.cuisine_preferences:
                context += f"- Preferred Cuisines: {', '.join(preferences.cuisine_preferences)}\n"
            if preferences.disliked_ingredients:
                context += f"- Ingredients to Avoid: {', '.join(preferences.disliked_ingredients)}\n"
            context += f"- Cooking Skill Level: {preferences.cooking_skill_level}\n"
            context += f"- Preferred Cooking Time: {preferences.preferred_cooking_time} minutes\n"
        
        if viewed_recipes:
            context += f"- Recently Viewed Recipes: {', '.join(viewed_recipes[:5])}\n"  # Reduced to save tokens
        
        return context

    def _create_recommendation_prompt(self, context: str, recipes: List[Dict], limit: int) -> str:
        """Create AI prompt for recipe recommendations with explicit JSON instructions"""
        limited_recipes = recipes[:20]
        return f"""
{context}

Available Recipes (showing first 20):
{json.dumps(limited_recipes, indent=1)}

Recommend {limit} recipes that match the user profile. Respond with this exact JSON format:

{{
    \"recommendations\": [
        {{
            \"recipe_id\": 123,
            \"confidence_score\": 0.95,
            \"reason\": \"Brief reason\"
        }}
    ]
}}

IMPORTANT: Respond with valid JSON only. No explanations, no markdown, no extra text. JSON only.
If you cannot find any suitable recipes, return an empty array in the recommendations field.
"""

    def _create_ingredient_search_prompt(self, ingredients: List[str], recipes: List[Dict], max_results: int) -> str:
        """Create AI prompt for ingredient-based search with explicit JSON instructions"""
        return f"""
Available Ingredients: {', '.join(ingredients)}

Available Recipes:
{json.dumps(recipes, indent=1)}

Find {max_results} best recipes using these ingredients. Respond with this exact JSON format:

{{
    \"recipes\": [
        {{
            \"recipe_id\": 123,
            \"match_score\": 0.85,
            \"available_ingredients\": [\"ingredient1\", \"ingredient2\"],
            \"missing_ingredients\": [\"ingredient3\"]
        }}
    ]
}}

IMPORTANT: Respond with valid JSON only. No explanations, no markdown, no extra text. JSON only.
If you cannot find any suitable recipes, return an empty array in the recipes field.
"""

    def _parse_recommendations(self, ai_content: str) -> List[Dict[str, Any]]:
        """Parse AI response for recommendations with robust error handling and JSON extraction"""
        try:
            if not ai_content or '{' not in ai_content:
                logger.error(f"[DeepSeek] AI response is empty or missing JSON: {ai_content}")
                return []
            # Try direct JSON extraction first
            try:
                parsed = json.loads(ai_content)
                if 'recommendations' in parsed:
                    return parsed['recommendations']
            except Exception:
                pass
            # Try extracting JSON block
            start_idx = ai_content.find('{')
            end_idx = ai_content.rfind('}') + 1
            json_str = ai_content[start_idx:end_idx]
            try:
                parsed = json.loads(json_str)
                if 'recommendations' in parsed:
                    return parsed['recommendations']
            except Exception:
                pass
            # Try regex extraction for JSON object
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.findall(json_pattern, ai_content, re.DOTALL)
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if 'recommendations' in parsed:
                        return parsed['recommendations']
                except Exception:
                    continue
            logger.error(f"[DeepSeek] 'recommendations' key missing or could not parse AI response: {ai_content}")
            return []
        except Exception as e:
            logger.error(f"[DeepSeek] Could not parse recommendations from AI response: {ai_content} | Error: {str(e)}")
            return []

    def _parse_ingredient_search_result(self, ai_content: str) -> Dict[str, Any]:
        """Parse AI response for ingredient search with robust error handling"""
        try:
            ai_content = ai_content.strip()
            logger.info(f"[DeepSeek] Parsing ingredient search from: {ai_content}")
            
            json_data = self._extract_json(ai_content)
            
            if json_data and 'recipes' in json_data:
                return json_data
            
            logger.warning("[DeepSeek] Could not parse ingredient search from AI response")
            return {"recipes": []}
            
        except Exception as e:
            logger.error(f"[DeepSeek] Error parsing ingredient search result: {str(e)}")
            return {"recipes": []}

    def _extract_json(self, content: str) -> Dict[str, Any]:
        """Extract JSON from AI response using multiple strategies"""
        try:
            # Strategy 1: Direct JSON parsing
            return json.loads(content)
        except:
            pass
        
        try:
            # Strategy 2: Find JSON block between braces
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
        except:
            pass
        
        try:
            # Strategy 3: Extract using regex
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.findall(json_pattern, content, re.DOTALL)
            for match in matches:
                try:
                    return json.loads(match)
                except:
                    continue
        except:
            pass
        
        logger.error(f"[DeepSeek] Failed to extract JSON from: {content}")
        return {}

    def _get_ingredient_suggestions(self, ingredients: List[str]) -> List[str]:
        """Get AI suggestions for complementary ingredients"""
        try:
            prompt = f"""
Ingredients: {', '.join(ingredients)}

Suggest 5 complementary ingredients. Respond with JSON array only:

["ingredient1", "ingredient2", "ingredient3", "ingredient4", "ingredient5"]
"""
            
            messages = [
                {
                    "role": "system",
                    "content": "You are a culinary expert. Respond with JSON array only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            response = self._make_request(messages, max_tokens=100)
            
            if 'choices' in response and len(response['choices']) > 0:
                ai_content = response['choices'][0]['message']['content'].strip()
                logger.info(f"[DeepSeek] Suggestions content: {ai_content}")
                
                # Extract array
                start_idx = ai_content.find('[')
                end_idx = ai_content.rfind(']') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    suggestions_str = ai_content[start_idx:end_idx]
                    suggestions = json.loads(suggestions_str)
                    if isinstance(suggestions, list):
                        return suggestions[:5]  # Limit to 5
            
            return ["salt", "pepper", "olive oil", "garlic", "onion"]
            
        except Exception as e:
            logger.error(f"[DeepSeek] Error getting ingredient suggestions: {str(e)}")
            return ["salt", "pepper", "olive oil", "garlic", "onion"]

    def _fallback_recommendations(self, user, limit: int) -> List[Dict[str, Any]]:
        """Fallback recommendation logic when AI fails"""
        logger.info("[DeepSeek] Using fallback recommendations")
        # Simple fallback: recommend popular recipes not recently viewed
        viewed_recipe_ids = RecipeView.objects.filter(user=user).values_list('recipe_id', flat=True)
        recipes = Recipe.objects.exclude(id__in=viewed_recipe_ids)[:limit]
        
        return [
            {
                "recipe_id": recipe.id,
                "confidence_score": 0.5,
                "reason": "Popular recipe recommendation"
            }
            for recipe in recipes
        ]

    def _fallback_ingredient_search(self, ingredients: List[str], max_results: int) -> Dict[str, Any]:
        """Fallback ingredient search when AI fails"""
        logger.info("[DeepSeek] Using fallback ingredient search")
        # Simple keyword matching
        queries = []
        for ingredient in ingredients[:3]:  # Limit to first 3 ingredients
            queries.append(Q(description__icontains=ingredient) | Q(title__icontains=ingredient))
        
        if queries:
            query = queries[0]
            for q in queries[1:]:
                query |= q
            recipes = Recipe.objects.filter(query)[:max_results]
        else:
            recipes = Recipe.objects.all()[:max_results]
        
        return {
            "recipes": [
                {
                    "recipe_id": recipe.id,
                    "match_score": 0.5,
                    "available_ingredients": ingredients,
                    "missing_ingredients": []
                }
                for recipe in recipes
            ],
            "ai_suggestions": ["salt", "pepper", "olive oil", "garlic", "onion"]
        }