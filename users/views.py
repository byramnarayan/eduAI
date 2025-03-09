from django.shortcuts import render,redirect
from django.http import HttpResponse
# from django.contrib.auth.forms import UserCreationForm no longer needed after UserRegisterForm inherit from UserCreationForm
from django.contrib import messages
from .forms import UserRegisterForm
from django.contrib.auth.decorators import login_required   # <login_required> decorator to protect the profile page.

from .forms import UserUpdateForm, ProfileUpdateForm



# Create your views here.
def register(request):
    # now we see for POST mesthod if yes then we accepte that and enter the form other wise it will be get request we will dispaly the from.
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)# Create a form object    instance of UserCreationForm
        if form.is_valid():
            form.save() # save the form
            username = form.cleaned_data.get('username')    # get the username from the form
            messages.success(request, f'Account created for {username}!')
            return redirect('login') # redirect to home page
    else:
        form = UserRegisterForm() # resuest balnk from for other then POST method. GIVE EMPTY FORM. 
    return render(request, 'users/register.html', {'form': form})

@login_required # <login_required> decorator to protect the profile page.
def profile(request):
    return render(request, 'users/profile.html')




from .forms import UserUpdateForm, ProfileUpdateForm
# new code
@login_required
def edit_profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, "Your profile has been updated!")
            return redirect('profile')

    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)

    context = {'u_form': u_form, 'p_form': p_form}
    return render(request, 'users/edit.html', context)
# end new code

# @login_required # <login_required> decorator to protect the profile page.
# def profile(request):
#     if request.method == 'POST':
#         u_form = UserUpdateForm(request.POST, instance=request.user)
#         p_form = ProfileUpdateForm(request.POST,
#                                    request.FILES,
#                                    instance=request.user.profile)
#         if u_form.is_valid() and p_form.is_valid():
#             u_form.save()
#             p_form.save()
#             messages.success(request, f'Your account has been updated!')
#             return redirect('profile')

#     else:
#         u_form = UserUpdateForm(instance=request.user)
#         p_form = ProfileUpdateForm(instance=request.user.profile)

#     context = {
#         'u_form': u_form,
#         'p_form': p_form
#     }

#     return render(request, 'users/edit.html', context, )
