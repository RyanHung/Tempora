from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Create your models here.

def generate_unique_id():
    while True:
        id = str(uuid.uuid4())[:8]

        if Person.objects.filter(id = id).count() == 0:
            return id

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'password']  # Password is handled by AbstractBaseUser

    objects = CustomUserManager()

    def __str__(self):
        return self.username

class Person(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # One-to-one relationship

    def __str__(self):
        return f"{self.user.username} ({self.id})"
    
class Task(models.Model):
    name = models.CharField(max_length = 100)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null = True, blank = True)
    priority = models.CharField(max_length=100, default="medium")

    person = models.ForeignKey(Person, related_name="tasks", on_delete=models.CASCADE)

class Availability(models.Model):
    person = models.ForeignKey(Person, related_name="availabilities", on_delete=models.CASCADE)
    
    day_of_week = models.CharField(max_length=9, choices=[
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday")
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.person.user.username} - {self.day_of_week} ({self.start_time} - {self.end_time})"
