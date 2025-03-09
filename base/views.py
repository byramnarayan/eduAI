from django.shortcuts import render # To render the HTML template.
from django.http import HttpResponse
# Create your views here.

# to add the template: base -> templates -> base -> home.html Note: it is django convention to create a templates folder in each app and then create a folder with the same name as the app inside the templates folder. This is where we will store our HTML templates for the app.

# need to add base app to our list of installed app so django known look to there template for diectory. now to add out app to list recommded to add app to projects setting.py file | so app config located to INSTALLED_APP Module | after that go to setting.py of project and add the templates path in the INSTALLED_APPS -> 
''' OLD Example: 
def home(request):
    return HttpResponse("Hello, Django!") # home Step 03. Return a simple HTTP response from the view. This response will be displayed in the browser when the user visits the home page.
    '''
def home(request):
    return render(request, 'base/home.html') # render(request <always take return as frist argument>, 'base/home.html'< Look for the HTML template in the base app's templates/base folder.>)
def about(request):
    return render(request, 'base/about.html', {'title':'About'}) # Optional: {'title':'About'} want to add title it is short to we added the dict in with title key and value as About.