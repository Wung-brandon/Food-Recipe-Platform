# Food Recipe/backend/shop/management/commands/scrape_african_ingredients.py
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from shop.models import Ingredient

class Command(BaseCommand):
    help = 'Scrapes ingredient data from African Food Supermarket and populates the database.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting African Food Supermarket scraping...'))

        base_url = 'https://shop.africanfoodsupermarket.com/'
        # You will need to find the URLs for relevant categories
        category_urls = [
            'https://shop.africanfoodsupermarket.com/collections/seasonings-spices',
            'https://shop.africanfoodsupermarket.com/collections/pantry-1',
            'https://shop.africanfoodsupermarket.com/collections/drinks-beverages',
            'https://shop.africanfoodsupermarket.com/collections/grains-rice-cereal',
            'https://shop.africanfoodsupermarket.com/collections/frozen'
            # Add more category URLs as needed
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }

        for category_url in category_urls:
            self.stdout.write(f'Scraping category: {category_url}') # Modified line
            page_num = 1
            while True:
                url_to_scrape = f'{category_url}?page={page_num}' if page_num > 1 else category_url
                self.stdout.write(f'Fetching page: {url_to_scrape}') # Modified line

                try:
                    response = requests.get(url_to_scrape, headers=headers)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Find product elements - you need to inspect the website's HTML
                    # Look for the container that holds each product listing
                    product_elements = soup.select('.product-item') # This is a placeholder, inspect the actual website

                    if not product_elements:
                        self.stdout.write(f'No products found on page {page_num}.') # Modified line
                        break # No more pages or no products on this page

                    for product_element in product_elements:
                        try:
                            # Extract product information - you need to inspect the website's HTML
                            name_element = product_element.select_one('.product-item__title') # Placeholder
                            image_element = product_element.select_one('.product-item__primary-image') # Placeholder
                            price_element = product_element.select_one('.price') # Placeholder
                            source_url_element = product_element.select_one('a') # Placeholder for the link to the product page

                            name = name_element.get_text(strip=True) if name_element else 'N/A'
                            image_url = image_element['src'] if image_element and 'src' in image_element.attrs else None
                            price_text = price_element.get_text(strip=True) if price_element else None
                            source_url = source_url_element['href'] if source_url_element and 'href' in source_url_element.attrs else None

                            # Clean up price if available
                            price = None
                            if price_text:
                                try:
                                    # Adjust this based on how prices are formatted on the website
                                    price = float(price_text.replace('$', '').replace(',', '').strip())
                                except ValueError:
                                    self.stdout.write(self.style.WARNING(f'Could not parse price for {name}: {price_text}'))


                            # Construct full source URL if it's relative
                            if source_url and source_url.startswith('/'):
                                source_url = base_url.rstrip('/') + source_url


                            # Create or update the ingredient in the database
                            if name != 'N/A' and source_url: # Ensure we have at least a name and source URL
                                ingredient, created = Ingredient.objects.update_or_create(
                                    source_url=source_url, # Use source URL as a unique identifier
                                    defaults={
                                        'name': name,
                                        'image_url': image_url,
                                        'price': price,
                                        # You might need to scrape description and unit from individual product pages if needed
                                    }
                                )

                                if created:
                                    self.stdout.write(self.style.SUCCESS(f'Created ingredient: {ingredient.name}'))
                                else:
                                    self.stdout.write(f'Updated ingredient: {ingredient.name}') # Modified line
                            else:
                                self.stdout.write(self.style.WARNING(f'Skipping incomplete product: Name: {name}, Source URL: {source_url}'))


                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'Error scraping product element: {e}'))
                            continue

                    page_num += 1 # Move to the next page

                except requests.exceptions.RequestException as e:
                    self.stdout.write(self.style.ERROR(f'Error fetching the page {url_to_scrape}: {e}'))
                    break # Stop scraping this category on error
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'An unexpected error occurred during scraping: {e}'))
                    break # Stop scraping this category on unexpected error


        self.stdout.write(self.style.SUCCESS('African Food Supermarket scraping finished.'))
