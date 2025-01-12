from dataclasses import dataclass, asdict

from .schemas import PersonSchema, BaseModel

from typing import List, Optional

from pydantic import Field

from pydantic_ai import Agent, RunContext

from pydantic_ai.models.vertexai import VertexAIModel

from datetime import datetime

@dataclass
class UserInformation:
    user : PersonSchema

@dataclass
class Rec:
    start_time : str
    end_time : str
    title : str


class RecommendationOutput(BaseModel):
    recs : List[Rec] = Field(description = "A list of recommendations for what the user should be completing at what time.")

class RecommendationAgent:
    def __init__(self):
        self.agent = Agent(
            VertexAIModel('gemini-1.5-flash', project_id = 'tempora-447602'),
            deps_type=UserInformation,
            result_type=RecommendationOutput,
            system_prompt=(
                "You are an agent tasked with scheduling tasks based on their due dates, priorities, and the user's available time slots. Your goal is to generate a list of scheduled activities, ensuring each task is assigned to a suitable time slot within the user's availability and completed before its due date. IMPORTANT: 1. ALL TASKS MUST BE COMPLETED BEFORE THEIR RESPECTIVE DUE DATES. 2. USE ONLY THE TIME SLOTS PROVIDED IN THE USER'S AVAILABILITIES. 3. ENSURE THAT THE SCHEDULED START TIME OF AN ACTIVITY IS BEFORE ITS END TIME. 4. PRIORITIZE TASKS THAT ARE OVERDUE BEFORE OTHERS. Instructions: - Read the list of tasks, each with a specified due date and priority. - Match these tasks to the user's available time slots. - Return a list of datetimes paired with task descriptions, formatted as suggestions for when the user should perform each task. Examples: - Complete the email task from 10:00 to 10:15. - Study for the history exam between 13:00 and 14:00. - Work on the HW Assignment from 16:00 to 16:30."
            ),
        )

        @self.agent.tool
        async def getTasks(ctx: RunContext[UserInformation]) -> str:
            message = ""

            tasks = ctx.deps.user.tasks

            for task in tasks:
                message += f"{task.name} due at {task.due_date} with {task.priority} priority ({"COMPLETED" if task.is_completed else "NOT COMPLETED"}). \n\n"

            return message
        
        @self.agent.tool
        async def getAvailabilities(ctx: RunContext[UserInformation]) -> str:
            message = ""
            availabilities = ctx.deps.user.availabilities

            for avail in availabilities:
                message += f"Available on {avail.day_of_week}s from {avail.start_time} to {avail.end_time} \n\n"

            return message

    

    async def makeRecommendations(self, user:PersonSchema):
        deps = UserInformation(user=user)
        result = await self.agent.run(user_prompt=f"The time is {datetime.now()}.", deps = deps)

        return result.data.model_dump()
        
        

    