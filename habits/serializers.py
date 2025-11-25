from rest_framework import serializers
from .models import Habit, CheckIn, Note

class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ['id', 'date']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'text', 'date']

class HabitSerializer(serializers.ModelSerializer):
    checkins = CheckInSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Habit
        fields = ['id', 'name', 'frequency', 'category', 'start_date', 'checkins', 'notes']