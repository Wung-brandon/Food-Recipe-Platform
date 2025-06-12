import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from recipe.models import Recipe, Category, Ingredient, Step, Tag, Tip

class Command(BaseCommand):
    help = 'Generates enhanced sample African regional recipes with focus on Cameroonian cuisine.'

    def handle(self, *args, **options):
        self.stdout.write('Generating enhanced African regional recipes...')

        # Define African regions as categories
        categories_data = [
            ('West African', 'Rich and diverse cuisine from countries like Nigeria, Ghana, Senegal, featuring bold spices, palm oil, and hearty stews.'),
            ('East African', 'Aromatic cuisine from countries like Ethiopia, Kenya, Tanzania, known for injera, berbere spices, and grain-based dishes.'),
            ('North African', 'Mediterranean-influenced cuisine from Morocco, Egypt, Algeria, featuring tagines, couscous, and preserved ingredients.'),
            ('Southern African', 'Fusion cuisine from South Africa, Zimbabwe, Mozambique, blending indigenous, Dutch, and Indian influences.'),
            ('Central African', 'Forest-based cuisine from Cameroon, Democratic Republic of Congo, featuring leafy greens, palm products, and river fish.'),
        ]

        categories = {}
        for name, description in categories_data:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'description': description, 'slug': slugify(name)}
            )
            categories[name] = category

        # Define comprehensive tags
        tags_data = [
            'Spicy', 'Vegetarian', 'Gluten-Free', 'Street Food', 'Comfort Food',
            'Traditional', 'Quick', 'Festive', 'Family', 'Healthy', 'Protein-Rich',
            'Fiber-Rich', 'One-Pot', 'Grilled', 'Steamed', 'Authentic', 'Regional'
        ]
        tags = {}
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name, defaults={'slug': slugify(tag_name)})
            tags[tag_name] = tag

        # Enhanced African recipes with detailed Cameroonian focus
        recipes_data = [
            # --- West African ---
            {
                'name': 'Authentic Nigerian Jollof Rice',
                'description': 'The crown jewel of West African cuisine, this aromatic one-pot rice dish is cooked in a rich, smoky tomato base with a perfect blend of spices. Each grain is infused with flavors that have been perfected over generations, making it the centerpiece of celebrations and family gatherings across Nigeria.',
                'category': 'West African',
                'ingredients': [
                    '3 cups parboiled long-grain rice', '6 large Roma tomatoes', '2 large red onions', 
                    '1 large red bell pepper', '2 green bell peppers', '1/3 cup tomato paste',
                    '1/2 cup palm oil or vegetable oil', '3 cups rich chicken stock', '2 tsp dried thyme',
                    '2 tbsp curry powder', '3 bay leaves', '2 tsp smoked paprika', '1 tsp garlic powder',
                    '2 scotch bonnet peppers (whole)', '2 seasoning cubes', 'Salt to taste',
                    '1 tsp black pepper', '1 cup mixed vegetables (carrots, peas, green beans)'
                ],
                'steps': [
                    'Rinse the parboiled rice in cold water until water runs clear, then soak for 30 minutes and drain.',
                    'Blend tomatoes, 1 onion, and red bell pepper until smooth. Strain to remove seeds for a silky texture.',
                    'Heat oil in a heavy-bottomed pot over medium heat. Sauté diced remaining onion until golden and fragrant.',
                    'Add tomato paste and fry for 3-4 minutes until it darkens and loses its raw taste.',
                    'Pour in the blended tomato mixture and cook for 15-20 minutes, stirring occasionally until it reduces and darkens.',
                    'Add chicken stock, thyme, curry powder, bay leaves, paprika, garlic powder, seasoning cubes, and scotch bonnet peppers.',
                    'Bring to a rolling boil, then add the drained rice. Stir gently to distribute evenly.',
                    'Reduce heat to low, cover tightly, and simmer for 25-30 minutes until rice is tender and liquid is absorbed.',
                    'Add mixed vegetables in the last 10 minutes of cooking. Let rest for 10 minutes before serving.'
                ],
                'prep_time': 45,
                'cook_time': 75,
                'servings': 8,
                'difficulty': 'Medium',
                'calories': 420,
                'tags': ['Spicy', 'Traditional', 'Family', 'One-Pot', 'Festive'],
                'tips': [
                    'Use parboiled rice for the best texture and to prevent mushiness.',
                    'The key to great Jollof is achieving the perfect tomato base - cook until it\'s thick and jammy.',
                    'Don\'t stir too much once rice is added to prevent breaking the grains.',
                    'For authentic smoky flavor, place pot on high heat for the last 5 minutes to create a slight burn at the bottom.'
                ]
            },
            {
                'name': 'Nigerian Suya Perfection',
                'description': 'Nigeria\'s beloved street food featuring thinly sliced beef marinated in a complex spice blend called "yaji," then grilled over open flames. This aromatic and spicy meat skewer is a testament to the art of West African spice blending and grilling techniques.',
                'category': 'West African',
                'ingredients': [
                    '2 lbs beef sirloin (sliced paper-thin)', '3 tbsp groundnut oil', '2 large onions (sliced)',
                    'For Suya Spice Mix:', '1/2 cup roasted peanuts (ground)', '2 tbsp ground ginger',
                    '1 tbsp garlic powder', '2 tsp cayenne pepper', '1 tsp ground cloves',
                    '1 tsp ground nutmeg', '2 seasoning cubes (crushed)', '1 tsp salt'
                ],
                'steps': [
                    'Prepare the suya spice by dry-roasting peanuts until golden, then grinding with all spice ingredients.',
                    'Slice beef against the grain into very thin strips (freeze for 30 minutes to make slicing easier).',
                    'Marinate beef with half the spice mix and oil for at least 2 hours or overnight.',
                    'Thread marinated beef onto soaked wooden skewers, ensuring even distribution.',
                    'Grill over medium-high heat for 3-4 minutes per side until edges are crispy but center remains tender.',
                    'Dust with remaining spice mix while hot and serve immediately with sliced onions.'
                ],
                'prep_time': 30,
                'cook_time': 15,
                'servings': 6,
                'difficulty': 'Easy',
                'calories': 285,
                'tags': ['Spicy', 'Street Food', 'Quick', 'Grilled', 'Protein-Rich'],
                'tips': [
                    'Soak wooden skewers for at least 2 hours to prevent charring.',
                    'The meat should be sliced as thin as possible for authentic texture.',
                    'Serve with cold drinks as the spice level is quite intense.',
                    'Store extra suya spice in an airtight container for up to 3 months.'
                ]
            },

            # --- Central African (Cameroon Focus) ---
            {
                'name': 'Cameroon Ndolé Supreme',
                'description': 'The national dish of Cameroon, this sophisticated stew combines bitter leaves with groundnuts, creating a complex flavor profile that represents the heart of Central African cuisine. Traditionally prepared for special occasions, this protein-rich dish showcases the culinary artistry of Cameroonian cooking with its perfect balance of textures and flavors.',
                'category': 'Central African',
                'ingredients': [
                    '2 lbs fresh bitter leaves (or 1 lb frozen)', '1 lb beef (cut in chunks)', '1 lb fresh fish (mackerel or catfish)',
                    '1/2 lb dried fish (soaked and cleaned)', '1/2 lb smoked fish', '1/4 lb prawns or crayfish',
                    '2 cups raw peanuts', '2 large onions (chopped)', '4 cloves garlic (minced)',
                    '2-inch piece ginger (grated)', '1/4 cup palm oil', '2 seasoning cubes',
                    '1 tsp ground crayfish', '2 bay leaves', '1 scotch bonnet pepper (whole)',
                    'Salt and white pepper to taste', '6 cups water or stock'
                ],
                'steps': [
                    'Wash bitter leaves thoroughly in multiple changes of water, squeezing to remove bitterness. Chop finely.',
                    'Boil peanuts for 15 minutes, then remove skins and grind to a smooth paste with minimal water.',
                    'Season beef with salt, pepper, and seasoning cube. Brown in a heavy pot with palm oil.',
                    'Add onions, garlic, and ginger to the pot. Sauté until fragrant and golden.',
                    'Pour in water, add bay leaves and scotch bonnet. Simmer beef for 45 minutes until tender.',
                    'Add ground peanut paste, stirring constantly to prevent lumps. Simmer for 20 minutes.',
                    'Add dried fish, smoked fish, and fresh fish. Cook for 15 minutes.',
                    'Stir in the prepared bitter leaves and ground crayfish. Simmer for 25 minutes.',
                    'Add prawns in the last 5 minutes. Adjust seasoning and remove scotch bonnet before serving.'
                ],
                'prep_time': 90,
                'cook_time': 120,
                'servings': 8,
                'difficulty': 'Hard',
                'calories': 485,
                'tags': ['Traditional', 'Protein-Rich', 'Authentic', 'Family', 'Festive'],
                'tips': [
                    'If bitter leaves are too bitter, blanch them in boiling water for 5 minutes before using.',
                    'Substitute spinach or collard greens if bitter leaves are unavailable, but reduce cooking time.',
                    'The peanut paste should be smooth - strain if necessary to remove any lumps.',
                    'This dish tastes better the next day as flavors meld together beautifully.'
                ]
            },
            {
                'name': 'Cameroon Achu Soup with Cocoyam',
                'description': 'A traditional Cameroonian delicacy from the Northwest region, featuring yellow soup served with pounded cocoyam. This golden-hued soup gets its distinctive color from palm oil and turmeric, while the cocoyam provides a unique sticky texture that perfectly complements the rich, aromatic broth.',
                'category': 'Central African',
                'ingredients': [
                    '3 lbs white cocoyam (taro root)', '2 lbs beef (assorted cuts)', '1 lb dried fish',
                    '1/2 lb smoked fish', '1/4 cup palm oil', '2 large onions (sliced)', '4 cloves garlic',
                    '2-inch ginger piece', '2 tbsp ground crayfish', '1 tsp turmeric powder',
                    '2 seasoning cubes', '1 scotch bonnet pepper', '2 bay leaves',
                    'Limestone (kanwa) - 1 small piece', 'Salt to taste', '8 cups water',
                    'Fresh scent leaves for garnish'
                ],
                'steps': [
                    'Peel and wash cocoyam, then boil until very tender (about 45 minutes).',
                    'Pound boiled cocoyam in a mortar until smooth and stretchy. Set aside covered.',
                    'Season beef with salt and seasoning cube. Boil until tender, reserving the stock.',
                    'Soak dried fish in warm water, clean, and remove bones.',
                    'Heat palm oil in a large pot, sauté onions until golden.',
                    'Add minced garlic and ginger, cook for 2 minutes until fragrant.',
                    'Pour in beef stock, add cooked beef, dried fish, and smoked fish.',
                    'Dissolve limestone in a little water, strain, and add to pot for authentic flavor.',
                    'Add turmeric, ground crayfish, bay leaves, and scotch bonnet pepper.',
                    'Simmer for 30 minutes, allowing flavors to meld. Adjust seasoning.',
                    'Serve hot soup with balls of pounded cocoyam, garnished with scent leaves.'
                ],
                'prep_time': 45,
                'cook_time': 90,
                'servings': 6,
                'difficulty': 'Hard',
                'calories': 520,
                'tags': ['Traditional', 'Authentic', 'Regional', 'Comfort Food', 'Protein-Rich'],
                'tips': [
                    'Limestone (Kanwa) gives authentic flavor but can be omitted if unavailable.',
                    'The cocoyam should be pounded until completely smooth and elastic.',
                    'Don\'t let the soup boil vigorously as it may become cloudy.',
                    'Serve immediately as the cocoyam hardens when cold.'
                ]
            },
            {
                'name': 'Cameroon Pepper Soup (Mbanga Soup)',
                'description': 'A fiery and therapeutic soup from Cameroon, traditionally believed to have medicinal properties. This clear, intensely spiced broth is loaded with tender meat and aromatic spices, making it perfect for cold days or when feeling under the weather. The combination of local spices creates a warming sensation that\'s both comforting and invigorating.',
                'category': 'Central African',
                'ingredients': [
                    '2 lbs goat meat or beef (cut in large pieces)', '1 whole chicken (cut up)',
                    '4 cups water', '2 large onions (roughly chopped)', '6 cloves garlic',
                    '3-inch piece ginger', '3 scotch bonnet peppers', '2 tbsp ground crayfish',
                    '1 tbsp African pepper (Uda) or black peppercorns', '6 scent leaves (basil leaves)',
                    '2 seasoning cubes', '1 tsp curry powder', '2 bay leaves',
                    'Salt to taste', '1 tsp ground nutmeg'
                ],
                'steps': [
                    'Wash and season meat and chicken with salt, blended garlic, and ginger.',
                    'Place seasoned meat in a pot with water and bring to boil.',
                    'Add chopped onions, bay leaves, and seasoning cubes. Cook for 45 minutes.',
                    'Pound scotch bonnet peppers, African pepper, and remaining ginger in a mortar.',
                    'Add the pounded spice mixture to the pot along with ground crayfish.',
                    'Season with curry powder, nutmeg, and additional salt if needed.',
                    'Simmer for 20 minutes until meat is very tender and soup is aromatic.',
                    'Add torn scent leaves in the final 5 minutes of cooking.',
                    'Serve piping hot with boiled yam, plantain, or rice.'
                ],
                'prep_time': 30,
                'cook_time': 75,
                'servings': 6,
                'difficulty': 'Medium',
                'calories': 380,
                'tags': ['Spicy', 'Traditional', 'Healthy', 'Comfort Food', 'Regional'],
                'tips': [
                    'Adjust pepper quantity according to your heat tolerance.',
                    'The soup should be clear, not thick - avoid over-stirring.',
                    'Fresh scent leaves are crucial for authentic flavor.',
                    'This soup is traditionally served very hot for maximum therapeutic effect.'
                ]
            },
            {
                'name': 'Cameroon Ekwang (Cocoyam Leaves Wrap)',
                'description': 'A labor-intensive but deeply rewarding traditional dish from Cameroon, where grated cocoyam is meticulously wrapped in cocoyam leaves with meat and fish, then steamed to perfection. This dish represents the communal cooking traditions of Cameroon, often prepared by extended families working together.',
                'category': 'Central African',
                'ingredients': [
                    '4 lbs white cocoyam (grated)', '30-40 cocoyam leaves (or collard greens)',
                    '1 lb beef (cubed)', '1/2 lb dried fish', '1/4 lb smoked fish',
                    '1/4 lb fresh prawns', '1/4 cup palm oil', '2 large onions (chopped)',
                    '4 cloves garlic (minced)', '2-inch ginger (grated)', '2 tbsp ground crayfish',
                    '2 seasoning cubes', '1 scotch bonnet pepper (minced)', 'Salt to taste',
                    'Kitchen twine for tying', '3 cups water'
                ],
                'steps': [
                    'Wash and grate cocoyam finely. Season with salt and a little palm oil.',
                    'Clean cocoyam leaves, removing tough stems. Blanch briefly in boiling water.',
                    'Season beef and cook until half-done. Add dried fish, smoked fish, and prawns.',
                    'Sauté onions in palm oil until golden, add garlic and ginger.',
                    'Mix sautéed onions with grated cocoyam, ground crayfish, and seasoning.',
                    'Place 2-3 tablespoons of mixture on each leaf, add pieces of meat and fish.',
                    'Wrap leaves carefully, folding edges to seal, then tie with kitchen twine.',
                    'Arrange wrapped parcels in a steamer or large pot with minimal water.',
                    'Steam for 45-60 minutes until cocoyam is cooked and leaves are tender.',
                    'Serve hot, unwrapping the aromatic parcels at the table.'
                ],
                'prep_time': 120,
                'cook_time': 75,
                'servings': 8,
                'difficulty': 'Hard',
                'calories': 445,
                'tags': ['Traditional', 'Authentic', 'Steamed', 'Family', 'Regional'],
                'tips': [
                    'Grating cocoyam can cause itching - wear gloves or oil your hands.',
                    'Don\'t overfill the leaf wraps as cocoyam expands during cooking.',
                    'This is traditionally a communal dish - invite family to help with wrapping.',
                    'Serve with palm wine for an authentic Cameroonian experience.'
                ]
            },
            {
                'name': 'Cameroon Koki (Bean Cake)',
                'description': 'A protein-rich steamed cake made from black-eyed peas, this traditional Cameroonian dish is both nutritious and delicious. Often served at celebrations and special occasions, Koki represents the ingenuity of Cameroonian cuisine in transforming simple ingredients into sophisticated dishes.',
                'category': 'Central African',
                'ingredients': [
                    '3 cups dried black-eyed peas (soaked overnight)', '1/2 cup palm oil',
                    '2 large onions (chopped)', '4 cloves garlic', '2-inch ginger piece',
                    '2 scotch bonnet peppers', '2 tbsp ground crayfish', '2 seasoning cubes',
                    '1 tsp salt', '1/2 cup warm water', 'Banana leaves or aluminum foil for wrapping',
                    '1/4 lb smoked fish (optional)', 'Fresh scent leaves'
                ],
                'steps': [
                    'Remove skins from soaked beans by rubbing between palms and rinsing.',
                    'Blend beans with onions, garlic, ginger, and scotch bonnet peppers until smooth.',
                    'Add palm oil, ground crayfish, seasoning cubes, and salt to the mixture.',
                    'Gradually add warm water to achieve a thick, pourable consistency.',
                    'Fold in flaked smoked fish and chopped scent leaves if using.',
                    'Clean banana leaves and cut into rectangles, or prepare aluminum foil.',
                    'Spoon mixture onto leaves/foil, wrap securely, and tie with string.',
                    'Steam wrapped parcels for 45-60 minutes until firm and cooked through.',
                    'Allow to cool slightly before unwrapping and serving.',
                    'Serve warm as a main dish or side with spicy sauce.'
                ],
                'prep_time': 60,
                'cook_time': 70,
                'servings': 6,
                'difficulty': 'Medium',
                'calories': 320,
                'tags': ['Vegetarian', 'Protein-Rich', 'Traditional', 'Steamed', 'Healthy'],
                'tips': [
                    'Ensure beans are completely skinned for smooth texture.',
                    'The mixture should hold together but not be too thick.',
                    'Banana leaves impart a subtle flavor - blanch them first to make them pliable.',
                    'Test doneness by inserting a toothpick - it should come out clean.'
                ]
            },

            # --- East African ---
            {
                'name': 'Ethiopian Injera with Authentic Doro Wat',
                'description': 'Ethiopia\'s national dish featuring the iconic spongy sourdough flatbread injera paired with a deeply spiced chicken stew. This ancient recipe showcases the complexity of Ethiopian cuisine with its unique fermentation process and the famous berbere spice blend that creates layers of heat and flavor.',
                'category': 'East African',
                'ingredients': [
                    'For Injera:', '4 cups teff flour', '4 cups water', 'Starter culture (optional)',
                    'For Doro Wat:', '2 lbs chicken (cut in pieces)', '6 hard-boiled eggs', '3 large onions (finely chopped)',
                    '1/4 cup berbere spice blend', '1/4 cup niter kibbeh (Ethiopian spiced butter)',
                    '4 cloves garlic (minced)', '2-inch ginger (grated)', '2 tbsp tomato paste',
                    '2 cups chicken broth', '1 tbsp honey', 'Salt to taste'
                ],
                'steps': [
                    'For injera: Mix teff flour and water, let ferment 3-5 days until bubbly and sour.',
                    'Cook injera batter on a large non-stick pan like a crepe, cover until surface is spongy.',
                    'For doro wat: Slowly cook onions in a dry pan until golden and caramelized (45 minutes).',
                    'Add niter kibbeh, berbere, garlic, and ginger. Cook for 5 minutes.',
                    'Add chicken pieces, tomato paste, and broth. Simmer for 45 minutes.',
                    'Add hard-boiled eggs and honey, simmer until sauce is thick.',
                    'Serve doro wat on injera with additional injera on the side.'
                ],
                'prep_time': 4320, # 3 days for fermentation
                'cook_time': 120,
                'servings': 6,
                'difficulty': 'Hard',
                'calories': 580,
                'tags': ['Spicy', 'Traditional', 'Authentic', 'Fermented'],
                'tips': [
                    'Patience is key - proper fermentation creates the signature tangy flavor.',
                    'Niter kibbeh can be substituted with clarified butter mixed with spices.',
                    'The onions must be cooked slowly to develop deep sweetness.',
                    'Eat with your hands using injera as both plate and utensil.'
                ]
            },

            # --- North African ---
            {
                'name': 'Moroccan Lamb Tagine with Apricots',
                'description': 'A quintessential North African slow-cooked stew that perfectly balances savory and sweet flavors. This aromatic dish, traditionally cooked in a conical clay vessel, combines tender lamb with dried fruits and warm spices, creating a luxurious meal that embodies Moroccan hospitality.',
                'category': 'North African',
                'ingredients': [
                    '3 lbs lamb shoulder (cubed)', '2 large onions (sliced)', '4 cloves garlic (minced)',
                    '2-inch ginger (grated)', '1 cup dried apricots', '1/2 cup green olives',
                    '2 preserved lemons (quartered)', '2 tbsp olive oil', '2 tsp ground cinnamon',
                    '2 tsp ground ginger', '1 tsp turmeric', '1 tsp ground cumin',
                    '1/2 tsp saffron threads', '2 cups beef broth', '1/4 cup honey',
                    '1/4 cup almonds (toasted)', 'Fresh cilantro for garnish'
                ],
                'steps': [
                    'Season lamb with salt and pepper, brown in olive oil in tagine or heavy pot.',
                    'Add onions, garlic, and ginger, cook until softened.',
                    'Stir in all spices including saffron, cook until fragrant.',
                    'Add broth, apricots, and honey. Bring to simmer.',
                    'Cover and cook slowly for 2 hours until meat is fork-tender.',
                    'Add olives and preserved lemons in last 30 minutes.',
                    'Garnish with toasted almonds and fresh cilantro before serving.'
                ],
                'prep_time': 30,
                'cook_time': 150,
                'servings': 6,
                'difficulty': 'Medium',
                'calories': 520,
                'tags': ['Traditional', 'Comfort Food', 'Festive', 'One-Pot'],
                'tips': [
                    'Use a real tagine for best results, but a Dutch oven works well too.',
                    'Soak saffron in warm water before adding for better color distribution.',
                    'The dish improves with time - make a day ahead if possible.',
                    'Serve with couscous or crusty bread to soak up the sauce.'
                ]
            },

            # --- Southern African ---
            {
                'name': 'Cape Malay Bobotie',
                'description': 'South Africa\'s beloved national dish, representing the country\'s multicultural heritage. This aromatic baked casserole combines Cape Malay spices with minced meat, topped with a golden egg custard. The dish tells the story of the Cape Malay community\'s influence on South African cuisine.',
                'category': 'Southern African',
                'ingredients': [
                    '2 lbs ground beef or lamb', '2 thick slices white bread', '1 cup milk',
                    '2 large onions (chopped)', '3 cloves garlic (minced)', '2 tbsp curry powder',
                    '1 tsp turmeric', '1 tsp ground coriander', '1 tsp ground cumin',
                    '1/4 cup fruit chutney', '2 tbsp brown sugar', '2 tbsp vinegar',
                    '1/4 cup raisins', '1/4 cup slivered almonds', '6 bay leaves',
                    '3 large eggs', '1 cup milk (for topping)', 'Salt and pepper to taste'
                ],
                'steps': [
                    'Soak bread in milk, then squeeze out excess and crumble.',
                    'Sauté onions and garlic until golden, add spices and cook until fragrant.',
                    'Add ground meat, cook until browned and crumbly.',
                    'Stir in soaked bread, chutney, sugar, vinegar, raisins, and almonds.',
                    'Season with salt and pepper, transfer to greased baking dish.',
                    'Push bay leaves into the surface of the meat mixture.',
                    'Beat eggs with milk for topping, pour over meat mixture.',
                    'Bake at 350°F for 45 minutes until golden and set.'
                ],
                'prep_time': 30,
                'cook_time': 75,
                'servings': 8,
                'difficulty': 'Medium',
                'calories': 465,
                'tags': ['Comfort Food', 'Family', 'Traditional', 'Festive'],
                'tips': [
                    'Use day-old bread for better texture absorption.',
                    'The egg topping should be just set, not overcooked.',
                    'Traditionally served with yellow rice, sambals, and chutney.',
                    'Let rest for 10 minutes before cutting for clean slices.'
                ]
            }
        ]

        # Get or create the specific author
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            # Try to find user by username first, then by email
            author = User.objects.filter(username='foody').first()
            if not author:
                author = User.objects.filter(email='foodonlinepeople23@gmail.com').first()
            
            # If user doesn't exist, create one
            if not author:
                author = User.objects.create_user(
                    username='foody',
                    email='foodonlinepeople23@gmail.com',
                    first_name='Chef',
                    last_name='Foody'
                )
                self.stdout.write(self.style.SUCCESS('Created new user: foody'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error with user creation: {e}'))
            # Fallback to first available user
            author = User.objects.first()

        created_count = 0
        skipped_count = 0

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
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created recipe: {recipe.title}'))

                # Add tags
                for tag_name in recipe_data.get('tags', []):
                    tag = tags.get(tag_name)
                    if tag:
                        recipe.tags.add(tag)

                # Clear existing ingredients, steps, and tips (if any)
                recipe.ingredient_items.all().delete()
                recipe.steps.all().delete()
                recipe.tips.all().delete()

                # Add ingredients
                for ingredient_name in recipe_data['ingredients']:
                    Ingredient.objects.create(recipe=recipe, name=ingredient_name, amount='')

                # Add steps
                for step_text in recipe_data['steps']:
                    Step.objects.create(recipe=recipe, description=step_text)

                # Add tips
                for tip_text in recipe_data.get('tips', []):
                    Tip.objects.create(recipe=recipe, description=tip_text)
            else:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f'Recipe "{recipe.title}" already exists. Skipping.'))

        self.stdout.write(
            self.style.SUCCESS(
                f'Finished generating recipes. Created: {created_count}, Skipped: {skipped_count}'
            )
        )