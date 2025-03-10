from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
import requests
import json 
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import ChatSession, ChatMessage

# Gemini API Configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?"
API_KEY="AIzaSyAu_reoQxo9TH71mFzp3yilEX5YqLkn3b0"

@login_required
def home(request):
    # Get user's chat sessions
    chat_sessions = ChatSession.objects.filter(user=request.user)
    
    # Handle active session
    active_session_id = request.GET.get('session')
    active_session = None
    active_messages = []
    
    if active_session_id:
        active_session = get_object_or_404(ChatSession, id=active_session_id, user=request.user)
        active_messages = ChatMessage.objects.filter(session=active_session)
    
    if request.method == "POST":
        try:
            # Get the question from the frontend
            data = json.loads(request.body)
            question = data.get("question", "")
            session_id = data.get("session_id")
            new_session_title = data.get("new_session_title", question[:50])  # Use first 50 chars of question as title
            
            # Get or create session
            if session_id:
                chat_session = get_object_or_404(ChatSession, id=session_id, user=request.user)
            else:
                chat_session = ChatSession.objects.create(
                    user=request.user,
                    title=new_session_title
                )
            
            # Save user message
            ChatMessage.objects.create(
                session=chat_session,
                is_user_message=True,
                content=question
            )
            
            if question:
                # Make the API call to Gemini
                response = requests.post(
                    GEMINI_API_URL,
                    params={'key': API_KEY},
                    json={
                        "contents": [{
                            "parts": [{"text": question}]
                        }]
                    }
                )

                if response.status_code == 200:
                    ai_response = response.json()
                    answer = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response from AI.")
                    
                    # Save AI response
                    ChatMessage.objects.create(
                        session=chat_session,
                        is_user_message=False,
                        content=answer
                    )
                else:
                    answer = f"Error from Gemini API: {response.status_code} - {response.text}"

                return JsonResponse({
                    "answer": answer, 
                    "session_id": chat_session.id
                })

            return JsonResponse({"answer": "No question provided."})

        except Exception as e:
            print(f"Error processing request: {e}")
            return JsonResponse({"answer": f"Error processing your question: {e}"})

    # For GET requests, render the home page with chat history
    return render(request, 'ai/home.html', {
        'title': 'AI Chat',
        'chat_sessions': chat_sessions,
        'active_session': active_session,
        'active_messages': active_messages,
    })

@login_required
def delete_session(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    session.delete()
    return redirect('ai-home')