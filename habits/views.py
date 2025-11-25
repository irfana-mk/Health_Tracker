from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Habit, CheckIn, Note
from .serializers import HabitSerializer, CheckInSerializer, NoteSerializer

class HabitViewSet(viewsets.ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer
    
    @action(detail=True, methods=['post'])
    def checkin(self, request, pk=None):
        """Toggle check-in for a specific date"""
        habit = self.get_object()
        date = request.data.get('date')
        
        if not date:
            return Response(
                {'error': 'Date is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        checkin, created = CheckIn.objects.get_or_create(
            habit=habit, 
            date=date
        )
        
        if not created:
            # If check-in already exists, remove it (toggle off)
            checkin.delete()
            return Response(
                {'message': 'Check-in removed', 'checked': False}, 
                status=status.HTTP_200_OK
            )
        
        # Return the created check-in
        serializer = CheckInSerializer(checkin)
        return Response(
            {'checkin': serializer.data, 'checked': True}, 
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to a habit"""
        habit = self.get_object()
        text = request.data.get('text')
        
        if not text or not text.strip():
            return Response(
                {'error': 'Note text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = Note.objects.create(habit=habit, text=text.strip())
        serializer = NoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)