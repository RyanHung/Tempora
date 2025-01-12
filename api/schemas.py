from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, time

class TaskSchema(BaseModel):
    task_id: int  # Add task_id to represent the primary key (id)
    name: str
    is_completed: bool
    due_date: Optional[datetime]
    priority: str

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, task):
        # Manually map related fields, including task_id (which is the task's id)
        return cls(
            task_id=task.id,  # Map the task's id to task_id
            name=task.name,
            is_completed=task.is_completed,
            due_date=task.due_date,
            priority=task.priority
        )
    
class AvailabilitySchema(BaseModel):
    avail_id: int  # Add task_id to represent the primary key (id)
    day_of_week: str
    start_time: time
    end_time: time

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, availability):
        # Manually map related fields, including task_id (which is the task's id)
        return cls(
            avail_id=availability.id,  # Map the task's id to task_id
            day_of_week=availability.day_of_week,
            start_time=availability.start_time,
            end_time=availability.end_time
        )

class PersonSchema(BaseModel):
    username: str
    email: str
    tasks: List[TaskSchema]
    availabilities : List[AvailabilitySchema]

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, person):
        # Manually map related fields
        return cls(
            username=person.user.username,
            email=person.user.email,
            tasks=[TaskSchema.model_validate(task) for task in person.tasks.all()],
            availabilities = [AvailabilitySchema.model_validate(availability) for availability in person.availabilities.all()],
        )