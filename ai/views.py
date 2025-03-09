from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import requests
import json 
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Chat, Message

# Gemini API Configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?"
API_KEY="AIzaSyAu_reoQxo9TH71mFzp3yilEX5YqLkn3b0"

@login_required
def home(request):
    user_chats = Chat.objects.filter(user=request.user) if request.user.is_authenticated else []
    
    if request.method == "POST":
        try:
            # Get the data from the frontend
            data = json.loads(request.body)
            question = data.get("question", "")
            chat_id = data.get("chat_id", None)
            
            # Get or create a chat
            if chat_id:
                chat = get_object_or_404(Chat, id=chat_id, user=request.user)
            else:
                # Create a new chat with the first few words of the question as the title
                title = question[:30] + "..." if len(question) > 30 else question
                chat = Chat.objects.create(
                    title=title,
                    user=request.user
                )
            
            # Save the user's message
            Message.objects.create(
                chat=chat,
                content=question,
                message_type='user'
            )
            
            # Modify the prompt to request structured responses
            structured_prompt = f"""
            Please provide a structured and well-organized response to the following question:
            
            {question}
            
            Format your response with:
            1. Clear sections with headings if appropriate
            2. Bullet points for lists
            3. Numbered steps for instructions
            4. Bold text for important points
            5. Well-organized paragraphs
            
            Make sure your response is concise and easy to read.
            """
            
            # Make the API call to Gemini with the structured prompt
            response = requests.post(
                GEMINI_API_URL,
                params={'key': API_KEY},
                json={
                    "contents": [{
                        "parts": [{"text": structured_prompt}]
                    }]
                }
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                # Extract the answer based on Gemini's response format
                answer = ai_response.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response from AI.")
                
                # Save the AI's response
                Message.objects.create(
                    chat=chat,
                    content=answer,
                    message_type='ai'
                )
            else:
                answer = f"Error from Gemini API: {response.status_code} - {response.text}"
            
            return JsonResponse({
                "answer": answer,
                "chat_id": chat.id
            })
            
        except Exception as e:
            return JsonResponse({"answer": f"Error processing your question: {e}"})
    
    return render(request, 'ai/home.html', {
        'title': 'AI Chat',
        'chats': user_chats
    })

@login_required
def view_chat(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, user=request.user)
    messages = chat.messages.all()
    user_chats = Chat.objects.filter(user=request.user)
    
    return render(request, 'ai/home.html', {
        'title': chat.title,
        'current_chat': chat,
        'messages': messages,
        'chats': user_chats
    })