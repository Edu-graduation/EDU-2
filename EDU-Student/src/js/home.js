// import { supaClient } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const institutionId = JSON.parse(sessionStorage.getItem("institution_id"));

// // async function getWeeklyDeadlines() {
// //     const { data, error } = await supaClient
// //         .from("enrollment")
// //         .select("*")
// //         .eq("student_id", studentId);

// //     if (error) {
// //         console.error("Error fetching deadlines:", error);
// //         return null;
// //     }
// //     console.log(data);
// //     return data;
// // }
// async function getInstructorInstitution() {
//   const { data, error } = await supaClient
//     .from("instructor_institution")
//     .select("*")
//     .eq("institution_id", institutionId);

//   if (error) {
//     console.error("Error fetching institution data:", error);
//     return null;
//   }

//   const instructorsId = data.map((instructor) => instructor.instructor_id);
//   console.log("Instructors at this institution:", instructorsId);
//   return instructorsId;
// }

// // async function getInstructorsMap() {
// //   const instructorsId = await getInstructorInstitution();

// //   const { data, error } = await supaClient
// //     .from("instructor")
// //     .select("*")
// //     .in("instructor_id", instructorsId);

// //   if (error) {
// //     console.error("Error fetching instructors data:", error);
// //     return null;
// //   }

// //   // Create a map of instructor_id to instructor_name
// //   const instructorsMap = {};
// //   data.forEach((instructor) => {
// //     instructorsMap[instructor.instructor_id] = instructor.instructor_name;
// // });

// //   return instructorsMap;
// // }
// async function getStudentCourses() {
//   const instructorsId = await getInstructorInstitution();

//   const { data, error } = await supaClient
//     .from("enrollment")
//     .select("*")
//     .in("instructor_id", instructorsId)
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching enrollment data:", error);
//     return null;
//   }

//   // Get unique course IDs while preserving the instructor association
//   const courseInstructorMap = {};
  
// //   data.forEach((enrollment) => {
// //     const courseId = enrollment.course_id;
// //     const instructorId = enrollment.instructor_id;

// //     if (!courseInstructorMap[courseId]) {
// //       courseInstructorMap[courseId] = [];
// //     }

// //     // Add instructor to the course if not already added
// //     if (!courseInstructorMap[courseId].includes(instructorId)) {
// //       courseInstructorMap[courseId].push(instructorId);
// //     }
// //   });

// //   console.log("Course-Instructor Map:", courseInstructorMap);
// console.log(data);

//   return data;
// }

// async function getStudentDeadlineQuiz() {
//     const studentCourses = await getStudentCourses();
//     const coursesId = studentCourses.map((course) => course.course_id);
//     const { data, error } = await supaClient
//         .from("quiz")
//         .select("*")
//         .in("course_id", coursesId);

//     if (error) {
//         console.error("Error fetching deadlines:", error);
//         return null;
//     }
//     if(data && data.length > 0){
//         return data;
//     }
// }getStudentDeadlineQuiz();
// async function getStudentDeadlineAssignment() {
//     const studentCourses = await getStudentCourses();
//     const coursesId = studentCourses.map((course) => course.course_id);
//     const { data, error } = await supaClient
//         .from("assignment")
//         .select("*")
//         .in("course_id", coursesId);

//     if (error) {
//         console.error("Error fetching deadlines:", error);
//         return null;
//     }
//     if(data && data.length > 0){
//         return data;
//     }
// }getStudentDeadlineAssignment();
// async function getStudentDeadlineActivity() {
//     const studentCourses = await getStudentCourses();
//     const coursesId = studentCourses.map((course) => course.course_id);
//     const { data, error } = await supaClient
//         .from("course_activity")
//         .select("*")
//         .in("course_id", coursesId);

//     if (error) {
//         console.error("Error fetching deadlines:", error);
//         return null;
//     }
//     if(data && data.length > 0){
//         const activityIds = data.map((activity) => activity.activity_id);
//         const {data: activityData, error: activityError} = await supaClient
//         .from("activity")
//         .select("*")
//         .in("activity_id", activityIds);
//         if(activityData && activityData.length > 0){
//             return activityData;
//         }
//     }
// }getStudentDeadlineActivity();

// async function renderDeadlines() {
// const weeklyDeadlineContainer = document.querySelector(".deadlineBoxes");
// // weeklyDeadlineContainer.innerHTML = "";
// let quizesMarkup = "";
// let assignmentsMarkup = "";
// let activitiesMarkup = "";
// const quizes = await getStudentDeadlineQuiz();
// const assignments = await getStudentDeadlineAssignment();
// const activities = await getStudentDeadlineActivity();
// if(quizes && quizes.length > 0){
//     quizes.forEach(async (quiz) => {
//         const courseName = await getCourseName(quiz.course_id);
//         console.log(courseName);
//         quizesMarkup += `<div class="box">
//             <div class="upper">${courseName}</div>
//             <div class="lower">Quiz</div>
//             <div class="box__time-container">
//               <p class="box__time">${quiz.quiz_deadline}</p>
//               <img class="imgCard" src="src/images/icons8-clock-60.png" />
//             </div>
//           </div>`;
//     });
// }

// if(assignments && assignments.length > 0){
//     assignments.forEach(async (assignment) => {
//         const courseName = await getCourseName(assignment.course_id);
//         assignmentsMarkup += `<div class="box">
//         <div class="upper">${courseName}</div>
//         <div class="lower">Assignment</div>
//         <div class="box__time-container">
//           <p class="box__time">${assignment.assignment_deadline}</p>
//           <img class="imgCard" src="src/images/icons8-clock-60.png" />
//         </div>
//       </div>`;
//     });
// }

// if(activities && activities.length > 0){
//     activities.forEach(async (activity) => {
//         // const courseName = await getCourseName(activity.course_id);
//         activitiesMarkup +=  `<div class="box">
//         <div class="upper">${activity.activity_name}</div>
//         <div class="lower">Activity</div>
//         <div class="box__time-container">
//           <p class="box__time">${activity.activity_deadline}</p>
//           <img class="imgCard" src="src/images/icons8-clock-60.png" />
//         </div>
//       </div>`;
//     });
// }

// weeklyDeadlineContainer.innerHTML = quizesMarkup + assignmentsMarkup + activitiesMarkup;
// }
// renderDeadlines().then(() => {
//     console.log("Deadlines rendered successfully");
// });

// async function getCourseName(courseId) {
//     const { data, error } = await supaClient
//         .from("course")
//         .select("course_name")
//         .eq("course_id", courseId);
//     if (error) {
//         console.error("Error fetching course data:", error);
//         return null;
//     }
//     return data[0].course_name;
// }

// import { supaClient } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const institutionId = JSON.parse(sessionStorage.getItem("institution_id"));

// // Get instructors for the current institution
// async function getInstructorInstitution() {
//   const { data, error } = await supaClient
//     .from("instructor_institution")
//     .select("*")
//     .eq("institution_id", institutionId);

//   if (error) {
//     console.error("Error fetching institution data:", error);
//     return [];
//   }

//   const instructorsId = data.map((instructor) => instructor.instructor_id);
//   console.log("Instructors at this institution:", instructorsId);
//   return instructorsId;
// }

// // Get student's courses
// async function getStudentCourses() {
//   const instructorsId = await getInstructorInstitution();
  
//   if (!instructorsId.length) {
//     console.error("No instructors found for this institution");
//     return [];
//   }

//   const { data, error } = await supaClient
//     .from("enrollment")
//     .select("*")
//     .in("instructor_id", instructorsId)
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching enrollment data:", error);
//     return [];
//   }

//   console.log("Student courses:", data);
//   return data;
// }

// // Get course name by ID
// async function getCourseName(courseId) {
//   const { data, error } = await supaClient
//     .from("course")
//     .select("course_name")
//     .eq("course_id", courseId);
    
//   if (error) {
//     console.error("Error fetching course data:", error);
//     return "Unknown Course";
//   }
  
//   return data && data.length > 0 ? data[0].course_name : "Unknown Course";
// }

// // Format date for display
// function formatDate(dateString) {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       return dateString; // Return original if invalid
//     }
    
//     // Format: "5 Oct Sun"
//     const day = date.getDate();
//     const month = date.toLocaleString('en-US', { month: 'short' });
//     const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    
//     return `${day} ${month} ${weekday.toLowerCase()}`;
//   } catch (e) {
//     console.error("Date formatting error:", e);
//     return dateString;
//   }
// }

// // Check if a date is within the next 7 days
// function isWithinNextWeek(dateString) {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       return false;
//     }
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const nextWeek = new Date(today);
//     nextWeek.setDate(today.getDate() + 7);
    
//     return date >= today && date <= nextWeek;
//   } catch (e) {
//     console.error("Date check error:", e);
//     return false;
//   }
// }

// // Get weekly quizzes
// async function getWeeklyQuizzes() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("quiz")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching quizzes:", error);
//     return [];
//   }
//     console.log(data);
    
//   // Filter quizzes for the next week
//   return data.filter(quiz => isWithinNextWeek(new Date(quiz.quiz_deadline)));
// }

// // Get weekly assignments
// async function getWeeklyAssignments() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("assignment")
//     .select("*")
//     .in("course_id", coursesId);
//   if (error) {
//     console.error("Error fetching assignments:", error);
//     return [];
//   }
  
//   // Filter assignments for the next week
//   console.log(data);
//   return data.filter(assignment => isWithinNextWeek(new Date(assignment.assignment_deadline)));

// }
// console.log(isWithinNextWeek("2025-05-08"));

// // Get weekly activities
// async function getWeeklyActivities() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data: courseActivities, error } = await supaClient
//     .from("course_activity")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching course activities:", error);
//     return [];
//   }
  
//   if (!courseActivities.length) {
//     return [];
//   }
  
//   const activityIds = courseActivities.map((activity) => activity.activity_id);
  
//   const { data: activityData, error: activityError } = await supaClient
//     .from("activity")
//     .select("*")
//     .in("activity_id", activityIds);
//   if (activityError) {
//     console.error("Error fetching activities:", activityError);
//     return [];
//   }
  
//   // Filter activities for the next week
//   return activityData.filter(activity => isWithinNextWeek(activity.activity_deadline));
// }

// // Create deadline box element
// function createDeadlineBox(title, type, deadline) {
//   const formattedDate = formatDate(deadline);
  
//   const box = document.createElement("div");
//   box.className = "box";
  
//   box.innerHTML = `
//     <div class="upper">${title}</div>
//     <div class="lower">${type}</div>
//     <div class="box__time-container">
//       <p class="box__time">${formattedDate}</p>
//       <img class="imgCard" src="src/images/icons8-clock-60.png" />
//     </div>
//   `;
  
//   return box;
// }

// // Render all weekly deadlines
// async function renderWeeklyDeadlines() {
//   const deadlineContainer = document.querySelector(".deadlineBoxes");
  
//   // Clear existing content
//   deadlineContainer.innerHTML = "";
  
//   try {
//     // Show loading indicator
//     deadlineContainer.innerHTML = '<div class="loading">Loading deadlines...</div>';
    
//     // Get all deadlines
//     const [quizzes, assignments, activities] = await Promise.all([
//       getWeeklyQuizzes(),
//       getWeeklyAssignments(),
//       getWeeklyActivities()
//     ]);
//     console.log(quizzes);
//     console.log(assignments);
//     console.log(activities);
//     // Clear loading indicator
//     deadlineContainer.innerHTML = "";
    
//     // Prepare deadline items with course names
//     const deadlineItems = [];
    
//     // Process quizzes
//     for (const quiz of quizzes) {
//       const courseName = await getCourseName(quiz.course_id);
//       deadlineItems.push({
//         title: courseName,
//         type: "Quiz",
//         deadline: quiz.quiz_deadline,
//         date: new Date(quiz.quiz_deadline)
//       });
//     }
    
//     // Process assignments
//     for (const assignment of assignments) {
//       const courseName = await getCourseName(assignment.course_id);
//       deadlineItems.push({
//         title: courseName,
//         type: "Assignment",
//         deadline: assignment.assignment_deadline,
//         date: new Date(assignment.assignment_deadline)
//       });
//     }
    
//     // Process activities
//     for (const activity of activities) {
//       deadlineItems.push({
//         title: activity.activity_name,
//         type: "Activity",
//         deadline: activity.activity_deadline,
//         date: new Date(activity.activity_deadline)
//       });
//     }
    
//     // Sort by deadline date (ascending)
//     deadlineItems.sort((a, b) => a.date - b.date);
    
//     // Take only the first 4 items (or less if fewer exist)
//     const itemsToShow = deadlineItems.slice(0, 4);
    
//     // Display the deadline items

//     if (itemsToShow.length > 0) {
        
//       itemsToShow.forEach(item => {
//         const box = createDeadlineBox(item.title, item.type, item.deadline);
//         deadlineContainer.appendChild(box);
//       });
//     } else {
//       deadlineContainer.innerHTML = '<div class="no-deadlines">No deadlines for the next week</div>';
//     }
    
//   } catch (error) {
//     console.error("Error rendering deadlines:", error);
//     deadlineContainer.innerHTML = '<div class="error">Failed to load deadlines</div>';
//   }
// }

// // Initialize the page
// function initializePage() {
//   renderWeeklyDeadlines();
  
//   // You can add other initialization code here
// }

// // Run when page loads
// document.addEventListener('DOMContentLoaded', initializePage);

// // Export function for use in other files
// export { getInstructorInstitution };

// import { supaClient } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const institutionId = JSON.parse(sessionStorage.getItem("institution_id"));

// // Get instructors for the current institution
// async function getInstructorInstitution() {
//   const { data, error } = await supaClient
//     .from("instructor_institution")
//     .select("*")
//     .eq("institution_id", institutionId);

//   if (error) {
//     console.error("Error fetching institution data:", error);
//     return [];
//   }

//   const instructorsId = data.map((instructor) => instructor.instructor_id);
//   console.log("Instructors at this institution:", instructorsId);
//   return instructorsId;
// }

// // Get student's courses
// async function getStudentCourses() {
//   const instructorsId = await getInstructorInstitution();
  
//   if (!instructorsId.length) {
//     console.error("No instructors found for this institution");
//     return [];
//   }

//   const { data, error } = await supaClient
//     .from("enrollment")
//     .select("*")
//     .in("instructor_id", instructorsId)
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching enrollment data:", error);
//     return [];
//   }

//   console.log("Student courses:", data);
//   return data;
// }

// // Get course name by ID
// async function getCourseName(courseId) {
//   const { data, error } = await supaClient
//     .from("course")
//     .select("course_name")
//     .eq("course_id", courseId);
    
//   if (error) {
//     console.error("Error fetching course data:", error);
//     return "Unknown Course";
//   }
  
//   return data && data.length > 0 ? data[0].course_name : "Unknown Course";
// }

// // Format date for display
// function formatDate(dateString) {
//   try {
//     // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.warn("Invalid date:", dateString);
//       return dateString; // Return original if invalid
//     }
    
//     // Format: "8 May Thu"
//     const day = date.getDate();
//     const month = date.toLocaleString('en-US', { month: 'short' });
//     const weekday = date.toLocaleString('en-US', { weekday: 'short' });
    
//     return `${day} ${month} ${weekday}`;
//   } catch (e) {
//     console.error("Date formatting error:", e);
//     return dateString;
//   }
// }

// // Check if a date is within the next 7 days
// function isWithinNextWeek(dateString) {
//   try {
//     // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.warn("Invalid date for weekly check:", dateString);
//       return false;
//     }
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const nextWeek = new Date(today);
//     nextWeek.setDate(today.getDate() + 7);
//     nextWeek.setHours(23, 59, 59, 999);
    
//     console.log(`Checking date: ${dateString}`);
//     console.log(`Date parsed as: ${date}`);
//     console.log(`Today: ${today}, Next week: ${nextWeek}`);
//     console.log(`Is within week: ${date >= today && date <= nextWeek}`);
    
//     return date >= today && date <= nextWeek;
//   } catch (e) {
//     console.error("Date check error:", e);
//     return false;
//   }
// }

// // Get weekly quizzes
// async function getWeeklyQuizzes() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("quiz")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching quizzes:", error);
//     return [];
//   }
  
//   console.log("Fetched quizzes:", data);
  
//   // Filter quizzes for the next week
//   const weeklyQuizzes = data.filter(quiz => isWithinNextWeek(quiz.quiz_dueDateTime));
//   console.log("Weekly quizzes after filtering:", weeklyQuizzes);
// //   console.log('data', data);
  
//   return weeklyQuizzes;
// }

// // Get weekly assignments
// async function getWeeklyAssignments() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("assignment")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching assignments:", error);
//     return [];
//   }
  
//   console.log("Fetched assignments:", data);
  
//   // Filter assignments for the next week
//   const weeklyAssignments = data.filter(assignment => isWithinNextWeek(assignment.assign_duedate));
//   console.log("Weekly assignments after filtering:", weeklyAssignments);
  
//   return weeklyAssignments;
// }

// // Get weekly activities
// async function getWeeklyActivities() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data: courseActivities, error } = await supaClient
//     .from("course_activity")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching course activities:", error);
//     return [];
//   }
  
//   if (!courseActivities.length) {
//     return [];
//   }
  
//   console.log("Fetched course activities:", courseActivities);
  
//   const activityIds = courseActivities.map((activity) => activity.activity_id);
  
//   const { data: activityData, error: activityError } = await supaClient
//     .from("activity")
//     .select("*")
//     .in("activity_id", activityIds);
    
//   if (activityError) {
//     console.error("Error fetching activities:", activityError);
//     return [];
//   }
  
//   console.log("Fetched activities:", activityData);
  
//   // Filter activities for the next week
//   const weeklyActivities = activityData.filter(activity => isWithinNextWeek(activity.activity_duedate));
//   console.log("Weekly activities after filtering:", weeklyActivities);
  
//   return weeklyActivities;
// }

// // Create deadline box element
// function createDeadlineBox(title, type, deadline) {
//   const formattedDate = formatDate(deadline);
  
//   const box = document.createElement("div");
//   box.className = "box";
  
//   box.innerHTML = `
//     <div class="upper">${title}</div>
//     <div class="lower">${type}</div>
//     <div class="box__time-container">
//       <p class="box__time">${formattedDate}</p>
//       <img class="imgCard" src="src/images/icons8-clock-60.png" />
//     </div>
//   `;
  
//   return box;
// }

// // Render all weekly deadlines
// async function renderWeeklyDeadlines() {
//   console.log("Starting to render weekly deadlines");
//   const deadlineContainer = document.querySelector(".deadlineBoxes");
  
//   if (!deadlineContainer) {
//     console.error("Deadline container not found!");
//     return;
//   }
  
//   // Clear existing content
//   deadlineContainer.innerHTML = "";
  
//   try {
//     // Show loading indicator
//     deadlineContainer.innerHTML = '<div class="loading">Loading deadlines...</div>';
    
//     console.log("Fetching deadlines...");
    
//     // Get all deadlines
//     const quizzes = await getWeeklyQuizzes();
//     const assignments = await getWeeklyAssignments();
//     const activities = await getWeeklyActivities();
    
//     console.log(`Found ${quizzes.length} quizzes, ${assignments.length} assignments, ${activities.length} activities`);
    
//     // Clear loading indicator
//     deadlineContainer.innerHTML = "";
    
//     // Prepare deadline items with course names
//     const deadlineItems = [];
    
//     // Process quizzes
//     for (const quiz of quizzes) {
//       try {
//         const courseName = await getCourseName(quiz.course_id);
//         deadlineItems.push({
//           title: courseName,
//           type: "Quiz",
//           deadline: quiz.quiz_dueDateTime,
//           date: new Date(quiz.quiz_dueDateTime)
//         });
//       } catch (err) {
//         console.error("Error processing quiz:", err);
//       }
//     }
    
//     // Process assignments
//     for (const assignment of assignments) {
//       try {
//         const courseName = await getCourseName(assignment.course_id);
//         deadlineItems.push({
//           title: courseName,
//           type: "Assignment",
//           deadline: assignment.assign_duedate,
//           date: new Date(assignment.assign_duedate)
//         });
//       } catch (err) {
//         console.error("Error processing assignment:", err);
//       }
//     }
    
//     // Process activities
//     for (const activity of activities) {
//       try {
//         deadlineItems.push({
//           title: activity.activity_name,
//           type: "Activity",
//           deadline: activity.activity_duedate,
//           date: new Date(activity.activity_duedate)
//         });
//       } catch (err) {
//         console.error("Error processing activity:", err);
//       }
//     }
    
//     console.log("All deadline items:", deadlineItems);
    
//     // Sort by deadline date (ascending)
//     deadlineItems.sort((a, b) => a.date - b.date);
    
//     // Take only the first 4 items (or less if fewer exist)
//     const itemsToShow = deadlineItems.slice(0, 4);
    
//     console.log("Items to show:", itemsToShow);
    
//     // Display the deadline items
//     if (itemsToShow.length > 0) {
//       itemsToShow.forEach(item => {
//         const box = createDeadlineBox(item.title, item.type, item.deadline);
//         deadlineContainer.appendChild(box);
//       });
//     } else {
//       // If no deadlines, just create some sample boxes for testing
//     //   console.log("No deadlines found, adding sample boxes for test display");
      
//     //   const courseCodes = ["MOT", "ITI", "SAD", "Database"];
//     //   const types = ["Assignment", "Assignment", "Presentation", "Assignment"];
//     //   const dates = ["5 Oct Sun", "3 Nov Mon", "19 Oct Wed", "6 Oct Sat"];
      
//     //   for (let i = 0; i < 4; i++) {
//     //     const box = document.createElement("div");
//     //     box.className = "box";
        
//     //     box.innerHTML = `
//     //       <div class="upper">${courseCodes[i]}</div>
//     //       <div class="lower">${types[i]}</div>
//     //       <div class="box__time-container">
//     //         <p class="box__time">${dates[i]}</p>
//     //         <img class="imgCard" src="src/images/icons8-clock-60.png" />
//     //       </div>
//     //     `;
        
//     //     deadlineContainer.appendChild(box);
//     //   }
//     }
    
//   } catch (error) {
//     console.error("Error rendering deadlines:", error);
//     deadlineContainer.innerHTML = '<div class="error">Failed to load deadlines</div>';
//   }
// }

// // Initialize the page
// function initializePage() {
//   renderWeeklyDeadlines();
  
//   // You can add other initialization code here
// }

// // Run when page loads
// document.addEventListener('DOMContentLoaded', initializePage);

// // Export function for use in other files
// export { getInstructorInstitution };

// import { supaClient } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const institutionId = JSON.parse(sessionStorage.getItem("institution_id"));

// // Get instructors for the current institution
// async function getInstructorInstitution() {
//   const { data, error } = await supaClient
//     .from("instructor_institution")
//     .select("*")
//     .eq("institution_id", institutionId);

//   if (error) {
//     console.error("Error fetching institution data:", error);
//     return [];
//   }

//   const instructorsId = data.map((instructor) => instructor.instructor_id);
//   console.log("Instructors at this institution:", instructorsId);
//   return instructorsId;
// }

// // Get student's courses
// async function getStudentCourses() {
//   const instructorsId = await getInstructorInstitution();
  
//   if (!instructorsId.length) {
//     console.error("No instructors found for this institution");
//     return [];
//   }

//   const { data, error } = await supaClient
//     .from("enrollment")
//     .select("*")
//     .in("instructor_id", instructorsId)
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching enrollment data:", error);
//     return [];
//   }

//   console.log("Student courses:", data);
//   return data;
// }

// // Get course name by ID
// async function getCourseName(courseId) {
//   const { data, error } = await supaClient
//     .from("course")
//     .select("course_name")
//     .eq("course_id", courseId);
    
//   if (error) {
//     console.error("Error fetching course data:", error);
//     return "Unknown Course";
//   }
  
//   return data && data.length > 0 ? data[0].course_name : "Unknown Course";
// }

// // Format date for display (UPDATED: now uses YYYY-MM-DD HH:MM format)
// function formatDate(dateString) {
//   try {
//     // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.warn("Invalid date:", dateString);
//       return dateString; // Return original if invalid
//     }
    
//     // Format: "2025-04-29 09:59"
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
    
//     return `${year}-${month}-${day} ${hours}:${minutes}`;
//   } catch (e) {
//     console.error("Date formatting error:", e);
//     return dateString;
//   }
// }

// // Check if a date is within the next 7 days
// function isWithinNextWeek(dateString) {
//   try {
//     // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.warn("Invalid date for weekly check:", dateString);
//       return false;
//     }
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const nextWeek = new Date(today);
//     nextWeek.setDate(today.getDate() + 7);
//     nextWeek.setHours(23, 59, 59, 999);
    
//     console.log(`Checking date: ${dateString}`);
//     console.log(`Date parsed as: ${date}`);
//     console.log(`Today: ${today}, Next week: ${nextWeek}`);
//     console.log(`Is within week: ${date >= today && date <= nextWeek}`);
    
//     return date >= today && date <= nextWeek;
//   } catch (e) {
//     console.error("Date check error:", e);
//     return false;
//   }
// }

// // Get weekly quizzes
// async function getWeeklyQuizzes() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("quiz")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching quizzes:", error);
//     return [];
//   }
  
//   console.log("Fetched quizzes:", data);
  
//   // Filter quizzes for the next week
//   const weeklyQuizzes = data.filter(quiz => isWithinNextWeek(quiz.quiz_dueDateTime));
//   console.log("Weekly quizzes after filtering:", weeklyQuizzes);
  
//   return weeklyQuizzes;
// }

// // Get weekly assignments
// async function getWeeklyAssignments() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
  
//   const coursesId = studentCourses.map((course) => course.course_id);
  
//   const { data, error } = await supaClient
//     .from("assignment")
//     .select("*")
//     .in("course_id", coursesId);

//   if (error) {
//     console.error("Error fetching assignments:", error);
//     return [];
//   }
  
//   console.log("Fetched assignments:", data);
  
//   // Filter assignments for the next week
//   const weeklyAssignments = data.filter(assignment => isWithinNextWeek(assignment.assign_duedate));
//   console.log("Weekly assignments after filtering:", weeklyAssignments);
  
//   return weeklyAssignments;
// }

// // Get weekly activities
// async function getWeeklyActivities() {
//   const studentCourses = await getStudentCourses();
  
//   if (!studentCourses.length) {
//     return [];
//   }
//   let courseName = [];
//   const coursesId = studentCourses.map((course) => course.course_id);
//   for (let i = 0; i < coursesId.length; i++) {
//     courseName.push(await getCourseName(coursesId[i]));
//   }
//   console.log("Courses name:", courseName);
  
//   console.log("Course name:", courseName);
//   const { data: courseActivities, error } = await supaClient
//     .from("course_activity")
//     .select("*")
//     .in("course_id", coursesId);
//   console.log("Fetched course activities:", courseActivities);
//   if (error) {
//     console.error("Error fetching course activities:", error);
//     return [];
//   }
  
//   if (!courseActivities.length) {
//     return [];
//   }
  
//   console.log("Fetched course activities:", courseActivities);
  
//   const activityIds = courseActivities.map((activity) => activity.activity_id);
  
//   const { data: activityData, error: activityError } = await supaClient
//     .from("activity")
//     .select("*")
//     .in("activity_id", activityIds);
    
//   if (activityError) {
//     console.error("Error fetching activities:", activityError);
//     return [];
//   }
  
//   console.log("Fetched activities:", activityData);
  
//   // Filter activities for the next week
//   const weeklyActivities = activityData.filter(activity => isWithinNextWeek(activity.activity_duedate));
//   console.log("Weekly activities after filtering:", weeklyActivities);
  
//   return {...weeklyActivities,courseName};
// }

// // Create deadline box element
// function createDeadlineBox(title, type, deadline) {
//   const formattedDate = formatDate(deadline);
  
//   const box = document.createElement("div");
//   box.className = "box";
  
//   box.innerHTML = `
//     <div class="upper">${title}</div>
//     <div class="lower">${type}</div>
//     <div class="box__time-container">
//       <p class="box__time">${formattedDate}</p>
//       <img class="imgCard" src="src/images/icons8-clock-60.png" />
//     </div>
//   `;
  
//   return box;
// }

// // Render all weekly deadlines
// async function renderWeeklyDeadlines() {
//   console.log("Starting to render weekly deadlines");
//   const deadlineContainer = document.querySelector(".deadlineBoxes");
  
//   if (!deadlineContainer) {
//     console.error("Deadline container not found!");
//     return;
//   }
  
//   // Clear existing content
//   deadlineContainer.innerHTML = "";
  
//   try {
//     // Show loading indicator
//     deadlineContainer.innerHTML = '<div class="loading">Loading deadlines...</div>';
    
//     console.log("Fetching deadlines...");
    
//     // Get all deadlines
//     const quizzes = await getWeeklyQuizzes();
//     const assignments = await getWeeklyAssignments();
//     const activitiesData = await getWeeklyActivities();
        
//     console.log(`Found ${quizzes.length} quizzes, ${assignments.length} assignments, ${activitiesData.length} activities`);
    
//     // Clear loading indicator
//     deadlineContainer.innerHTML = "";
    
//     // Prepare deadline items with course names
//     const deadlineItems = [];
    
//     // Process quizzes
//     for (const quiz of quizzes) {
//       try {
//         const courseName = await getCourseName(quiz.course_id);
//         deadlineItems.push({
//           title: courseName,
//           type: "Quiz",
//           deadline: quiz.quiz_dueDateTime,
//           date: new Date(quiz.quiz_dueDateTime)
//         });
//       } catch (err) {
//         console.error("Error processing quiz:", err);
//       }
//     }
    
//     // Process assignments
//     for (const assignment of assignments) {
//       try {
//         const courseName = await getCourseName(assignment.course_id);
//         deadlineItems.push({
//           title: courseName,
//           type: "Assignment",
//           deadline: assignment.assign_duedate,
//           date: new Date(assignment.assign_duedate)
//         });
//       } catch (err) {
//         console.error("Error processing assignment:", err);
//       }
//     }
    
//     // Process activities
//     for (const activity of activities) {
//         console.log(activity);
        
//       try {
//         deadlineItems.push({
//           title: activity.activity_name,
//           type: "Activity",
//           deadline: activity.activity_duedate,
//           date: new Date(activity.activity_duedate)
//         });
//       } catch (err) {
//         console.error("Error processing activity:", err);
//       }
//     }
    
//     console.log("All deadline items:", deadlineItems);
    
//     // Sort by deadline date (ascending)
//     deadlineItems.sort((a, b) => a.date - b.date);
    
//     // Take only the first 4 items (or less if fewer exist)
//     const itemsToShow = deadlineItems.slice(0, 6);
    
//     console.log("Items to show:", itemsToShow);
    
//     // Display the deadline items
//     if (itemsToShow.length > 0) {
//       itemsToShow.forEach(item => {
//         const box = createDeadlineBox(item.title, item.type, item.deadline);
//         deadlineContainer.appendChild(box);
//       });
//     } else {
//       deadlineContainer.innerHTML = '<div class="no-deadlines">No deadlines for the next week</div>';
//     }
    
//   } catch (error) {
//     console.error("Error rendering deadlines:", error);
//     deadlineContainer.innerHTML = '<div class="error">Failed to load deadlines</div>';
//   }
// }

// // Initialize the page
// function initializePage() {
//   renderWeeklyDeadlines();
  
//   // You can add other initialization code here
// }

// // Run when page loads
// document.addEventListener('DOMContentLoaded', initializePage);

// // Export function for use in other files
// export { getInstructorInstitution };
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
  console.log("Instructors at this institution:", instructorsId);
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

  console.log("Student courses:", data);
  return data;
}

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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
}

// Check if a date is within the next 7 days
function isWithinNextWeek(dateString) {
  try {
    // Parse ISO 8601 date (e.g. "2025-05-08T12:00:00+00:00")
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date for weekly check:", dateString);
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    console.log(`Checking date: ${dateString}`);
    console.log(`Date parsed as: ${date}`);
    console.log(`Today: ${today}, Next week: ${nextWeek}`);
    console.log(`Is within week: ${date >= today && date <= nextWeek}`);
    
    return date >= today && date <= nextWeek;
  } catch (e) {
    console.error("Date check error:", e);
    return false;
  }
}

// Get weekly quizzes
async function getWeeklyQuizzes() {
  const studentCourses = await getStudentCourses();
  
  if (!studentCourses.length) {
    return [];
  }
  
  const coursesId = studentCourses.map((course) => course.course_id);
  
  const { data, error } = await supaClient
    .from("quiz")
    .select("*")
    .in("course_id", coursesId);

  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
  
  console.log("Fetched quizzes:", data);
  
  // Filter quizzes for the next week
  const weeklyQuizzes = data.filter(quiz => isWithinNextWeek(quiz.quiz_dueDateTime));
  console.log("Weekly quizzes after filtering:", weeklyQuizzes);
  
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
  
  console.log("Fetched assignments:", data);
  
  // Filter assignments for the next week
  const weeklyAssignments = data.filter(assignment => isWithinNextWeek(assignment.assign_duedate));
  console.log("Weekly assignments after filtering:", weeklyAssignments);
  
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
  
  console.log("Course name map:", courseNameMap);
  
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
  
  console.log("Fetched course activities:", courseActivities);
  
  const activityIds = courseActivities.map((activity) => activity.activity_id);
  
  const { data: activityData, error: activityError } = await supaClient
    .from("activity")
    .select("*")
    .in("activity_id", activityIds);
    
  if (activityError) {
    console.error("Error fetching activities:", activityError);
    return [];
  }
  
  console.log("Fetched activities:", activityData);
  
  // Filter activities for the next week
  const weeklyActivities = activityData.filter(activity => 
    isWithinNextWeek(activity.activity_duedate)
  );
  
  // Map activities to include their corresponding course name
  const activitiesWithCourseInfo = weeklyActivities.map(activity => {
    // Find the course_activity entry for this activity
    const courseActivity = courseActivities.find(ca => ca.activity_id === activity.activity_id);
    const courseId = courseActivity ? courseActivity.course_id : null;
    const courseName = courseId ? courseNameMap[courseId] : "Unknown Course";
    
    return {
      ...activity,
      course_id: courseId,
      course_name: courseName
    };
  });
  
  console.log("Weekly activities with course info:", activitiesWithCourseInfo);
  return activitiesWithCourseInfo;
}

// Create deadline box element
function createDeadlineBox(title, type, deadline) {
  const formattedDate = formatDate(deadline);
  
  const box = document.createElement("div");
  box.className = "box";
  
  box.innerHTML = `
    <div class="upper">${title}</div>
    <div class="lower">${type}</div>
    <div class="box__time-container">
      <p class="box__time">${formattedDate}</p>
      <img class="imgCard" src="src/images/icons8-clock-60.png" />
    </div>
  `;
  
  return box;
}

// Render all weekly deadlines
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
    deadlineContainer.innerHTML = '<div class="loading">Loading deadlines...</div>';
    
    console.log("Fetching deadlines...");
    
    // Get all deadlines
    const quizzes = await getWeeklyQuizzes();
    const assignments = await getWeeklyAssignments();
    const activities = await getWeeklyActivities();
    
    console.log(`Found ${quizzes.length} quizzes, ${assignments.length} assignments, ${activities.length} activities`);
    
    // Clear loading indicator
    deadlineContainer.innerHTML = "";
    
    // Prepare deadline items with course names
    const deadlineItems = [];
    
    // Process quizzes
    for (const quiz of quizzes) {
      try {
        const courseName = await getCourseName(quiz.course_id);
        deadlineItems.push({
          title: courseName,
          type: "Quiz",
          deadline: quiz.quiz_dueDateTime,
          date: new Date(quiz.quiz_dueDateTime)
        });
      } catch (err) {
        console.error("Error processing quiz:", err);
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
          date: new Date(assignment.assign_duedate)
        });
      } catch (err) {
        console.error("Error processing assignment:", err);
      }
    }
    
    // Process activities - now using the course_name we added to each activity
    for (const activity of activities) {
      try {
        deadlineItems.push({
          title: activity.course_name, // Using course name instead of activity name
          type: "Activity",
          deadline: activity.activity_duedate,
          date: new Date(activity.activity_duedate)
        });
      } catch (err) {
        console.error("Error processing activity:", err);
      }
    }
    
    console.log("All deadline items:", deadlineItems);
    
    // Sort by deadline date (ascending)
    deadlineItems.sort((a, b) => a.date - b.date);
    
    // Take only the first 6 items (or less if fewer exist)
    const itemsToShow = deadlineItems.slice(0, 5);
    // const itemsToShow = deadlineItems;
    
    console.log("Items to show:", itemsToShow);
    
    // Display the deadline items
    if (itemsToShow.length > 0) {
      itemsToShow.forEach(item => {
        const box = createDeadlineBox(item.title, item.type, item.deadline);
        deadlineContainer.appendChild(box);
      });
    } else {
      deadlineContainer.innerHTML = '<div class="no-deadlines">No deadlines for the next week</div>';
    }
    
  } catch (error) {
    console.error("Error rendering deadlines:", error);
    deadlineContainer.innerHTML = '<div class="error">Failed to load deadlines</div>';
  }
}

// Initialize the page
function initializePage() {
  renderWeeklyDeadlines();
  
  // You can add other initialization code here
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initializePage);

// Export function for use in other files
export { getInstructorInstitution };
