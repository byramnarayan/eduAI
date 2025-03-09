from django import forms
from .models import Note
from django import forms
from .models import Note

class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'content']  # Make sure the 'content' field is included

    content = forms.CharField(widget=forms.Textarea, required=True)

