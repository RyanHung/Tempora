import React, { useState, useEffect} from "react";
import { TextField, Button, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel} from '@mui/material';

export const AvailabilityPage = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const [selected, setSelected] = useState({});
  const [availabilities, setAvailabilities] = useState([]);

  // Toggle button selection
  const toggleButton = (day, hour) => {
    const key = `${day}-${hour}`;
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle the selected state
    }));

    setAvailabilities((prevList) => {
      // Extract day and start from the key
      const [day, start] = key.split("-");
      // Check if the block already exists in the list
      const index = prevList.findIndex(
        (slot) => slot.day_of_week === day && parseInt(slot.start_time.split(":")[0]) + ":00" === start
      );
    
      if (index !== -1) {
        // If found, remove it (toggle off)
        return prevList.filter((_, i) => i !== index);
      } else {
        // If not found, add it (toggle on)
        return [
          ...prevList,
          {
            day_of_week: day,
            start_time: start,
            end_time: calculateEndTime(start),
          },
        ];
      }

      
    });

    const calculateEndTime = (start) => {
      // Convert start to a number and add 1
      const end = (parseInt(start) < 23) ? parseInt(start) + 1 : 0;
    
      // Return the end time as a string
      return end.toString() + ":00";
    };
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

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
      let availability_data = [];
      for(let avail in availabilities)
      {
        availability_data.push({
          "day_of_week" : availabilities[avail]['day_of_week'],
          "start_time": availabilities[avail]['start_time'],
          "end_time": availabilities[avail]['end_time']
        }
        );
      }
      console.log(availability_data);
      const response = await fetch("/api/save-availabilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
        "availabilities" : availability_data
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Setting Availabilities failed:", data.error);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

   /**
     * Method will check at the page refresh to for the contents of the user's availability list.
     */
    useEffect(() => {
      // Fetch the availabilities from the API
      const fetchAvailabilities = async () => {
        try {
          const response = await fetch("/api/get-availabilities");
          if (!response.ok) {
            throw new Error("Failed to fetch availabilities");
          }
          const data = await response.json();
          setAvailabilities(data.availabilities); // Set the fetched tasks in state
  
          console.log(data);
        } catch (error) {
          console.error("Error fetching availabilities:", error);
        }
      };
  
      fetchAvailabilities();
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    useEffect(() => {
      const preSelected = {};
    
      // Loop through availabilities to populate selected state
      availabilities.forEach(({ day_of_week, start_time }) => {
        const hour = parseInt(start_time.split(":")[0]) + ":00"; // Extract the hour
        const key = `${day_of_week}-${hour}`; // Generate the key
        preSelected[key] = true; // Mark as selected
      });
    
      setSelected(preSelected); // Set the selected state
    }, [availabilities]); // This runs when availabilities change

  return (
    <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "100vw",
      height: "100vh", // Ensure it fits the viewport height
      color: "white",
      overflowY: "scroll"
    }}
    >
      <h1>SET YOUR AVAILABILITY</h1>

      <p>Click on the cell blocks for which you would be available to complete work in. <br/> 
      The model will use these in order to plan out your schedule.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px" , color: "white"}}>
        {/* Top-left corner (empty space) */}
        <div></div>

        {/* Days of the week header */}
        {days.map((day) => (
          <div key={day} style={{ textAlign: "center", fontWeight: "bold" }}>
            {day}
          </div>
        ))}

        {/* Rows for each hour */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time labels */}
            <div style={{ textAlign: "right", fontWeight: "bold" }}>{hour}</div>
            {/* Buttons for each day */}
            {days.map((day) => (
              <button
                key={`${day}-${hour}`}
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  backgroundColor: selected[`${day}-${hour}`] ? "#4CAF50" : "#f9f9f9",
                  cursor: "pointer",
                }}
                onClick={() => toggleButton(day, hour)}
              >
                {selected[`${day}-${hour}`] ? "" : ""}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <p></p>

      <Button variant="contained" color="primary" onClick = {handleSubmit}>
                  Save
      </Button>

      <p></p>
    </div>
  );
};
