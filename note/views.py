from django.shortcuts import render
from django.http import HttpResponse
from .models import Note
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin 
from django.contrib.auth.decorators import login_required 
from django.views.generic import ListView,DetailView,CreateView, UpdateView, DeleteView
from .models import Note
from django.urls import reverse_lazy
from django.shortcuts import render, redirect
from .forms import NoteForm
from .models import Note
from django.shortcuts import render
from django.http import HttpResponse
from .models import Note
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse_lazy
from django.utils.html import strip_tags

@login_required
def create_note(request):
    if request.method == 'POST':
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.user = request.user  # Associate the note with the logged-in user
            note.save()
            return redirect('note-home')  # Redirect to a page that lists the notes (or wherever appropriate)
    else:
        form = NoteForm()

    return render(request, 'note/note_form.html', {'form': form})


class NotesListView(LoginRequiredMixin, ListView):
    model = Note
    template_name = 'note/note.html'  # Update with the appropriate template
    context_object_name = 'notes'

    def get_queryset(self):
        # Filter notes by the logged-in user
        notes = Note.objects.filter(user=self.request.user).order_by('-date_created')

        # Strip HTML tags from note content before passing it to the template
        for note in notes:
            note.content = strip_tags(note.content)  # Strips HTML tags from content

        return notes
    

class NoteDetailView(LoginRequiredMixin, DetailView):
    model = Note
    template_name = 'note/note_detail.html'  # Update with the appropriate template
    context_object_name = 'note'

    def get_queryset(self):
        # Ensure the user can only view their own notes
        return Note.objects.filter(user=self.request.user)
    


class NoteCreateView(LoginRequiredMixin, CreateView):
    model = Note
    fields = ['title', 'content']  # Note that content will be populated by Summernote
    template_name = 'note/note_form.html'

    def form_valid(self, form):
        form.instance.user = self.request.user  # Assign logged-in user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('note-home')  # Redirect to note home after saving

