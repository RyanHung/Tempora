from rest_framework import serializers
from .models import Person, CustomUser, Task, Availability

class PersonSerializer(serializers.ModelSerializer):
    """
    Serializer class that retrieves all information about a specific Person.
    """
    class Meta:
        model = Person
        fields = ('__all__')


class CreatePersonSerializer(serializers.ModelSerializer):
    """
    Serializer class that constructs a new Person model.
    """
    class Meta:
        model = CustomUser #Uses the CustomUser class that handles user authentication/creation
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        """
        Method that creates the person based off of the given data.

        Args:
            validated_data: User information to create the CustomUser
        """
        user_data = validated_data  # Remaining data is for the User model

        # Create the User object with username and email
        user = CustomUser.objects.create_user(**user_data)  # This automatically handles password hashing
        user.save()

        # Create the corresponding Person object linked to the User
        person = Person.objects.create(user=user)

        return person


class PersonExistenceSerializer(serializers.Serializer):
    """
    Serializer class that checks if a Person with a given username and email exist.

    Attributes:
        username (serializers.CharField) : A string containing the given username
        email (serializers.EmailField) : A string containing the given email
    """
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)

    def validate(self, data):
        """
        Method to check if a given person exists or not.

        Args:
            data : 
        """
        username = data.get('username')
        email = data.get('email')

        # Validate username
        if username:
            if Person.objects.filter(user__username = username).exists():
                raise serializers.ValidationError({'username': 'This username is already taken.', 'email' : ''})

        # Validate email
        if email:
            if Person.objects.filter(user__email = email).exists():
                raise serializers.ValidationError({'username': '', 'email': 'This email is already taken.'})

        return data
    
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['name', 'is_completed', 'due_date', 'priority']

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['day_of_week', 'start_time', 'end_time']