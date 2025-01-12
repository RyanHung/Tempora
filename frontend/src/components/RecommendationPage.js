import React, { useState, useEffect } from "react";

export const RecommendationPage = () => {
      const [recs, setRecs] = useState([]);
      const [loading, setLoading] = useState(true);


      /**
       * Method will check at the page refresh to for the contents of the user's recommendation
       */
      useEffect(() => {
        // Fetch the tasks from the API
        const fetchTasks = async () => {
          try {
            const response = await fetch("/api/get-recommendation");
            if (!response.ok) {
              throw new Error("Failed to fetch recommendation");
            }
            const data = await response.json();
            setRecs(data.recommendation.recs);
            console.log(data);
            setLoading(false); // Turn off loading state
          } catch (error) {
            console.error("Error fetching recommendation:", error);
            setLoading(false); // Turn off loading state
          }
        };

        fetchTasks();
      }, []); // Empty dependency array ensures this runs only once when the component mounts

      const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat("en-US", {
          dateStyle: "full", // Formats to "Tuesday, January 14, 2025"
          timeStyle: "short", // Formats time to "3:13 AM"
        }).format(date);
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
        <p style = {{color:"white", padding: 10}}>Loading recommendations...</p>
      ) : ( // Check if there are recs to display
        <ul style={{ color: "white", padding: 0, listStyleType: "none" }}>
          {recs.length > 0 ? (
            recs.map((rec, index) => (
              <li
                key={index}
                style={{
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
                  {rec['title']} from {formatDate(rec['start_time'])} to {formatDate(rec['end_time'])  }            
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
              No recommendations available right now
            </li>
          )}
        </ul>
      )}
    </div>
  </div>
      );
};
