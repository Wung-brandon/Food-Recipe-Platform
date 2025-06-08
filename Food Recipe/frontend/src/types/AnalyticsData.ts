export interface AnalyticsData {
  viewsData: Array<{
    name: string;
    views: number;
    uniqueVisitors: number;
  }>;
  recipesPerformance: Array<{
    name: string;
    views: number;
    likes: number;
    comments: number;
    conversionRate: string;
  }>;
  followers: {
    count: number;
    growth: number;
    growthPercentage: number;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    likesPercentage: number;
    commentsPercentage: number;
    sharesPercentage: number;
    savesPercentage: number;
  };
  topRecipes: Array<{
    name: string;
    views: number;
    likes: number;
    comments: number;
    conversionRate: string;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
}