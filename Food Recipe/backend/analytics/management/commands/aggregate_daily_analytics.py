from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import CustomUser
from datetime import datetime, timedelta
from analytics.models import (
    RecipeView, RecipeLike, RecipeComment, RecipeShare, 
    RecipeSave, UserFollowing, DailyAnalyticsSummary
)

class Command(BaseCommand):
    help = 'Aggregate daily analytics data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date to aggregate (YYYY-MM-DD). Defaults to yesterday.',
        )
    
    def handle(self, *args, **options):
        if options['date']:
            target_date = datetime.strptime(options['date'], '%Y-%m-%d').date()
        else:
            target_date = timezone.now().date() - timedelta(days=1)
        
        self.stdout.write(f'Aggregating analytics data for {target_date}')
        
        users_with_recipes = CustomUser.objects.filter(recipes__isnull=False).distinct()
        
        for user in users_with_recipes:
            user_recipes = user.recipes.all()
            
            # Get daily metrics
            daily_views = RecipeView.objects.filter(
                recipe__in=user_recipes,
                viewed_at__date=target_date
            ).count()
            
            unique_visitors = RecipeView.objects.filter(
                recipe__in=user_recipes,
                viewed_at__date=target_date
            ).values('ip_address').distinct().count()
            
            daily_likes = RecipeLike.objects.filter(
                recipe__in=user_recipes,
                created_at__date=target_date
            ).count()
            
            daily_comments = RecipeComment.objects.filter(
                recipe__in=user_recipes,
                created_at__date=target_date
            ).count()
            
            daily_shares = RecipeShare.objects.filter(
                recipe__in=user_recipes,
                shared_at__date=target_date
            ).count()
            
            daily_saves = RecipeSave.objects.filter(
                recipe__in=user_recipes,
                saved_at__date=target_date
            ).count()
            
            new_followers = UserFollowing.objects.filter(
                following=user,
                created_at__date=target_date
            ).count()
            
            recipe_count = user_recipes.count()
            
            # Create or update daily summary
            summary, created = DailyAnalyticsSummary.objects.update_or_create(
                user=user,
                date=target_date,
                defaults={
                    'total_views': daily_views,
                    'unique_visitors': unique_visitors,
                    'total_likes': daily_likes,
                    'total_comments': daily_comments,
                    'total_shares': daily_shares,
                    'total_saves': daily_saves,
                    'new_followers': new_followers,
                    'recipe_count': recipe_count,
                }
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} summary for {user.username}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully aggregated analytics for {target_date}')
        )