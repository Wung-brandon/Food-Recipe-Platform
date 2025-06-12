from django.core.management.base import BaseCommand
from shop.models import PlatformIngredient

AFRICAN_INGREDIENTS = [
    {
        "name": "Cassava Flour",
        "description": "A staple flour used in many West African dishes, made from ground cassava root.",
        "price": 5.00,
        "unit": "kg",
        "image_url": None
    },
    {
        "name": "Egusi Seeds",
        "description": "Melon seeds used to thicken and flavor soups, especially in Nigeria and Ghana.",
        "price": 8.50,
        "unit": "500g",
        "image_url": None
    },
    {
        "name": "Palm Oil",
        "description": "Red palm oil, a key ingredient in many African stews and soups.",
        "price": 4.00,
        "unit": "litre",
        "image_url": None
    },
    {
        "name": "Dried Fish",
        "description": "Sun-dried fish, used to add umami and depth to soups and sauces.",
        "price": 7.00,
        "unit": "pack",
        "image_url": None
    },
    {
        "name": "Ugu (Fluted Pumpkin Leaves)",
        "description": "Leafy green vegetable popular in Nigerian cuisine.",
        "price": 3.00,
        "unit": "bunch",
        "image_url": None
    },
    {
        "name": "Fonio",
        "description": "A nutritious ancient grain grown in West Africa, used for porridge and couscous.",
        "price": 6.00,
        "unit": "kg",
        "image_url": None
    },
    {
        "name": "Baobab Powder",
        "description": "Powdered fruit pulp from the baobab tree, rich in vitamin C and used in drinks and sauces.",
        "price": 9.00,
        "unit": "250g",
        "image_url": None
    },
    {
        "name": "Suya Spice Mix",
        "description": "A spicy, nutty seasoning blend for grilled meats, popular in Nigeria.",
        "price": 2.50,
        "unit": "100g",
        "image_url": None
    },
    {
        "name": "Berbere Spice",
        "description": "A fiery Ethiopian spice blend used in stews and meats.",
        "price": 3.50,
        "unit": "100g",
        "image_url": None
    },
    {
        "name": "Dried Okra",
        "description": "Sliced and dried okra, used to thicken soups and stews in West and Central Africa.",
        "price": 4.50,
        "unit": "200g",
        "image_url": None
    },
]

class Command(BaseCommand):
    help = 'Generate African platform ingredients for the database.'

    def handle(self, *args, **options):
        for data in AFRICAN_INGREDIENTS:
            obj, created = PlatformIngredient.objects.get_or_create(
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "price": data["price"],
                    "unit": data["unit"],
                    "image_url": data["image_url"]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created: {obj.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {obj.name}"))
        self.stdout.write(self.style.SUCCESS("African platform ingredients generation complete."))
