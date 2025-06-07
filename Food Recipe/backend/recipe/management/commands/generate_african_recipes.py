import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from recipe.models import Recipe, Category, Ingredient, Step, Tag, Tip

class Command(BaseCommand):
    help = 'Generates sample African regional recipes for testing and development.'

    def handle(self, *args, **options):
        self.stdout.write('Generating African regional recipes...')

        # Define African regions as categories
        categories_data = [
            ('West African', 'Cuisine from countries like Nigeria, Ghana, Senegal.'),
            ('East African', 'Cuisine from countries like Ethiopia, Kenya, Tanzania.'),
            ('North African', 'Cuisine from countries like Morocco, Egypt, Algeria.'),
            ('Southern African', 'Cuisine from countries like South Africa, Zimbabwe, Mozambique.'),
            ('Central African', 'Cuisine from countries like Cameroon, Democratic Republic of Congo.'),
        ]

        categories = {}
        for name, description in categories_data:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'description': description, 'slug': slugify(name)}
            )
            categories[name] = category

        # Define some tags
        tags_data = [
            'Spicy', 'Vegetarian', 'Gluten-Free', 'Street Food', 'Comfort Food',
            'Traditional', 'Quick', 'Festive', 'Family', 'Healthy'
        ]
        tags = {}
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name, defaults={'slug': slugify(tag_name)})
            tags[tag_name] = tag

        # Sample African recipes, each assigned to a region/category
        recipes_data = [
            # --- West African ---
            {
                'name': 'Jollof Rice',
                'description': 'A popular West African rice dish cooked in a flavorful tomato-based sauce.',
                'category': 'West African',
                'ingredients': [
                    '2 cups parboiled rice', '4 large tomatoes', '2 onions', '1 red bell pepper',
                    '1 green bell pepper', '1/4 cup tomato paste', '1/2 cup vegetable oil',
                    '2 cups chicken or vegetable broth', 'Thyme', 'Curry powder', 'Bay leaves',
                    'Salt to taste', 'Black pepper to taste', 'Scotch bonnet peppers (optional)'
                ],
                'steps': [
                    'Wash the rice thoroughly and set aside.',
                    'Blend the tomatoes, onions, and peppers until smooth.',
                    'Heat oil in a large pot and fry chopped onions until translucent.',
                    'Add the blended mixture and tomato paste, cook until the raw tomato taste disappears.',
                    'Add broth, thyme, curry powder, bay leaves, salt, and pepper. Bring to a boil.',
                    'Stir in the washed rice, reduce heat, cover, and simmer until the rice is cooked and liquid is absorbed.'
                ],
                'prep_time': 30,
                'cook_time': 60,
                'servings': 6,
                'difficulty': 'Medium',
                'calories': 450,
                'tags': ['Spicy', 'Traditional', 'Family'],
                'tips': [
                    'For extra flavor, use homemade chicken broth.',
                    'Let the rice rest for 10 minutes before serving.'
                ]
            },
            {
                'name': 'Suya',
                'description': 'A spicy meat skewer popular as street food in Nigeria and Ghana.',
                'category': 'West African',
                'ingredients': [
                    '1 kg beef (thinly sliced)', 'Suya spice mix', 'Groundnut oil', 'Salt', 'Onions (for garnish)'
                ],
                'steps': [
                    'Marinate beef slices in suya spice and oil for at least 1 hour.',
                    'Thread the meat onto skewers.',
                    'Grill over hot coals or in an oven, turning regularly.',
                    'Serve hot, garnished with sliced onions.'
                ],
                'prep_time': 20,
                'cook_time': 20,
                'servings': 4,
                'difficulty': 'Easy',
                'calories': 320,
                'tags': ['Spicy', 'Street Food', 'Quick'],
                'tips': [
                    'Soak wooden skewers in water to prevent burning.',
                    'Serve with extra suya spice for dipping.'
                ]
            },
            # --- East African ---
            {
                'name': 'Injera with Doro Wat',
                'description': 'A classic Ethiopian dish featuring spongy Injera bread served with spicy chicken stew (Doro Wat).',
                'category': 'East African',
                'ingredients': [
                    'Teff flour (for Injera)', 'Water (for Injera)', 'Chicken', 'Onions',
                    'Berbere spice mix', 'Niter kibbeh (spiced clarified butter)', 'Ginger',
                    'Garlic', 'Boiled eggs', 'Salt'
                ],
                'steps': [
                    'Prepare the Injera batter by mixing teff flour and water and allowing it to ferment.',
                    'Cook the Doro Wat by sautéing onions in niter kibbeh, adding berbere, ginger, garlic, chicken, and simmering.',
                    'Cook the Injera on a hot pan like a large crepe.',
                    'Serve the Doro Wat with boiled eggs and Injera bread.'
                ],
                'prep_time': 24*60 + 30,  # 24 hours + 30 minutes, in minutes
                'cook_time': 60,
                'servings': 4,
                'difficulty': 'Hard',
                'calories': 600,
                'tags': ['Spicy', 'Traditional'],
                'tips': [
                    'Ferment the batter overnight for authentic flavor.',
                    'Use fresh berbere spice for best results.'
                ]
            },
            {
                'name': 'Ugali and Sukuma Wiki',
                'description': 'A staple Kenyan meal of maize porridge (ugali) served with sautéed greens.',
                'category': 'East African',
                'ingredients': [
                    '2 cups maize flour', '4 cups water', 'Salt', 'Collard greens (sukuma wiki)', 'Onions', 'Tomatoes', 'Oil'
                ],
                'steps': [
                    'Boil water in a pot, add maize flour gradually while stirring.',
                    'Cook and stir until thick and smooth.',
                    'For sukuma wiki, sauté onions and tomatoes, add greens and cook until tender.',
                    'Serve ugali with the greens.'
                ],
                'prep_time': 10,
                'cook_time': 20,
                'servings': 4,
                'difficulty': 'Easy',
                'calories': 350,
                'tags': ['Vegetarian', 'Healthy', 'Quick'],
                'tips': [
                    'Use a wooden spoon for stirring ugali.',
                    'Add a squeeze of lemon to the greens for extra flavor.'
                ]
            },
            # --- North African ---
            {
                'name': 'Tagine',
                'description': 'A North African stew cooked slowly in a conical clay pot, often with preserved lemon and olives.',
                'category': 'North African',
                'ingredients': [
                    'Meat (lamb, chicken, or beef)', 'Onions', 'Garlic', 'Ginger',
                    'Turmeric', 'Cumin', 'Paprika', 'Cinnamon', 'Preserved lemon',
                    'Green olives', 'Chicken or vegetable broth', 'Olive oil', 'Salt', 'Pepper'
                ],
                'steps': [
                    'Sear the meat in a tagine or heavy pot with olive oil.',
                    'Add chopped onions, garlic, and ginger and cook until softened.',
                    'Stir in the spices, salt, and pepper.',
                    'Add broth, preserved lemon wedges, and olives.',
                    'Cover and simmer on low heat until the meat is tender and the sauce has thickened.'
                ],
                'prep_time': 20,
                'cook_time': 120,
                'servings': 4,
                'difficulty': 'Medium',
                'calories': 550,
                'tags': ['Traditional', 'Comfort Food'],
                'tips': [
                    'Use a real tagine pot for best results.',
                    'Let the stew rest before serving to enhance flavors.'
                ]
            },
            {
                'name': 'Couscous with Vegetables',
                'description': 'A North African dish of steamed semolina served with a medley of vegetables.',
                'category': 'North African',
                'ingredients': [
                    '2 cups couscous', 'Carrots', 'Zucchini', 'Chickpeas', 'Onions', 'Tomatoes', 'Raisins', 'Cinnamon', 'Cumin', 'Salt', 'Olive oil'
                ],
                'steps': [
                    'Steam couscous according to package instructions.',
                    'Sauté onions and tomatoes, add chopped vegetables and spices.',
                    'Simmer until vegetables are tender.',
                    'Serve vegetables over couscous, garnish with raisins.'
                ],
                'prep_time': 15,
                'cook_time': 30,
                'servings': 4,
                'difficulty': 'Easy',
                'calories': 400,
                'tags': ['Vegetarian', 'Healthy', 'Festive'],
                'tips': [
                    'Fluff couscous with a fork before serving.',
                    'Add a pinch of saffron for extra aroma.'
                ]
            },
            # --- Southern African ---
            {
                'name': 'Bobotie',
                'description': 'A South African dish consisting of spiced minced meat baked with an egg-based topping.',
                'category': 'Southern African',
                'ingredients': [
                    'Minced beef or lamb', 'Onions', 'Garlic', 'Ginger', 'Curry powder',
                    'Turmeric', 'Cumin', 'Coriander', 'Bay leaves', 'Apricot jam or chutney',
                    'White bread', 'Milk', 'Eggs', 'Vinegar', 'Almonds (slivered, optional)'
                ],
                'steps': [
                    'Soak the bread in milk.',
                    'Sauté onions, garlic, and ginger. Add minced meat and brown.',
                    'Stir in spices, bay leaves, apricot jam/chutney, and squeezed bread.',
                    'Transfer the mixture to a baking dish.',
                    'Whisk eggs and milk, pour over the meat mixture.',
                    'Bake until the egg topping is set and golden brown.'
                ],
                'prep_time': 30,
                'cook_time': 60,
                'servings': 6,
                'difficulty': 'Medium',
                'calories': 500,
                'tags': ['Comfort Food', 'Family'],
                'tips': [
                    'Serve with yellow rice and chutney.',
                    'Let the bobotie cool slightly before slicing.'
                ]
            },
            {
                'name': 'Pap and Chakalaka',
                'description': 'A staple South African dish of maize porridge (pap) served with spicy vegetable relish (chakalaka).',
                'category': 'Southern African',
                'ingredients': [
                    '2 cups maize meal', '4 cups water', 'Salt', 'Onions', 'Tomatoes', 'Carrots', 'Bell peppers', 'Baked beans', 'Curry powder', 'Oil'
                ],
                'steps': [
                    'Boil water, add maize meal gradually, stirring constantly to make pap.',
                    'Cook until thick and smooth.',
                    'For chakalaka, sauté onions, peppers, and carrots, add tomatoes, curry powder, and baked beans.',
                    'Simmer until vegetables are tender.',
                    'Serve pap with chakalaka on the side.'
                ],
                'prep_time': 15,
                'cook_time': 30,
                'servings': 4,
                'difficulty': 'Easy',
                'calories': 350,
                'tags': ['Vegetarian', 'Spicy', 'Traditional'],
                'tips': [
                    'Use leftover chakalaka as a sandwich spread.',
                    'Pap can be made softer or firmer by adjusting water.'
                ]
            },
            # --- Central African ---
            {
                'name': 'Ndole',
                'description': 'A national dish of Cameroon, made with bitterleaf, peanuts, and meat or fish.',
                'category': 'Central African',
                'ingredients': [
                    'Bitterleaf', 'Ground peanuts', 'Meat (beef, goat, or chicken) or smoked fish',
                    'Onions', 'Garlic', 'Ginger', 'Palm oil', 'Crayfish (optional)',
                    'Salt to taste', 'Pepper to taste'
                ],
                'steps': [
                    'Wash the bitterleaf thoroughly to remove bitterness.',
                    'Boil the meat or fish until tender.',
                    'Blend peanuts, onions, garlic, and ginger.',
                    'Heat palm oil in a pot and sauté the blended mixture.',
                    'Add the bitterleaf and cooked meat/fish.',
                    'Stir in crayfish (if using), salt, and pepper. Simmer until well combined and flavorful.'
                ],
                'prep_time': 45,
                'cook_time': 90,
                'servings': 4,
                'difficulty': 'Medium',
                'calories': 480,
                'tags': ['Traditional', 'Healthy'],
                'tips': [
                    'Use spinach if bitterleaf is unavailable.',
                    'Roast peanuts before blending for richer flavor.'
                ]
            },
            {
                'name': 'Moambe Chicken',
                'description': 'A savory chicken stew from the Congo, cooked with palm butter and spices.',
                'category': 'Central African',
                'ingredients': [
                    'Chicken pieces', 'Palm butter', 'Onions', 'Garlic', 'Tomatoes', 'Chili peppers', 'Peanut butter', 'Salt', 'Pepper'
                ],
                'steps': [
                    'Brown chicken pieces in a pot.',
                    'Add onions, garlic, and tomatoes, cook until soft.',
                    'Stir in palm butter, peanut butter, and chili peppers.',
                    'Simmer until chicken is tender and sauce is thick.',
                    'Season with salt and pepper to taste.'
                ],
                'prep_time': 20,
                'cook_time': 60,
                'servings': 5,
                'difficulty': 'Medium',
                'calories': 520,
                'tags': ['Spicy', 'Family'],
                'tips': [
                    'Serve with rice or fufu.',
                    'Adjust chili to your spice preference.'
                ]
            },
        ]

        # You may want to set a default author (e.g., the first user)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        author = User.objects.first()

        for recipe_data in recipes_data:
            category = categories.get(recipe_data['category'])

            if not category:
                self.stdout.write(self.style.WARNING(
                    f'Skipping recipe "{recipe_data["name"]}" due to missing category.'
                ))
                continue

            recipe, created = Recipe.objects.get_or_create(
                title=recipe_data['name'],
                defaults={
                    'description': recipe_data['description'],
                    'slug': slugify(recipe_data['name']),
                    'category': category,
                    'preparation_time': recipe_data['prep_time'],
                    'cooking_time': recipe_data['cook_time'],
                    'servings': recipe_data['servings'],
                    'difficulty': recipe_data['difficulty'],
                    'calories': recipe_data['calories'],
                    'author': author,
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created recipe: {recipe.title}'))

                # Add tags
                for tag_name in recipe_data.get('tags', []):
                    tag = tags.get(tag_name)
                    if tag:
                        recipe.tags.add(tag)

                # Add ingredients
                for ingredient_name in recipe_data['ingredients']:
                    Ingredient.objects.create(recipe=recipe, name=ingredient_name, amount='')

                # Add steps
                for step_number, step_text in enumerate(recipe_data['steps'], 1):
                    Step.objects.create(recipe=recipe, description=step_text)

                # Add tips
                for tip_text in recipe_data.get('tips', []):
                    Tip.objects.create(recipe=recipe, description=tip_text)
            else:
                self.stdout.write(self.style.WARNING(f'Recipe "{recipe.title}" already exists. Skipping.'))

        self.stdout.write(self.style.SUCCESS('Finished generating recipes.'))