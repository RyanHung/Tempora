from django.urls import path
from .views import CreatePersonView, CheckPersonExistenceView, LoginPersonView, CheckLoggedInView, LogoutPersonView, GetTasksView, AddTaskView, RemoveTaskView, GetAvailabilitiesView, SaveAvailabilitiesView, GetRecommendationView

urlpatterns = [
    path('create-user', CreatePersonView.as_view()),
    path('verify-user/', CheckPersonExistenceView.as_view()),
    path('login/', LoginPersonView.as_view()),
    path('loggedin', CheckLoggedInView.as_view()),
    path('logout', LogoutPersonView.as_view()),
    path('get-events', GetTasksView.as_view()),
    path('add-event', AddTaskView.as_view()),
    path('remove-event', RemoveTaskView.as_view()),
    path('get-availabilities', GetAvailabilitiesView.as_view()),
    path('save-availabilities', SaveAvailabilitiesView.as_view()),
    path('get-recommendation', GetRecommendationView.as_view())
]