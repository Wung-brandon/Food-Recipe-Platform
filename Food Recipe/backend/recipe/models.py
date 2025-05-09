# recipes/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    image = models.ImageField(upload_to='category_pics/', blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Recipe(models.Model):
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
        ('Expert', 'Expert'),
    )

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to='recipe_pics/', blank=True, null=True)
    preparation_time = models.PositiveIntegerField(help_text="Time in minutes")
    cooking_time = models.PositiveIntegerField(help_text="Time in minutes")
    servings = models.PositiveIntegerField(default=1)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    calories = models.PositiveIntegerField(blank=True, null=True, help_text="Calories per serving")
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='recipes')
    tags = models.ManyToManyField(Tag, blank=True, related_name='recipes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    favorites = models.ManyToManyField(User, through='FavoriteRecipe', related_name='favorite_recipes')
    likes = models.ManyToManyField(User, through='LikedRecipe', related_name='liked_recipes')
    
    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            # Check for duplicate slugs
            count = 1
            while Recipe.objects.filter(slug=self.slug).exists():
                self.slug = f"{slugify(self.title)}-{count}"
                count += 1
        super().save(*args, **kwargs)
    
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum(r.value for r in ratings) / ratings.count()
        return 0
    
    def rating_count(self):
        return self.ratings.count()
    
    def like_count(self):
        return self.likes.count()
    
    def __str__(self):
        return self.title


class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=100)
    amount = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.name} - {self.amount}"


class Step(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='steps')
    description = models.TextField()
    order = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Step {self.order} for {self.recipe.title}"


class Tip(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='tips')
    description = models.TextField()
    
    def __str__(self):
        return f"Tip for {self.recipe.title}: {self.description[:30]}..."


class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipe_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.recipe.title}"


class Rating(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipe_ratings')
    value = models.DecimalField(
        max_digits=3, 
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('recipe', 'user')
        
    def __str__(self):
        return f"{self.user.username} rated {self.recipe.title}: {self.value}"


class FavoriteRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')
        
    def __str__(self):
        return f"{self.user.username} favorited {self.recipe.title}"


class LikedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')
        
    def __str__(self):
        return f"{self.user.username} liked {self.recipe.title}"