from django.contrib import admin
from .models import Product, Cart, CartItem, Ingredient, PlatformIngredient, PlatformIngredientCart, PlatformIngredientCartItem


class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'amazon_url')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')


class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'source_url')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')


class PlatformIngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'unit', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')


class PlatformIngredientCartItemInline(admin.TabularInline):
    model = PlatformIngredientCartItem
    extra = 0


class PlatformIngredientCartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    inlines = [PlatformIngredientCartItemInline]


admin.site.register(Product, ProductAdmin)
admin.site.register(Ingredient, IngredientAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(PlatformIngredient, PlatformIngredientAdmin)
admin.site.register(PlatformIngredientCart, PlatformIngredientCartAdmin)
admin.site.register(PlatformIngredientCartItem)
