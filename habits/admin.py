from django.contrib import admin
from .models import Habit, CheckIn, Note

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['name', 'frequency', 'category', 'start_date']
    list_filter = ['frequency', 'category']
    search_fields = ['name']

@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ['habit', 'date']
    list_filter = ['date']
    search_fields = ['habit__name']

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['habit', 'text', 'date']
    list_filter = ['date']
    search_fields = ['habit__name', 'text']