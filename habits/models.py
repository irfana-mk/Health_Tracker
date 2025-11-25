from django.db import models

class Habit(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    
    CATEGORY_CHOICES = [
        ('health', 'Health'),
        ('work', 'Work'),
        ('learning', 'Learning'),
        ('fitness', 'Fitness'),
        ('mental health', 'Mental Health'),
        ('productivity', 'Productivity'),
    ]
    
    name = models.CharField(max_length=100)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='health')
    start_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class CheckIn(models.Model):
    habit = models.ForeignKey(Habit, related_name='checkins', on_delete=models.CASCADE)
    date = models.DateField()
    
    class Meta:
        unique_together = ('habit', 'date')
    
    def __str__(self):
        return f"{self.habit.name} - {self.date}"

class Note(models.Model):
    habit = models.ForeignKey(Habit, related_name='notes', on_delete=models.CASCADE)
    text = models.TextField()
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.habit.name} - {self.date}: {self.text[:50]}"