from django.shortcuts import render
from .compiler_service import compile_and_run  # Import the compiler logic

def home(request):
    output = None
    errors = None

    if request.method == 'POST':
        code = request.POST.get('code', '').strip()  # Get code safely
        language = request.POST.get('language', '').strip()  # Get language safely

        print(f"Received Code: {code}")  # Debugging
        print(f"Language Selected: {language}")  # Debugging

        if not code:
            errors = "Code cannot be empty."
        elif language not in ['python', 'c']:
            errors = "Invalid language selected."
        else:
            output, errors = compile_and_run(code, language)  # Run compiler

    return render(request, 'learn/home.html', {'output': output, 'errors': errors})

# Corrected view.py file
import subprocess
import tempfile
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # In a production app, handle CSRF properly
def run_code(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'})
    
    code = request.POST.get('code', '')
    language = request.POST.get('language', 'python')
    
    if not code:
        return JsonResponse({'error': 'No code provided'})
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=get_file_extension(language)) as temp_file:
        temp_file.write(code.encode())
        file_path = temp_file.name
    
    try:
        # Execute the code based on language
        result = execute_code(file_path, language)
        return JsonResponse(result)
    finally:
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

def get_file_extension(language):
    extensions = {
        'python': '.py',
        'javascript': '.js',
        'java': '.java',
        'cpp': '.cpp',
        'c': '.c'
    }
    return extensions.get(language, '.txt')

def execute_code(file_path, language):
    try:
        if language == 'python':
            process = subprocess.Popen(
                ['python', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True  # Remove timeout from here
            )
        elif language == 'javascript':
            process = subprocess.Popen(
                ['node', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True  # Remove timeout from here
            )
        # Add handlers for other languages as needed
        else:
            return {'error': f'Language {language} is not supported yet'}
        
        try:
            # Apply timeout in communicate method instead
            stdout, stderr = process.communicate(timeout=10)
            
            if stderr:
                return {'error': stderr}
            else:
                return {'output': stdout}
        except subprocess.TimeoutExpired:
            # Make sure to kill the process if it times out
            process.kill()
            return {'error': 'Code execution timed out (10 seconds)'}
            
    except Exception as e:
        return {'error': str(e)}

