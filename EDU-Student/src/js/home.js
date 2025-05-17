import { supaClient } from "./app.js";
const studentId = sessionStorage.getItem("studentId");

const institutionId = JSON.parse(sessionStorage.getItem("institution_id"));

// Get instructors for the current institution
async function getInstructorInstitution() {
  const { data, error } = await supaClient
    .from("instructor_institution")
    .select("*")
    .eq("institution_id", institutionId);

  if (error) {
    console.error("Error fetching institution data:", error);
    return [];
  }
  const instructorsId = data.map((instructor) => instructor.instructor_id);
  return instructorsId;
}

// Get student's courses
async function getStudentCourses() {
  const instructorsId = await getInstructorInstitution();
  if (!instructorsId.length) {
    console.error("No instructors found for this institution");
    return [];
  }
  const { data, error } = await supaClient
    .from("enrollment")
    .select("*")
    .in("instructor_id", instructorsId)
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching enrollment data:", error);
    return [];
  }

  return data;
}
// Format time to display as "At 8:00 AM"
function formatSessionTime(timeString) {
  try {
    // Check if it contains date information (format: 2025-05-07 14:00:00)
    let time;
    if (timeString.includes("-")) {
      time = new Date(timeString);
    }
    // Check if it's a full ISO datetime
    else if (timeString.includes("T")) {
      time = new Date(timeString);
    }
    // Handle time-only format like "14:30:00"
    else {
      const [hours, minutes] = timeString
        .split(":")
        .map((num) => parseInt(num));
      time = new Date();
      time.setHours(hours, minutes, 0);
    }

    if (isNaN(time.getTime())) {
      console.warn("Invalid time:", timeString);
      return "At " + timeString; // Return original if invalid
    }

    // Format as "8:00 AM"
    return (
      "At " +
      time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  } catch (e) {
    console.error("Time formatting error:", e);
    return "At " + timeString;
  }
}

// Check if a session is for today by examining various possible date fields
function isSessionToday(session) {
  try {
    // Get today's date without time for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    // 1. Check session_date field (if it exists)
    if (session.session_date) {
      const sessionDate = new Date(session.session_date);
      sessionDate.setHours(0, 0, 0, 0);

      if (
        sessionDate.toISOString().split("T")[0] ===
        today.toISOString().split("T")[0]
      ) {
        return true;
      }
    }

    // 2. Check session_datetime field (if it exists)
    if (session.session_datetime) {
      const sessionDate = new Date(session.session_datetime);
      sessionDate.setHours(0, 0, 0, 0);

      if (
        sessionDate.toISOString().split("T")[0] ===
        today.toISOString().split("T")[0]
      ) {
        return true;
      }
    }

    // 3. Special check for session_time if it contains date information (format: 2025-05-07 14:00:00)
    if (session.session_time && session.session_time.includes("-")) {
      const sessionDate = new Date(session.session_time);
      sessionDate.setHours(0, 0, 0, 0);

      if (
        sessionDate.toISOString().split("T")[0] ===
        today.toISOString().split("T")[0]
      ) {
        return true;
      }
    }

    // 4. Check session_day if it exists
    if (session.session_day) {
      // If session_day is a number representing day of week (0-6, where 0 is Sunday)
      if (
        typeof session.session_day === "number" ||
        !isNaN(Number(session.session_day))
      ) {
        const sessionDayNum = Number(session.session_day);
        const todayDayNum = today.getDay();

        if (sessionDayNum === todayDayNum) {
          return true;
        }
      }
      // If session_day is a string like "Monday", "Tuesday", etc.
      else if (typeof session.session_day === "string") {
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const todayDayName = days[today.getDay()];

        if (session.session_day.toLowerCase() === todayDayName) {
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.error("Error checking if session is today:", e);
    return true;
  }
}
// async function getSemesterProgress() {
//   const semesterProgress = document.querySelector(".semester-progress-fill");
//   const semesterProgressPercentage = document.querySelector(".semester-progress-percentage");
//   const semesterProgressDate = document.querySelector(".semester-progress-date");
//   try {
//     // Fetch student courses
//     const courses = await getStudentCourses();
//     const coursesId = courses.map((course) => course.course_id);
    
//     // Fetch sessions sorted by time
//     const { data, error } = await supaClient
//       .from("session")
//       .select("*")
//       .in("course_id", coursesId)
//       .order("session_time");
//       console.log(data);
      
//     if (error) {
//       console.error("Error fetching session data:", error);
//       return;
//     }
    
//     if (data && data.length > 0) {
//       // Parse dates properly to ensure correct calculations
//       const startDate = new Date(data[0].session_time);
//       const endDate = new Date(data[data.length - 1].session_time);
//       const currentDate = new Date();
      
//       // Calculate discrete weeks by finding the difference in week numbers
//       // Helper function to get week number of year for a date
//       const getWeekNumber = (date) => {
//         // Create a copy of the date to avoid modifying the original
//         const dateCopy = new Date(date);
//         // Set to nearest Thursday: current date + 4 - current day number
//         // Make Sunday's day number 7
//         const dayNum = dateCopy.getUTCDay() || 7;
//         dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - dayNum);
//         // Get first day of year
//         const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1));
//         // Calculate full weeks to nearest Thursday
//         const weekNumber = Math.ceil((((dateCopy - yearStart) / 86400000) + 1) / 7);
        
//         // Return array of year and week number
//         return [dateCopy.getUTCFullYear(), weekNumber];
//       };
      
//       // Calculate total weeks between start and end date
//       const startWeekInfo = getWeekNumber(startDate);
//       const endWeekInfo = getWeekNumber(endDate);
//       const currentWeekInfo = getWeekNumber(currentDate);
      
//       // Calculate total number of weeks in semester
//       // Account for year changes in semester span
//       let totalWeeks = 0;
//       if (startWeekInfo[0] === endWeekInfo[0]) {
//         // Same year
//         totalWeeks = endWeekInfo[1] - startWeekInfo[1] + 1; // +1 to include current week
//       } else {
//         // Different years
//         // Get weeks in start year (from start week to end of year)
//         const weeksInStartYear = 52 - startWeekInfo[1] + 1;
//         // Add weeks in end year (from week 1 to end week)
//         totalWeeks = weeksInStartYear + endWeekInfo[1];
//       }
      
//       // Calculate elapsed weeks
//       let elapsedWeeks = 0;
//       if (startWeekInfo[0] === currentWeekInfo[0]) {
//         // Same year
//         elapsedWeeks = currentWeekInfo[1] - startWeekInfo[1] + 1; // +1 to include current week
//       } else {
//         // Different years
//         // Get weeks in start year (from start week to end of year)
//         const weeksInStartYear = 52 - startWeekInfo[1] + 1;
//         // Add weeks in current year (from week 1 to current week)
//         elapsedWeeks = weeksInStartYear + currentWeekInfo[1];
//       }
      
//       // Ensure elapsedWeeks isn't greater than totalWeeks
//       elapsedWeeks = Math.min(elapsedWeeks, totalWeeks);
      
//       // Handle edge case where elapsed weeks is negative
//       if (elapsedWeeks < 0) {
//         elapsedWeeks = 0;
//       }
      
//       // Calculate progress percentage
//       const progressPercentage = (elapsedWeeks / totalWeeks) * 100;
//       // Round to nearest whole number for display
//       const roundedPercentage = Math.round(progressPercentage);
      
//       // Update UI elements
//       semesterProgress.style.width = `${roundedPercentage}%`;
//       semesterProgressPercentage.textContent = `${roundedPercentage}%`;
//       semesterProgressDate.textContent = `${elapsedWeeks}/${totalWeeks} weeks`;
//       // // For debugging - show weeks calculation
//       // console.log(`Start week: ${startWeekInfo[1]} (${startWeekInfo[0]})`);
//       // console.log(`Current week: ${currentWeekInfo[1]} (${currentWeekInfo[0]})`);
//       // console.log(`End week: ${endWeekInfo[1]} (${endWeekInfo[0]})`);
//       // console.log(`Total semester weeks: ${totalWeeks} weeks`);
//       // console.log(`Weeks elapsed: ${elapsedWeeks} weeks`);
//       // console.log(`Progress: ${roundedPercentage}%`);
//     } else {
//       console.warn("No session data found");
//       // Set default values if no data
//       semesterProgress.style.width = "0%";
//       semesterProgressPercentage.textContent = "0%";
//     }
//   } catch (err) {
//     console.error("Error in getStudentFirstSession:", err);
//     // Set default values on error
//     semesterProgress.style.width = "0%";
//     semesterProgressPercentage.textContent = "Error";
//   }
// }

// // Execute the function
// getSemesterProgress();
async function getSemesterProgress() {
  const semesterProgress = document.querySelector(".semester-progress-fill");
  const semesterProgressPercentage = document.querySelector(".semester-progress-percentage");
  const semesterProgressDate = document.querySelector(".semester-progress-date");
  try {
    // Fetch student courses
    const courses = await getStudentCourses();
    const coursesId = courses.map((course) => course.course_id);
    
    // Fetch sessions sorted by time
    const { data, error } = await supaClient
      .from("session")
      .select("*")
      .in("course_id", coursesId)
      .order("session_time");
    
    if (error) {
      console.error("Error fetching session data:", error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log("All sessions:", data);
      
      // Parse dates properly to ensure correct calculations
      const allSessions = data.map(session => {
        return {
          ...session,
          date: new Date(session.session_time)
        };
      });
      
      // Sort sessions by date
      allSessions.sort((a, b) => a.date - b.date);
      
      // Divide sessions into first and second semester
      const firstSessionDate = allSessions[0].date;
      const lastSessionDate = allSessions[allSessions.length - 1].date;
      
      // Calculate the midpoint between first and last session
      const totalMilliseconds = lastSessionDate - firstSessionDate;
      const midpointDate = new Date(firstSessionDate.getTime() + totalMilliseconds / 2);
      
      console.log("First session date:", firstSessionDate);
      console.log("Last session date:", lastSessionDate);
      console.log("Midpoint date:", midpointDate);
      
      // Split sessions into first and second semester
      const firstSemesterSessions = allSessions.filter(session => session.date < midpointDate);
      const secondSemesterSessions = allSessions.filter(session => session.date >= midpointDate);
        console.log("firstSemesterSessions",firstSemesterSessions);
        console.log("secondSemesterSessions",secondSemesterSessions);
        
      console.log("First semester sessions:", firstSemesterSessions.length);
      console.log("Second semester sessions:", secondSemesterSessions.length);
      
      // Determine current semester
      const currentDate = new Date();
      let currentSemesterSessions;
      let semesterName;
      console.log(currentDate);
      console.log(midpointDate);
      
      if (currentDate < midpointDate) {
        currentSemesterSessions = firstSemesterSessions;
        // semesterName = "First Semester";
      } else {
        currentSemesterSessions = secondSemesterSessions;
        // semesterName = "Second Semester";
      }
      
      if (currentSemesterSessions.length === 0) {
        console.warn("No sessions found for the current semester");
        semesterProgress.style.width = "0%";
        semesterProgressPercentage.textContent = "0%";
        // semesterProgressDate.textContent = `${semesterName}: 0/0 weeks`;
        return;
      }
      
      // Calculate progress for the current semester
      const semesterStartDate = currentSemesterSessions[0].date;
      const semesterEndDate = currentSemesterSessions[currentSemesterSessions.length - 1].date;
      
      // Helper function to get week number of year for a date
      const getWeekNumber = (date) => {
        // Create a copy of the date to avoid modifying the original
        const dateCopy = new Date(date);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        const dayNum = dateCopy.getUTCDay() || 7;
        dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - dayNum);
        // Get first day of year
        const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        const weekNumber = Math.ceil((((dateCopy - yearStart) / 86400000) + 1) / 7);
        
        // Return array of year and week number
        return [dateCopy.getUTCFullYear(), weekNumber];
      };
      
      // Calculate weeks for current semester
      const startWeekInfo = getWeekNumber(semesterStartDate);
      const endWeekInfo = getWeekNumber(semesterEndDate);
      const currentWeekInfo = getWeekNumber(currentDate);
      
      // Calculate total number of weeks in semester
      let totalWeeks = 0;
      if (startWeekInfo[0] === endWeekInfo[0]) {
        // Same year
        totalWeeks = endWeekInfo[1] - startWeekInfo[1] + 1;
      } else {
        // Different years
        const weeksInStartYear = 52 - startWeekInfo[1] + 1;
        totalWeeks = weeksInStartYear + endWeekInfo[1];
      }
      
      // Calculate elapsed weeks
      let elapsedWeeks = 0;
      if (startWeekInfo[0] === currentWeekInfo[0]) {
        // Same year
        elapsedWeeks = currentWeekInfo[1] - startWeekInfo[1] + 1;
      } else {
        // Different years
        const weeksInStartYear = 52 - startWeekInfo[1] + 1;
        elapsedWeeks = weeksInStartYear + currentWeekInfo[1];
      }
      
      // Ensure elapsedWeeks isn't greater than totalWeeks
      elapsedWeeks = Math.min(elapsedWeeks, totalWeeks);
      
      // Handle edge case where elapsed weeks is negative (current date before semester start)
      if (elapsedWeeks < 0) {
        elapsedWeeks = 0;
      }
      
      // Calculate progress percentage
      const progressPercentage = (elapsedWeeks / totalWeeks) * 100;
      // Round to nearest whole number for display
      const roundedPercentage = Math.round(progressPercentage);
      
      // Update UI elements
      semesterProgress.style.width = `${roundedPercentage}%`;
      semesterProgressPercentage.textContent = `${roundedPercentage}%`;
      semesterProgressDate.textContent = `${elapsedWeeks}/${totalWeeks} weeks`;
      
      // For debugging - show weeks calculation
      console.log(`Semester: ${semesterName}`);
      console.log(`Start week: ${startWeekInfo[1]} (${startWeekInfo[0]})`);
      console.log(`Current week: ${currentWeekInfo[1]} (${currentWeekInfo[0]})`);
      console.log(`End week: ${endWeekInfo[1]} (${endWeekInfo[0]})`);
      console.log(`Total semester weeks: ${totalWeeks} weeks`);
      console.log(`Weeks elapsed: ${elapsedWeeks} weeks`);
      console.log(`Progress: ${roundedPercentage}%`);
    } else {
      console.warn("No session data found");
      // Set default values if no data
      semesterProgress.style.width = "0%";
      semesterProgressPercentage.textContent = "0%";
      semesterProgressDate.textContent = "No semester data";
    }
  } catch (err) {
    console.error("Error in getSemesterProgress:", err);
    // Set default values on error
    semesterProgress.style.width = "0%";
    semesterProgressPercentage.textContent = "Error";
    semesterProgressDate.textContent = "Error calculating progress";
  }
}

// Execute the function
getSemesterProgress();
async function getTodayProgress() {
  const todaySessions = await getStudentSessionWithCourseNames();
  // Get current date and time
  const now = new Date();
  if (todaySessions.length === 0) {
    updateProgressUI(0, "No sessions scheduled for today");
    return;
  }
  
  // Count completed sessions (sessions whose time has passed)
  const completedSessions = todaySessions.filter(session => {
    const sessionTime = new Date(session.session_time);
    return sessionTime < now;
  });
  
  // Calculate progress percentage
  const progressPercentage = Math.round((completedSessions.length / todaySessions.length) * 100);
  
  // Update the UI with the progress
  updateProgressUI(progressPercentage, `${completedSessions.length}/${todaySessions.length} completed`);
}

// Helper function to update the progress UI
function updateProgressUI(percentage, text) {
  const progressFill = document.querySelector('.today-progress-fill');
  const progressPercentage = document.querySelector('.today-progress-percentage');
  const progressText = document.querySelector('.today-progress-text');
  if (progressFill && progressPercentage) {
    progressFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
    progressText.textContent = text;
  }
}
getTodayProgress();
// Updated function to get sessions with course names (only today's sessions)
async function getStudentSessionWithCourseNames() {
  const studentCourses = await getStudentCourses();
  const coursesId = studentCourses.map((course) => course.course_id);

  // Create a map of course_id to course_name for quick lookup
  const courseNameMap = {};
  for (const courseId of coursesId) {
    courseNameMap[courseId] = await getCourseName(courseId);
  }

  const { data, error } = await supaClient
    .from("session")
    .select("*")
    .in("course_id", coursesId);

  if (error) {
    console.error("Error fetching session data:", error);
    return [];
  }

  // Filter for today's sessions only
  const todaySessions = data.filter((session) => isSessionToday(session));

  // Map sessions to include their corresponding course name
  const sessionsWithCourseNames = todaySessions.map((session) => {
    return {
      ...session,
      course_name: courseNameMap[session.course_id] || "Unknown Course",
    };
  });

  return sessionsWithCourseNames;
}

// Updated render function
async function renderStudentSession() {
  const scheduleGrid = document.querySelector(".schedule-grid");
  if (!scheduleGrid) {
    console.error("Schedule grid element not found!");
    return;
  }

  // Show loading indicator
  scheduleGrid.innerHTML =
    '<div class="loading-spinner" style="grid-column: span 2;"></div>';

  try {
    const sessions = await getStudentSessionWithCourseNames();

    if (sessions.length === 0) {
      scheduleGrid.innerHTML =
        '<div class="no-sessions">No sessions scheduled for today</div>';
      return;
    }

    let markup = "";
    sessions.forEach((session) => {
      const formattedTime = formatSessionTime(session.session_time);
      markup += `
          <div class="schedule-item">
            <p>${session.course_name}</p>
            <span>${formattedTime}</span>
          </div>
        `;
    });

    scheduleGrid.innerHTML = markup;
  } catch (error) {
    console.error("Error rendering today's sessions:", error);
    scheduleGrid.innerHTML =
      '<div class="error">Failed to load today\'s sessions</div>';
  }
}

// Call the updated function
renderStudentSession();

// Get course name by ID
async function getCourseName(courseId) {
  const { data, error } = await supaClient
    .from("course")
    .select("course_name")
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching course data:", error);
    return "Unknown Course";
  }

  return data && data.length > 0 ? data[0].course_name : "Unknown Course";
}

// Format date for display
function formatDate(dateString) {
  try {
    // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return dateString; // Return original if invalid
    }

    // Format: "2025-04-29 09:59"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
}
function isWithinNextWeek(dateString) {
  try {
    if (!dateString) {
      console.warn("Empty date string provided");
      return false;
    }
    
    // Parse the date string
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date for weekly check:", dateString);
      return false;
    }

    // Get today at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get next week at 23:59:59
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    return date >= today && date <= nextWeek;
  } catch (e) {
    console.error("Date check error:", e, "for date:", dateString);
    return false;
  }
}
async function getWeeklyQuizzes() {
  const studentCourses = await getStudentCourses();

  if (!studentCourses.length) {
    console.log("No student courses found");
    return [];
  }

  const coursesId = studentCourses.map((course) => course.course_id);
  console.log("Course IDs for quiz fetching:", coursesId);

  const { data, error } = await supaClient
    .from("quiz")
    .select("*")
    .in("course_id", coursesId);

  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
  ;
  
  // Filter quizzes for the next week - improved date handling
  const weeklyQuizzes = data.filter((quiz) => {
    // Make sure we're using the correct field
    const dueDate = quiz.quiz_dueDateTime || quiz.quiz_duedatetime;
    
    if (!dueDate) {
      console.warn("Quiz missing due date:", quiz);
      return false;
    }
    
    const isInNextWeek = isWithinNextWeek(dueDate);
    return isInNextWeek;
  });

  return weeklyQuizzes;
}

// Get weekly assignments
async function getWeeklyAssignments() {
  const studentCourses = await getStudentCourses();

  if (!studentCourses.length) {
    return [];
  }

  const coursesId = studentCourses.map((course) => course.course_id);

  const { data, error } = await supaClient
    .from("assignment")
    .select("*")
    .in("course_id", coursesId);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  // Filter assignments for the next week
  const weeklyAssignments = data.filter((assignment) =>
    isWithinNextWeek(assignment.assign_duedate)
  );

  return weeklyAssignments;
}

// Get weekly activities with course information
async function getWeeklyActivities() {
  const studentCourses = await getStudentCourses();

  if (!studentCourses.length) {
    return [];
  }

  const coursesId = studentCourses.map((course) => course.course_id);

  // Create a map of course_id to course_name for quick lookup
  const courseNameMap = {};
  for (const courseId of coursesId) {
    courseNameMap[courseId] = await getCourseName(courseId);
  }
  const { data: courseActivities, error } = await supaClient
    .from("course_activity")
    .select("*")
    .in("course_id", coursesId);

  if (error) {
    console.error("Error fetching course activities:", error);
    return [];
  }

  if (!courseActivities.length) {
    return [];
  }

  const activityIds = courseActivities.map((activity) => activity.activity_id);

  const { data: activityData, error: activityError } = await supaClient
    .from("activity")
    .select("*")
    .in("activity_id", activityIds);

  if (activityError) {
    console.error("Error fetching activities:", activityError);
    return [];
  }

  // Filter activities for the next week
  const weeklyActivities = activityData.filter((activity) =>
    isWithinNextWeek(activity.activity_duedate)
  );

  // Map activities to include their corresponding course name
  const activitiesWithCourseInfo = weeklyActivities.map((activity) => {
    // Find the course_activity entry for this activity
    const courseActivity = courseActivities.find(
      (ca) => ca.activity_id === activity.activity_id
    );
    const courseId = courseActivity ? courseActivity.course_id : null;
    const courseName = courseId ? courseNameMap[courseId] : "Unknown Course";

    return {
      ...activity,
      course_id: courseId,
      course_name: courseName,
    };
  });

  return activitiesWithCourseInfo;
}

// Create deadline box element
function createDeadlineBox(title, type, deadline) {
  const formattedDate = formatDate(deadline);

  const box = document.createElement("div");
  box.className = "box";

  box.innerHTML = `
    <div class="upper" ${title.length > 10 ? 'style="font-size: 1.5rem;"' : ''}>${title}</div>
    <div class="lower">${type}</div>
    <div class="box__time-container">
      <p class="box__time">${formatDateShort(formattedDate)}</p>
      <img class="imgCard" src="src/images/icons8-clock-60.png" />
    </div>
  `;

  return box;
}

async function renderWeeklyDeadlines() {
  console.log("Starting to render weekly deadlines");
  const deadlineContainer = document.querySelector(".deadlineBoxes");

  if (!deadlineContainer) {
    console.error("Deadline container not found!");
    return;
  }

  // Clear existing content
  deadlineContainer.innerHTML = "";

  try {
    // Show loading indicator
    deadlineContainer.innerHTML = '<div class="loading-spinner"></div>';

    // Get all deadlines
    const quizzes = await getWeeklyQuizzes();
    const assignments = await getWeeklyAssignments();
    const activities = await getWeeklyActivities();

    // Clear loading indicator
    deadlineContainer.innerHTML = "";

    // Prepare deadline items with course names
    const deadlineItems = [];

    // Process quizzes with improved field access
    for (const quiz of quizzes) {
      try {
        const courseName = await getCourseName(quiz.course_id);
        
        // Handle potential field name variations (quiz_dueDateTime vs quiz_duedatetime)
        const quizDueDate = quiz.quiz_dueDateTime || quiz.quiz_duedatetime;
        
        if (!quizDueDate) {
          console.warn(`Quiz ${quiz.quiz_id} has no due date, skipping`);
          continue;
        }
        
        deadlineItems.push({
          title: courseName,
          type: "Quiz: " + quiz.quiz_title,
          deadline: quizDueDate,
          date: new Date(quizDueDate),
        });
      } catch (err) {
        console.error("Error processing quiz:", err, "Quiz data:", quiz);
      }
    }

    // Process assignments
    for (const assignment of assignments) {
      try {
        const courseName = await getCourseName(assignment.course_id);
        deadlineItems.push({
          title: courseName,
          type: "Assignment",
          deadline: assignment.assign_duedate,
          date: new Date(assignment.assign_duedate),
        });
      } catch (err) {
        console.error("Error processing assignment:", err);
      }
    }

    // Process activities
    for (const activity of activities) {
      try {
        deadlineItems.push({
          title: activity.course_name,
          type: "Activity",
          deadline: activity.activity_duedate,
          date: new Date(activity.activity_duedate),
        });
      } catch (err) {
        console.error("Error processing activity:", err);
      }
    }

    // Sort by deadline date (ascending)
    deadlineItems.sort((a, b) => a.date - b.date);

    // Take only the first 5 items (or less if fewer exist)
    // const itemsToShow = deadlineItems.slice(0, 5);
    const itemsToShow = deadlineItems;
    ///////// hide buttons if itemsToShow.length < 5
    if(itemsToShow.length < 5){
      document.querySelector(".nav-buttons").style.display = "none";
    }
    // Display the deadline items
    if (itemsToShow.length > 0) {
      itemsToShow.forEach((item) => {
        const box = createDeadlineBox(item.title, item.type, item.deadline);
        deadlineContainer.appendChild(box);
      });
    } else {
      deadlineContainer.innerHTML =
        '<div class="no-deadlines">No deadlines for the next week</div>';
    }
  } catch (error) {
    console.error("Error rendering deadlines:", error);
    deadlineContainer.innerHTML =
      '<div class="error">Failed to load deadlines</div>';
  }
}
// Initialize the page
function initializePage() {
  renderWeeklyDeadlines();

  // You can add other initialization code here
}

// Run when page loads
document.addEventListener("DOMContentLoaded", initializePage);

// Export function for use in other files
export { getInstructorInstitution };
async function getStudentActivityCount() {
const {data,error} = await supaClient.from("student_activity").select("*").eq("student_id",studentId);

if(error){
    console.error(error);
    return;
}
if(data){
const totalActivities = data.length;
const sumbittedActivities = data.filter((activity) => activity.activity_path !== null);

return{
  totalActivities,
  sumbittedActivities
}
}

}getStudentActivityCount();
async function getStudentAssignmentCount() {
const {data,error} = await supaClient.from("student_assignment").select("*").eq("student_id",studentId);

if(error){
    console.error(error);
    return;
}
if(data){
const totalAssignments = data.length;
const sumbittedAssignments = data.filter((assignment) => assignment.assign_path !== null).length;

return{
  totalAssignments,
  sumbittedAssignments
}
}

}getStudentAssignmentCount();
// New function to format date as "5 Nov Sun"
function formatDateShort(dateString) {
  try {
    // Parse the date string
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date for short formatting:", dateString);
      return dateString; // Return original if invalid
    }
    
    // Get day number (1-31)
    const day = date.getDate();
    
    // Get month short name (Jan, Feb, etc.)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    
    // Get weekday short name (Sun, Mon, etc.)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[date.getDay()];
    
    // Format: "5 Nov Sun"
    return `${day} ${month} ${weekday}`;
  } catch (e) {
    console.error("Date short formatting error:", e);
    return dateString;
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const deadlineBoxes = document.querySelector('.deadlineBoxes');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  
  nextButton.addEventListener('click', function() {
      deadlineBoxes.scrollBy({ left: 350, behavior: 'smooth' });
  });
  
  prevButton.addEventListener('click', function() {
      deadlineBoxes.scrollBy({ left: -350, behavior: 'smooth' });
  });
});