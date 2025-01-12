from rest_framework import status
from .serializers import PersonSerializer, CreatePersonSerializer, PersonExistenceSerializer, TaskSerializer, AvailabilitySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .schemas import PersonSchema
from .models import Task
from .agent import RecommendationAgent
import asyncio


class CreatePersonView(APIView):
    """
    APIView to create a new user's information.
    """
    def post(self, request):
        """
        Handles POST requests for the REST API url /api/create-user.

        Validates the prospective user's data and creates a new "Person".
        Otherwise, returns an error response.

        Args:
            request (Request): The HTTP request object with the POST data.
        """

        serializer = CreatePersonSerializer(data = request.data)

        #Will check if all of the fields can be filled in based off of the given data
        if serializer.is_valid():
            person = serializer.save()

            return Response(PersonSerializer(person).data, status = status.HTTP_201_CREATED)

        return Response({'Bad Request' : 'Invalid data...'}, status = status.HTTP_400_BAD_REQUEST)

class CheckPersonExistenceView(APIView):
    """
    APIView to check if a user with given username and email exists.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/verify-user/.

        Takes in a username and email from the unique request url.
        Checks if the username or email exists within the database.
        Returns a Response.

        Args:
            request (Request): The HTTP request object with the GET parameters.
        """
        # Get parameters from query string
        username = request.GET.get('username')
        email = request.GET.get('email')

        # Prepare data for serializer validation
        data = {}
        if username:
            data['username'] = username
        if email:
            data['email'] = email

        # Instantiate the serializer
        serializer = PersonExistenceSerializer(data=data)

        # Validate the data
        if serializer.is_valid():
            return Response({'message': 'Username or email is available'}, status=status.HTTP_200_OK)

        # Return error response if validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginPersonView(APIView):
    """
    APIView to login a user.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/login/.

        Takes in a username and password from the unique request url.
        Checks if the user exists and if so, logs them in.
        Otherwise, returns an error.

        Args:
            request (Request): The HTTP request object with the GET parameters.
        """
        # Get parameters from query string
        username = request.GET.get('username')
        password = request.GET.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Log in the user
            login(request, user)
            return Response({"message": "User logged in successfully", "user_id": user.id}, status = status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status= status.HTTP_400_BAD_REQUEST)
        
class CheckLoggedInView(APIView):
    """
    APIView to check if a session has a logged in user.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/loggedin.

        Takes in a user from the request and checks if it is authenticated.
        If so, returns a Response containing the user's information.
        Otherwise, returns a Response stating that they are not logged in.

        Args:
                request (Request): The HTTP request object with the GET parameters.
        """
        if request.user.is_authenticated:
            return Response({
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                }
            }, status=status.HTTP_200_OK)
        return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
    
class LogoutPersonView(APIView):
    """
    APIView to logout a user.
    """
    def post(self, request):
        """
        Handles POST requests for the REST API url /api/logout.

        Takes in a user from the request.
        Logs them out.

        Args:
            request (Request): The HTTP request object with the POST parameters.
        """
        # Log the user out by clearing the session
        logout(request)
        
        # Send a response confirming the logout action
        return Response({"message": "User logged out successfully"}, status=status.HTTP_200_OK)
    
class GetTasksView(APIView):
    """
    APIView to retrieve a user's requests.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/getevents

        Takes in a user from the request and checks if it is authenticated.
        If so, returns a Response containing the user's events.
        Otherwise, returns a Response stating that they are not logged in.

        Args:
                request (Request): The HTTP request object with the GET parameters.
        """
        if request.user.is_authenticated:
            # Fetch the tasks directly from the database
            person = request.user.person
            tasks = person.tasks.all()  # Get all tasks associated with the person
            
            # Serialize the tasks into a JSON-friendly format
            tasks_data = [
                {
                    "task_id": task.id,
                    "name": task.name,
                    "is_completed": task.is_completed,
                    "due_date": task.due_date,
                    "priority": task.priority,
                }
                for task in tasks
            ]

            tasks_data = sorted(tasks_data, key = lambda x: x['due_date'])

            return Response(
                {"tasks": tasks_data},
                status=status.HTTP_200_OK
            )
        return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
    
class AddTaskView(APIView):
    def post(self, request):
        """
        Handles POST requests for the REST API url /api/add-task/.

        Adds a new task for the user.
        """
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the authenticated user's Person instance
        try:
            person = request.user.person
        except AttributeError:
            return Response({"error": "Person object not found for the user"}, status=status.HTTP_404_NOT_FOUND)

        # Validate and create the task
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(person=person)  # Link the task to the person's model
            return Response({"message": "Task added successfully", "task": serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RemoveTaskView(APIView):
    def post(self, request):
        """
        Handles POST requests for the REST API url /api/remove-task/.

        Removes an existing task for the user.
        """
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the authenticated user's Person instance
        try:
            person = request.user.person
        except AttributeError:
            return Response({"error": "Person object not found for the user"}, status=status.HTTP_404_NOT_FOUND)

        # Get the task ID from the request data
        task_id = request.data.get("task_id")

        if not task_id:
            return Response({"error": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the task to be removed
        try:
            task = Task.objects.get(id=task_id, person=person)
        except Task.DoesNotExist:
            return Response({"error": "Task not found for the user"}, status=status.HTTP_404_NOT_FOUND)

        # Delete the task
        task.delete()

        return Response({"message": "Task removed successfully"}, status=status.HTTP_200_OK)
    
class GetAvailabilitiesView(APIView):
    """
    APIView to retrieve a user's availabilities.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/get-availabilities

        Takes in a user from the request and checks if it is authenticated.
        If so, returns a Response containing the user's availabilities.
        Otherwise, returns a Response stating that they are not logged in.

        Args:
                request (Request): The HTTP request object with the GET parameters.
        """
        if request.user.is_authenticated:
            # Fetch the tasks directly from the database
            person = request.user.person
            availabilities = person.availabilities.all()  # Get all tasks associated with the person
            
            # Serialize the tasks into a JSON-friendly format
            availability_data = [
                {
                    "availability_id": availability.id,
                    "day_of_week": availability.day_of_week,
                    "start_time": availability.start_time,
                    "end_time" : availability.end_time

                }
                for availability in availabilities
            ]

            return Response(
                {"availabilities": availability_data},
                status=status.HTTP_200_OK
            )
        return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
    
class SaveAvailabilitiesView(APIView):
    def post(self, request):
        """
        Handles POST requests for the REST API url /api/save-availabilities.

        Saves the list of availabilities for the user.
        """
        # Ensure the user is authenticated
        if not request.user.is_authenticated:
            return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        # Get the authenticated user's Person instance
        try:
            person = request.user.person
        except AttributeError:
            return Response({"error": "Person object not found for the user"}, status=status.HTTP_404_NOT_FOUND)

        # Validate and create the task
        data_list = request.data["availabilities"]

        if not isinstance(data_list, list):
            return Response({"error": "Invalid data format. Expected a list of availabilities."}, status=status.HTTP_400_BAD_REQUEST)

        
        person.availabilities.all().delete()
        
        for avail in data_list:
            serializer = AvailabilitySerializer(data=avail)
            if serializer.is_valid():
                avail = serializer.save(person=person)  # Link the task to the person's model
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Availabilities added successfully"}, status=status.HTTP_201_CREATED)
    
class GetRecommendationView(APIView):
    """
    APIView to retrieve a user's recommendation.
    """
    def get(self, request):
        """
        Handles GET requests for the REST API url /api/get-recommendation

        Takes in a user from the request and checks if it is authenticated.
        If so, returns a Response containing the user's recommendation.
        Otherwise, returns a Response stating that they are not logged in.

        Args:
                request (Request): The HTTP request object with the GET parameters.
        """
        if request.user.is_authenticated:
            rec = RecommendationAgent()

            schema = PersonSchema.model_validate(request.user.person)

            return Response(
                {"recommendation": asyncio.run(rec.makeRecommendations(user=schema))},
                status=status.HTTP_200_OK
            )
        return Response({"error": "Not logged in"}, status=status.HTTP_401_UNAUTHORIZED)