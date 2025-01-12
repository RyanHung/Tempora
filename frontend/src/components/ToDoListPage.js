import React, { useState, useEffect } from "react";
import DateTimePicker from 'react-datetime-picker';
import { TextField, Button, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, rgbToHex} from '@mui/material';

export const ToDoListPage = () => {
  const [dueTime, onChange] = useState(new Date());
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium'); // Default priority

  const [titleError, setTitleError] = useState('');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Method will check at the page refresh to for the contents of the user's todo list.
   */
  useEffect(() => {
    // Fetch the tasks from the API
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/get-events");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks); // Set the fetched tasks in state
        setLoading(false); // Turn off loading state

        console.log(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false); // Turn off loading state even if there’s an error
      }
    };

    fetchTasks();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Validate title
  const validateForm = () => {
    if(title.length < 1) {
      setTitleError("Title must not be empty.")
    }
    else
    {
      setTitleError('');
    }

    return title.length >= 1 && dueTime != NaN;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm())
    {
      //POST request requires authentication
      const csrfToken = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("csrftoken="))
      ?.split("=")[1];
      if (!csrfToken) {
        console.error("CSRF token not found!");
        return;
      }
      
      try {
        const response = await fetch("/api/add-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            name : title,
            due_date : dueTime,
            is_completed : false,
            priority : priority,
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          console.log(data.message);
          window.location.reload(); //updates to-do page
        } else {
          console.error("Adding Task failed:", data.error);
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
    else
    {
      console.log("NOT VALIDATED");
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full", // Formats to "Tuesday, January 14, 2025"
      timeStyle: "short", // Formats time to "3:13 AM"
    }).format(date);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return "#7F7F7F";  // Blue for low priority
      case 'medium':
        return "#b47714";  // Yellow for medium priority
      case 'high':
        return "#8C1D2C";  // Red for high priority
      default:
        return "#31A26B";  // Default to blue if no priority is set
    }
  };

  const handleRemoveTask = async (index) => {
    const taskToRemove = tasks[index];
    // Update the tasks array by filtering out the task at the given index
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));

    //POST request requires authentication
    const csrfToken = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("csrftoken="))
    ?.split("=")[1];
    if (!csrfToken) {
      console.error("CSRF token not found!");
      return;
    }

    try {
      const response = await fetch("/api/remove-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          task_id : taskToRemove['task_id']
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Removing Task failed:", data.error);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh', // Ensures the container takes the full viewport height
        minWidth: '100vw',
        maxHeight: '500px',  // Set the maximum height for the container
        overflowY: 'auto',   // Enables vertical scrolling if content exceeds maxHeight
      }}
    >
      <div>
        {loading ? ( // Show a loading message while data is being fetched
          <p style = {{color:"white", padding: 10}}>Loading tasks...</p>
        ) : ( // Check if there are tasks to display
          <ul style={{ color: "white", padding: 0, listStyleType: "none" }}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <li
                  key={index}
                  style={{
                    backgroundColor: getPriorityColor(task['priority']), // Custom background color
                    margin: '10px 0',            // Space between items
                    padding: '10px',             // Padding inside each item
                    borderRadius: '8px',         // Rounded corners
                    maxWidth : '90%',
                    display: 'flex', /* Use Flexbox for layout */
                    justifyContent: 'space-between', /* Align text to the left and button to the right */
                    alignItems: 'center',
                    marginBottom : '5px',
                  }}
                >
                    {task['name']} due at {formatDate(task['due_date'])}
                    <button className="remove-btn"  onClick={() => handleRemoveTask(index)}>X</button>
                  
                </li>
              ))
            ) : (
              <li
                style={{
                  backgroundColor: '#f44336', // Red background for no tasks
                  margin: '10px 0',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                No tasks available right now
              </li>
            )}
          </ul>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '20px',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#a0a0a0',
            padding: '20px',
            borderRadius: '8px',
            width: '1000px',
            boxSizing: 'border-box',
          }}
        >
          <h1>Add New To-Do Item</h1>
          <TextField
            label="Title"
            fullWidth
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError !== ''}
            helperText={titleError}
          />
          <p>Due Datetime: </p>
          <DateTimePicker
            className="react-datetime-picker"
            onChange={onChange}
            value={dueTime}
          />
          <p></p>
          {/* Priority radio buttons */}
          <FormControl component="fieldset">
            <FormLabel component="legend" style={{color:"black"}}>Priority:</FormLabel>
            <RadioGroup
              row
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <FormControlLabel value="low" control={<Radio />} label="Low" />
              <FormControlLabel value="medium" control={<Radio />} label="Medium" />
              <FormControlLabel value="high" control={<Radio />} label="High" />
            </RadioGroup>
          </FormControl>
          <p></p>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>
      </div>
    </div>
    
  );
};

