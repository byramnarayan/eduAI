from django.shortcuts import render
from .compiler import compile_and_run

def compiler_view(request):
    if request.method == 'POST':
        code = request.POST.get('code')  # Code submitted by the user
        language = request.POST.get('language')  # Selected language
        output, errors = compile_and_run(code, language)  # Call the compiler logic
        return render(request, 'compile/home.html', {'output': output, 'errors': errors})
    return render(request, 'compile/home.html')
