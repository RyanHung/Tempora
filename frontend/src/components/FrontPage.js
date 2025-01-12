import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {Avatar} from "@mui/material"

export const FrontPage = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false); //if the user is logged in
    const [user, setUser] = useState(null); //user information if logged in

    const navigate = useNavigate(); //navigate hook

    const [dropdownVisible, setDropdownVisible] = useState(false); //if the user clicked on the dropdown menu
    const dropdownRef = useRef(null); //dropdown reference

    /**
     * Method will check once at the page refresh to make sure that the user is logged in.
     * /api/loggedin is an endpoint that taking in a request will check if it contains an authenticated user.
     */
    useEffect(() => {
        // Check login status from the backend
        fetch("/api/loggedin", {
            method: "GET",
            credentials: "include", // Ensure cookies/session are included in the request
        }).then((response) => {
                if (response.ok) {
                    return response.json();
                } 
                else 
                {
                    throw new Error("Not logged in");
                }
            })
            .then((data) => {
                setIsLoggedIn(true);
                setUser(data.user); // Assume the API returns user info
            })
            .catch((err) => {
                setIsLoggedIn(false);
                setUser(null);
            });
    }, []);

    /**
     * Method to redirect to the todo page.
     */
    const todo = () => {
        navigate("/todo");
    };

     /**
     * Method to redirect to the availability page.
     */
     const avail = () => {
        navigate("/availability");
    };

    /**
     * Method to redirect to the recommendations page.
     */
    const rec = () => {
        navigate("/recommendation");
    };

    /**
     * Method to redirect to the login page.
     */
    const handleLogin = () => {
        navigate("/login");
    };

    /**
     * Method to send a logout request to the backend.
     * /api/logout is an endpoint that will handle the session logout using the CustomUser model.
     */
    const handleLogout = async () => {
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
          const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
          });
          
          const data = await response.json();
          if (response.ok) {
            console.log(data.message);
            window.location.reload(); //updates loggedin status and front page
          } else {
            console.error("Logout failed:", data.error);
          }
        } catch (error) {
          console.error("Error logging out:", error);
        }
    };

    /**
     * Method to update whether the dropdown menu is visible or not.
     * @param {*} event Event object(should be the user clicking on the dropdown or away from the dropdown)
     */
    const accountDropDown = (event) => {
        event.preventDefault();  // Prevent the default anchor behavior
        event.stopPropagation();
        setDropdownVisible((prev) => {
            const newState = !prev;
            return newState;
        });
    };
    
    /**
     * Method to add an an event listener that will remove the dropdown menu when clicked again.
     * Method is only triggered when there is a change in the value of dropdownVisible.
     */
    useEffect(() => {
    
        // If dropdown is not visible, don't add event listener
        if (!dropdownVisible) return;
        
        /**
         * Method to close the dropdown menu by changing boolean value.
         * @param {*} event Event object that is triggered when the user clicks off
         */
        const handleClickOutside = (event) => {
            // Close dropdown if clicked outside of it
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };
    
        // Add event listener when dropdown is visible
        document.addEventListener("click", handleClickOutside);
    
        // Clean up the event listener when dropdown is hidden or component is unmounted
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [dropdownVisible]);
                
      return (
        <div>
            <div className="topnav">
                {isLoggedIn ? (
                    <div style={{ position: "relative", display: "inline-flex" }}>
                        <a href = "" onClick = {todo}>
                            My To-Do List
                        </a>

                        <a href = "" onClick = {avail}>
                            Set My Availability
                        </a>

                        <a href = "" onClick = {rec}>
                            AI-Recommended Schedule
                        </a>

                        <a href="" onClick={accountDropDown} style = {{position : "relative"}}>
                            <AccountBoxIcon sx={{color: "white", transform: "scale(3)"}} 
                            />
                            {dropdownVisible && (
                                <div
                                    id="accountDropdown"
                                    ref={dropdownRef}
                                    className = "dropdown-box">
                                    <ul>
                                        <li><a href="" onClick = {handleLogout}>Logout (currently signed in as {user.username})</a></li>
                                    </ul>
                                </div>
                            )}
                        </a>
                    </div>
                        ) : (
                            <a href="" onClick={handleLogin}>
                                Sign in
                            </a>
                        )}
            </div>
        </div>
      );
    };