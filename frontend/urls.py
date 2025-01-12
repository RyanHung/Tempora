from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('recommendation', index),
    path('availability', index),
    path('todo', index),
    path('create-user', index),
    path('login', index)
]
