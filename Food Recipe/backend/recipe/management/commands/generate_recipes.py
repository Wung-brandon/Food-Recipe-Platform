import random
from django.core.management.base import BaseCommand
from faker import Faker
from recipe.models import (
    Category, Tag, Recipe, Ingredient, Step, Tip, Comment, Rating, FavoriteRecipe, LikedRecipe
)
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Generate fake data for the Recipe app'

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, help='The number of recipes to create')

    def handle(self, *args, **kwargs):
        fake = Faker()
        count = kwargs['count']

        # Predefined food-related categories
        category_names = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Baked Goods', 'Snacks', 'Drinks']
        categories = []
        for name in category_names:
            category = Category.objects.create(
                name=name,
                description=f"A collection of delicious {name.lower()} recipes."
            )
            categories.append(category)
        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(categories)} categories."))

        # Predefined food-related recipe titles
        recipe_titles = [
            "Classic Pancakes", "Spaghetti Bolognese", "Chocolate Cake", "Grilled Chicken Salad",
            "Homemade Pizza", "Vegetable Stir Fry", "Blueberry Muffins", "Beef Tacos",
            "Lemonade", "Apple Pie", "Garlic Bread", "Caesar Salad", "Vanilla Ice Cream"
        ]

        # Generate random tags
        tags = []
        for _ in range(10):
            tag_name = fake.word().capitalize()
            tag = Tag.objects.create(name=tag_name)
            tags.append(tag)
        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(tags)} tags."))

        # Generate random users
        users = []
        for _ in range(5):
            user = User.objects.create_user(
                email=fake.email(),
                username=fake.user_name(),
                password='password123'
            )
            users.append(user)
        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(users)} users."))

        # Generate random recipes
        for _ in range(count):
            author = random.choice(users)
            category = random.choice(categories)
            recipe_title = random.choice(recipe_titles)
            recipe = Recipe.objects.create(
                author=author,
                title=recipe_title,
                description=f"A delicious recipe for {recipe_title.lower()} that is perfect for {category.name.lower()}.",
                preparation_time=random.randint(10, 60),
                cooking_time=random.randint(10, 120),
                servings=random.randint(1, 10),
                difficulty=random.choice(['Easy', 'Medium', 'Hard', 'Expert']),
                calories=random.randint(100, 1000),
                category=category
            )
            recipe.tags.add(*random.sample(tags, random.randint(1, 3)))

            # Generate ingredients
            for _ in range(random.randint(3, 10)):
                Ingredient.objects.create(
                    recipe=recipe,
                    name=fake.word(),
                    amount=f"{random.randint(1, 500)} grams"
                )

            # Generate steps
            for step_number in range(1, random.randint(3, 10)):
                Step.objects.create(
                    recipe=recipe,
                    description=f"Step {step_number}: {fake.sentence()}",
                    order=step_number
                )

            # Generate tips
            for _ in range(random.randint(1, 3)):
                Tip.objects.create(
                    recipe=recipe,
                    description=fake.text(max_nb_chars=200)
                )

            # Generate comments
            for _ in range(random.randint(1, 5)):
                Comment.objects.create(
                    recipe=recipe,
                    user=random.choice(users),
                    text=fake.text(max_nb_chars=300)
                )

            # Generate ratings
            for _ in range(random.randint(1, 5)):
                Rating.objects.create(
                    recipe=recipe,
                    user=random.choice(users),
                    value=random.uniform(0, 5)
                )

            # Generate favorites
            for _ in range(random.randint(1, 3)):
                user = random.choice(users)
                if not FavoriteRecipe.objects.filter(user=user, recipe=recipe).exists():
                    FavoriteRecipe.objects.create(
                        user=user,
                        recipe=recipe
                    )

            # Generate likes
            for _ in range(random.randint(1, 3)):
                user = random.choice(users)
                if not LikedRecipe.objects.filter(user=user, recipe=recipe).exists():
                    LikedRecipe.objects.create(
                        user=user,
                        recipe=recipe
                    )

            self.stdout.write(self.style.SUCCESS(f'Successfully created recipe: {recipe_title}'))