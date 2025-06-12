import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from shop.models import Product
import time
import random
import re

class Command(BaseCommand):
    help = 'Scrapes kitchen utensil data from Amazon and populates the database.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Amazon scraping...'))

        # Amazon search URL for kitchen utensils
        search_url = 'https://www.amazon.com/s?k=kitchen+utensils&ref=sr_pg_1'

        # Updated headers to better mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Cache-Control': 'max-age=0',
        }

        try:
            # Add a small delay to avoid being detected as a bot
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(search_url, headers=headers)
            response.raise_for_status()

            # Save the HTML for debugging
            with open('amazon_search_debug.html', 'wb') as f:
                f.write(response.content)
            self.stdout.write(self.style.WARNING('Saved HTML response to amazon_search_debug.html for inspection.'))

            soup = BeautifulSoup(response.content, 'html.parser')

            # Multiple possible selectors for product containers (Amazon changes these frequently)
            product_selectors = [
                'div[data-component-type="s-search-result"]',
                'div[data-cy="title-recipe-list"]',
                'div.s-result-item',
                'div[data-asin]',
                '.s-result-item[data-component-type="s-search-result"]'
            ]

            products = []
            for selector in product_selectors:
                products = soup.select(selector)
                if products:
                    self.stdout.write(self.style.SUCCESS(f'Found {len(products)} products using selector: {selector}'))
                    break

            if not products:
                self.stdout.write(self.style.WARNING('No products found with any selector. Amazon may have changed its structure.'))
                return

            # Multiple possible selectors for product elements
            name_selectors = [
                'h2 a span',
                'h2.a-size-mini span',
                '.a-size-base-plus',
                '.a-size-medium.a-spacing-none.a-color-base',
                'span.a-size-base-plus.a-spacing-none.a-color-base.a-text-normal',
                '[data-cy="title-recipe-list"] h2 a span',
                'h2 span'
            ]

            price_selectors = [
                '.a-price-whole',
                '.a-price .a-offscreen',
                'span.a-price-whole',
                '.a-price-symbol + .a-price-whole',
                '.a-price-range .a-price .a-offscreen'
            ]

            image_selectors = [
                'img.s-image',
                '.s-image',
                'img[data-image-latency="s-product-image"]',
                'img[src*="images-amazon"]'
            ]

            url_selectors = [
                'h2 a',
                'a.a-link-normal.s-line-clamp-4',
                '.a-link-normal[href*="/dp/"]',
                'a[href*="/dp/"]'
            ]

            successful_scrapes = 0
            
            for product_element in products[:20]:  # Limit to first 20 products to avoid being blocked
                try:
                    # Try to find name using multiple selectors
                    name = None
                    for selector in name_selectors:
                        name_tag = product_element.select_one(selector)
                        if name_tag:
                            name = name_tag.get_text(strip=True)
                            if name and len(name) > 5:  # Ensure we have a meaningful name
                                break
                    
                    # Try to find price using multiple selectors
                    price = None
                    for selector in price_selectors:
                        price_tag = product_element.select_one(selector)
                        if price_tag:
                            price_text = price_tag.get_text(strip=True)
                            # Extract numeric price from text
                            price_match = re.search(r'[\d,]+\.?\d*', price_text.replace('$', ''))
                            if price_match:
                                price = price_match.group().replace(',', '')
                                break
                    
                    # Try to find image using multiple selectors
                    image_url = None
                    for selector in image_selectors:
                        image_tag = product_element.select_one(selector)
                        if image_tag and image_tag.get('src'):
                            image_url = image_tag['src']
                            break
                    
                    # Try to find URL using multiple selectors
                    amazon_url = None
                    for selector in url_selectors:
                        url_tag = product_element.select_one(selector)
                        if url_tag and url_tag.get('href'):
                            amazon_url = url_tag['href']
                            break

                    # Validate that we have the minimum required data
                    if not name or not price or not amazon_url:
                        missing = []
                        if not name:
                            missing.append('name')
                        if not price:
                            missing.append('price')
                        if not amazon_url:
                            missing.append('amazon_url')
                        self.stdout.write(self.style.WARNING(f'Skipping product due to missing fields: {", ".join(missing)}'))
                        continue

                    # Clean up and validate price
                    try:
                        price = float(price)
                        if price <= 0:
                            continue
                    except (ValueError, TypeError):
                        self.stdout.write(self.style.WARNING(f'Skipping product "{name}" due to invalid price: {price}'))
                        continue

                    # Construct the full Amazon URL if it's a relative path
                    if amazon_url.startswith('/'):
                        amazon_url = 'https://www.amazon.com' + amazon_url

                    # Use a default image if none found
                    if not image_url:
                        image_url = 'https://via.placeholder.com/300x300?text=No+Image'

                    # Create or update the product in the database
                    product, created = Product.objects.update_or_create(
                        amazon_url=amazon_url,
                        defaults={
                            'name': name[:255],  # Truncate name if too long
                            'description': 'Kitchen utensil from Amazon',
                            'price': price,
                            'image_url': image_url,
                        }
                    )

                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Created product: {product.name} - ${product.price}'))
                    else:
                        self.stdout.write(self.style.SUCCESS(f'Updated product: {product.name} - ${product.price}'))
                    
                    successful_scrapes += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error scraping product: {e}'))
                    continue

                # Add small delay between products to avoid being blocked
                time.sleep(random.uniform(0.5, 1.5))

            self.stdout.write(self.style.SUCCESS(f'Amazon scraping finished. Successfully scraped {successful_scrapes} products.'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Error fetching the Amazon page: {e}'))
            self.stdout.write(self.style.WARNING('This might be due to Amazon blocking your IP or user agent.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error occurred: {e}'))