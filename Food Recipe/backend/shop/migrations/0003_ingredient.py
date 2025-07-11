# Generated by Django 4.2.20 on 2025-06-10 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shop", "0002_alter_product_amazon_url_alter_product_image_url_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Ingredient",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=500)),
                ("description", models.TextField(blank=True, null=True)),
                ("image_url", models.URLField(blank=True, max_length=1000, null=True)),
                ("source_url", models.URLField(max_length=1000)),
                (
                    "price",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("unit", models.CharField(blank=True, max_length=50, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
