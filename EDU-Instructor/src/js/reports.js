import { isInstitutionSchool } from "./main.js"
const { createClient } = supabase
const supabaseProjectUrl = "https://iuiwdjtmdeempcqxeuhf.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXdkanRtZGVlbXBjcXhldWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTY1MDcsImV4cCI6MjA2MDMzMjUwN30.XfSmnKA8wbsXIA1qkfYaRkzxtEdudIDNYbSJu-M5Zag"
const supaClient = createClient(supabaseProjectUrl, supabaseKey)

// Mock current instructor ID (in a real app, this would come from authentication)
const instructorId = JSON.parse(sessionStorage.getItem("instructorId"));
const instututionId = JSON.parse(sessionStorage.getItem("institution_id"));
console.log(instructorId);
console.log(instututionId);

// Chart colors from CSS variables
const chartColors = {
  primary: "#5955b3",
  primaryLight: "#5a47ff",
  primaryDark: "#4d49a1",
  dayColors: [
    "#e3dbf4", // day-color-1
    "#fae3d4", // day-color-2
    "#bbeff4", // day-color-3
    "#dff7e3", // day-color-4
    "#ffebc7", // day-color-5
    "#fdffaa", // day-color-6
    "#e8c07b", // day-color-7
  ],
  dayTextColors: [
    "#7159a2", // day-color-text-1
    "#e0a855", // day-color-text-2
    "#63d8e2", // day-color-text-3
    "rgb(117, 161, 117)", // day-color-text-4
    "#ebc353", // day-color-text-5
    "#cbcd4c", // day-color-text-6
    "#daa74e", // day-color-text-7
  ],
}

// Chart instances
const charts = {}

// Common chart options
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
        },
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      titleColor: chartColors.primary,
      bodyColor: "#333",
      borderColor: "#ddd",
      borderWidth: 1,
      padding: 10,
      titleFont: {
        family: "'Poppins', sans-serif",
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        family: "'Poppins', sans-serif",
        size: 13,
      },
      cornerRadius: 6,
    },
  },
}

// Show loading indicator
function showLoading(elementId) {
  const loadingElement = document.getElementById(`${elementId}Loading`)
  
  if (loadingElement) {
    loadingElement.style.display = "flex"
  }
}

// Hide loading indicator
function hideLoading(elementId) {
  const loadingElement = document.getElementById(`${elementId}Loading`);
  if (loadingElement) {
    loadingElement.style.display = "none"
  }
}

// Display error message
function showError(elementId, message) {
  const container = document.getElementById(elementId).parentElement
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.textContent = message || "Failed to load data"
  container.appendChild(errorDiv)
  hideLoading(elementId)
}

// Initialize all charts and data
async function initializeReports() {
  try {
    // Show loading indicators for all charts
    showLoading("coursePerformanceChart")
    showLoading("studentEngagementChart")
    showLoading("assignmentCompletionChart")
    showLoading("quizPerformanceChart")
    showLoading("studentProgressChart")
    showLoading("activityParticipationChart")
    showLoading("performanceTrendChart")
    showLoading("atRiskStudents")

    // Fetch all necessary data for the instructor
    const [
      instructorData,
      instructorCourses,
      studentsData,
      enrollmentData,
      assignmentsData,
      studentAssignmentData,
      quizzesData,
      studentQuizData,
      activitiesData,
      courseActivityData,
      studentActivityData,
      sessionsData,
    ] = await Promise.all([
      fetchInstructorData(instructorId),
      fetchInstructorCourses(instructorId),
      fetchStudents(),
      fetchEnrollments(instructorId),
      fetchInstructorAssignments(instructorId),
      fetchStudentAssignments(),
      fetchInstructorQuizzes(instructorId),
      fetchStudentQuizzes(),
      fetchInstructorActivities(instructorId),
      fetchCourseActivities(),
      fetchStudentActivities(),
      fetchInstructorSessions(instructorId),
    ])

    // Populate course filter
    populateCourseFilter(instructorCourses)
    // Update summary cards
    updateSummaryCards(instructorCourses, studentsData, enrollmentData, assignmentsData, studentAssignmentData)
    // Initialize each chart
    initCoursePerformanceChart(
      instructorCourses,
      enrollmentData,
      studentAssignmentData,
      studentQuizData,
      assignmentsData,
      quizzesData,
    )

    initStudentEngagementChart(instructorCourses, enrollmentData, studentActivityData)

    initAssignmentCompletionChart(assignmentsData, studentAssignmentData, instructorCourses)

    initQuizPerformanceChart(quizzesData, studentQuizData, instructorCourses)

    initStudentProgressChart(
      instructorCourses,
      enrollmentData,
      studentAssignmentData,
      studentQuizData,
      assignmentsData,
      quizzesData,
    )

    initActivityParticipationChart(activitiesData, studentActivityData, instructorCourses, courseActivityData)

    initPerformanceTrendChart(instructorCourses, studentAssignmentData, studentQuizData, assignmentsData, quizzesData)

    // Initialize at-risk students table
    initAtRiskStudentsTable(
      studentsData,
      instructorCourses,
      enrollmentData,
      assignmentsData,
      studentAssignmentData,
      quizzesData,
      studentQuizData,
      studentActivityData,
    )
  } catch (error) {
    console.error("Error initializing reports:", error)
  }
}

// Fetch data functions
async function fetchInstructorData(instructorId) {
  const { data, error } = await supaClient.from("instructor").select("*").eq("instructor_id", instructorId).single()
  console.log(data);
  
  if (error) throw error
  return data
}

async function fetchInstructorCourses(instructorId) {
  // Get courses through enrollment table where instructor teaches
  const { data, error } = await supaClient
    .from("enrollment")
    .select(`
      course_id,
      course:course_id (*)
    `)
    .eq("instructor_id", instructorId)
  if (error) throw error

  // Extract unique courses
  const uniqueCourses = []
  const courseIds = new Set()

  data.forEach((item) => {
    if (!courseIds.has(item.course_id)) {
      courseIds.add(item.course_id)
      uniqueCourses.push(item.course)
    }
  })

  return uniqueCourses
}

async function fetchStudents() {
  const enrolledStudents = await fetchEnrollments(instructorId);
  const studentIds = enrolledStudents.map((student) => student.student_id);
  const { data, error } = await supaClient.from("student").select("*")
  .in("student_id", studentIds);
  if (error) throw error
  return data
}

async function fetchEnrollments(instructorId) {
  const { data, error } = await supaClient.from("enrollment").select("*").eq("instructor_id", instructorId);
  if (error) throw error
  return data
}

async function fetchInstructorAssignments(instructorId) {
  const { data, error } = await supaClient.from("assignment").select("*").eq("instructor_id", instructorId)
  if (error) throw error
  return data
}

async function fetchStudentAssignments() {
  const enrolledStudents = await fetchEnrollments(instructorId);
  const studentIds = enrolledStudents.map((student) => student.student_id);
  const { data, error } = await supaClient.from("student_assignment").select("*")
  .in("student_id", studentIds);
  if (error) throw error
  return data
}

async function fetchInstructorQuizzes(instructorId) {
  const { data, error } = await supaClient.from("quiz").select("*").eq("instructor_id", instructorId)

  if (error) throw error
  return data
}

async function fetchStudentQuizzes() {
  const enrolledStudents = await fetchEnrollments(instructorId);
  const studentIds = enrolledStudents.map((student) => student.student_id);
  const { data, error } = await supaClient.from("student_quiz").select("*")
  .in("student_id", studentIds);  
  if (error) throw error
  return data
}

async function fetchInstructorActivities(instructorId) {
  const { data, error } = await supaClient.from("activity").select("*").eq("instructor_id", instructorId)

  if (error) throw error
  return data
}

async function fetchCourseActivities() {
  const { data, error } = await supaClient.from("course_activity").select("*")

  if (error) throw error
  return data
}

async function fetchStudentActivities() {
  const enrolledStudents = await fetchEnrollments(instructorId);
  const studentIds = enrolledStudents.map((student) => student.student_id);
  const { data, error } = await supaClient.from("student_activity").select("*")
.in("student_id", studentIds);  
  if (error) throw error
  return data
}

async function fetchInstructorSessions(instructorId) {
  // Since sessions are linked to courses, we need to get the instructor's courses first
  const instructorCourses = await fetchInstructorCourses(instructorId)
  const courseIds = instructorCourses.map((course) => course.course_id)

  // Then get sessions for those courses
  const { data, error } = await supaClient.from("session").select("*").in("course_id", courseIds)

  if (error) throw error
  return data
}

// Populate course filter
function populateCourseFilter(courses) {
  const filter = document.getElementById("courseFilter")
  filter.innerHTML = '<option class="filter-label" value="all">All My Courses</option>'

  courses.forEach((course) => {
    const option = document.createElement("option")
    option.value = course.course_id
    option.textContent = course.course_name
    filter.appendChild(option)
  })
}

// Update summary cards
function updateSummaryCards(courses, students, enrollments, assignments, studentAssignments) {
  // Get course IDs taught by the instructor
  const instructorCourseIds = courses.map((course) => course.course_id)

  // Count unique students enrolled in instructor's courses
  const enrolledStudents = new Set()
  enrollments.forEach((enrollment) => {
    enrolledStudents.add(enrollment.student_id)
  })

  // Count active courses (courses with at least one enrolled student)
  const activeCourses = new Set()
  enrollments.forEach((enrollment) => {
    activeCourses.add(enrollment.course_id)
  })
  
const enrolledStudentIds = [...new Set(enrollments.map((e) => e.student_id))]

  // Count pending submissions (assignments without a submission path)
  let pendingCount = 0;
  
  assignments.forEach((assignment) => {
    const assignmentId = assignment.assign_id
    const totalSubmissions = studentAssignments.filter((sa) => sa.assign_id === assignmentId).length
    
    const completedSubmissions = studentAssignments.filter(
      (sa) => sa.assign_id === assignmentId && sa.assign_path,
    ).length
    pendingCount += totalSubmissions - completedSubmissions
  })
  // Calculate average response time (mock data - in a real app, this would come from message timestamps)
  const avgResponseTime = "8.5 hours"

  // Update the summary cards
  document.getElementById("totalStudents").textContent = enrolledStudents.size
  document.getElementById("activeCourses").textContent = activeCourses.size
  document.getElementById("pendingSubmissions").textContent = pendingCount
  document.getElementById("avgResponseTime").textContent = avgResponseTime
}

// 1. Course Performance Chart
function initCoursePerformanceChart(courses, enrollments, studentAssignments, studentQuizzes, assignments, quizzes) {
  try {
    // Calculate metrics for each course
    const courseMetrics = courses.map((course) => {
      const courseId = course.course_id

      // Calculate enrollment count
      const enrollmentCount = enrollments.filter((e) => e.course_id === courseId).length

      // Calculate assignment completion rate
      const courseAssignments = assignments.filter((a) => a.course_id === courseId)
      const courseAssignmentIds = courseAssignments.map((a) => a.assign_id)

      const courseAssignmentSubmissions = studentAssignments.filter((sa) => courseAssignmentIds.includes(sa.assign_id))

      const completedAssignments = courseAssignmentSubmissions.filter((sa) => sa.assign_path).length
      const assignmentCompletionRate =
        courseAssignmentSubmissions.length > 0 ? (completedAssignments / courseAssignmentSubmissions.length) * 100 : 0

      // Calculate average quiz score
      const courseQuizzes = quizzes.filter((q) => q.course_id === courseId)
      const courseQuizIds = courseQuizzes.map((q) => q.quiz_id)

      const courseQuizSubmissions = studentQuizzes.filter((sq) => courseQuizIds.includes(sq.quiz_id))

      const totalScore = courseQuizSubmissions.reduce((sum, sq) => sum + Number(sq.score), 0)
      const avgQuizScore = courseQuizSubmissions.length > 0 ? totalScore / courseQuizSubmissions.length : 0

      return {
        name: course.course_name,
        enrollmentCount,
        assignmentCompletionRate: Number.parseFloat(assignmentCompletionRate.toFixed(1)),
        avgQuizScore: Number.parseFloat(avgQuizScore.toFixed(1)),
      }
    })

    // Prepare data for chart
    const courseNames = courseMetrics.map((cm) => cm.name)
    const enrollmentData = courseMetrics.map((cm) => cm.enrollmentCount)
    const completionRateData = courseMetrics.map((cm) => cm.assignmentCompletionRate)
    const quizScoreData = courseMetrics.map((cm) => cm.avgQuizScore)

    // Create chart
    const ctx = document.getElementById("coursePerformanceChart").getContext("2d")
    charts.coursePerformance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: courseNames,
        datasets: [
          {
            label: "Enrollment Count",
            data: enrollmentData,
            backgroundColor: chartColors.dayColors[0],
            borderColor: chartColors.dayTextColors[0],
            borderWidth: 1,
            yAxisID: "y",
          },
          {
            label: "Assignment Completion Rate (%)",
            data: completionRateData,
            backgroundColor: chartColors.dayColors[1],
            borderColor: chartColors.dayTextColors[1],
            borderWidth: 1,
            yAxisID: "y1",
          },
          {
            label: "Avg. Quiz Score",
            data: quizScoreData,
            backgroundColor: chartColors.dayColors[2],
            borderColor: chartColors.dayTextColors[2],
            borderWidth: 1,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        ...commonChartOptions,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Enrollment Count",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
            position: "left",
          },
          y1: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Percentage (%)",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    })

    hideLoading("coursePerformanceChart")
  } catch (error) {
    console.error("Error initializing course performance chart:", error)
    showError("coursePerformanceChart", "Failed to load course performance data")
  }
}

// 2. Student Engagement Chart
function initStudentEngagementChart(courses, enrollments, studentActivities) {
  try {
    // Get course IDs taught by the instructor
    const instructorCourseIds = courses.map((course) => course.course_id)

    // Get students enrolled in instructor's courses
    const enrolledStudentIds = enrollments.map((e) => e.student_id)

    // Remove duplicates
    const uniqueStudentIds = [...new Set(enrolledStudentIds)]

    // Calculate engagement levels
    const engagementLevels = {
      High: 0,
      Medium: 0,
      Low: 0,
      Inactive: 0,
    }
    // Count activities per student
    uniqueStudentIds.forEach((studentId) => {
      const activities = studentActivities.filter((sa) => sa.student_id === studentId)
      console.log(activities.length);
      
      // Categorize engagement level
      if (activities.length >= 10) {
        engagementLevels["High"]++
      } else if (activities.length >= 5) {
        engagementLevels["Medium"]++
      } else if (activities.length >= 1) {
        engagementLevels["Low"]++
      } else {
        engagementLevels["Inactive"]++
      }
    })

    // Prepare data for chart
    const labels = Object.keys(engagementLevels)
    const data = Object.values(engagementLevels)

    // Create chart
    const ctx = document.getElementById("studentEngagementChart").getContext("2d")
    charts.studentEngagement = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              chartColors.dayColors[3], // High
              chartColors.dayColors[4], // Medium
              chartColors.dayColors[5], // Low
              chartColors.dayColors[6], // Inactive
            ],
            borderColor: [
              chartColors.dayTextColors[3],
              chartColors.dayTextColors[4],
              chartColors.dayTextColors[5],
              chartColors.dayTextColors[6],
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        ...commonChartOptions,
        plugins: {
          ...commonChartOptions.plugins,
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((context.raw / total) * 100).toFixed(1)
                return `${context.label}: ${context.raw} students (${percentage}%)`
              },
            },
          },
        },
      },
    })

    hideLoading("studentEngagementChart")
  } catch (error) {
    console.error("Error initializing student engagement chart:", error)
    showError("studentEngagementChart", "Failed to load student engagement data")
  }
}

// 3. Assignment Completion Chart
function initAssignmentCompletionChart(assignments, studentAssignments, courses) {
  try {
    // Calculate completion rates by assignment
    const assignmentData = assignments.map((assignment) => {
      const assignmentId = assignment.assign_id
      const courseId = assignment.course_id
      const course = courses.find((c) => c.course_id === courseId)
      
      // Get all submissions for this assignment
      const submissions = studentAssignments.filter((sa) => sa.assign_id === assignmentId);
      
      const completedSubmissions = submissions.filter((sa) => sa.assign_path).length
      const completionRate = submissions.length > 0 ? (completedSubmissions / submissions.length) * 100 : 0

      return {
        name: assignment.assign_title,
        course: course ? course.course_name : "Unknown Course",
        completionRate: Number.parseFloat(completionRate.toFixed(1)),
        dueDate: assignment.assign_dueDate,
      }
    })

    // Sort by due date (most recent first)
    assignmentData.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))

    // Take only the 5 most recent assignments
    const recentAssignments = assignmentData.slice(0, 5)

    // Prepare data for chart
    const assignmentNames = recentAssignments.map((a) => a.name)
    const completionRates = recentAssignments.map((a) => a.completionRate)
    const incompletionRates = recentAssignments.map((a) => 100 - a.completionRate)

    // Create chart
    const ctx = document.getElementById("assignmentCompletionChart").getContext("2d")
    charts.assignmentCompletion = new Chart(ctx, {
      type: "bar",
      data: {
        labels: assignmentNames,
        datasets: [
          {
            label: "Completed",
            data: completionRates,
            backgroundColor: chartColors.dayColors[3],
            borderColor: chartColors.dayTextColors[3],
            borderWidth: 1,
          },
          {
            label: "Incomplete",
            data: incompletionRates,
            backgroundColor: chartColors.dayColors[6],
            borderColor: chartColors.dayTextColors[6],
            borderWidth: 1,
          },
        ],
      },
      options: {
        ...commonChartOptions,
        indexAxis: "y",
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Completion Rate (%)",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
          y: {
            stacked: true,
          },
        },
      },
    })

    hideLoading("assignmentCompletionChart")
  } catch (error) {
    console.error("Error initializing assignment completion chart:", error)
    showError("assignmentCompletionChart", "Failed to load assignment completion data")
  }
}

// 4. Quiz Performance Chart
function initQuizPerformanceChart(quizzes, studentQuizzes, courses) {
  try {
    // Group quizzes by course
    const quizzesByCourse = {}

    courses.forEach((course) => {
      quizzesByCourse[course.course_id] = {
        name: course.course_name,
        quizzes: [],
      }
    })

    // Calculate average scores for each quiz
    quizzes.forEach((quiz) => {
      const quizId = quiz.quiz_id
      const courseId = quiz.course_id

      if (quizzesByCourse[courseId]) {
        // Get all submissions for this quiz
        const submissions = studentQuizzes.filter((sq) => sq.quiz_id === quizId)
        const totalScore = submissions.reduce((sum, sq) => sum + Number(sq.score), 0)
        const avgScore = submissions.length > 0 ? totalScore / submissions.length : 0

        quizzesByCourse[courseId].quizzes.push({
          name: quiz.quiz_title,
          avgScore: Number.parseFloat(avgScore.toFixed(1)),
        })
      }
    })

    // Prepare data for chart
    const datasets = []

    Object.values(quizzesByCourse).forEach((courseData, index) => {
      if (courseData.quizzes.length > 0) {
        datasets.push({
          label: courseData.name,
          data: courseData.quizzes.map((q) => q.avgScore),
          backgroundColor: chartColors.dayColors[index % chartColors.dayColors.length],
          borderColor: chartColors.dayTextColors[index % chartColors.dayTextColors.length],
          borderWidth: 1,
        })
      }
    })

    // Get all unique quiz names
    const allQuizNames = []
    Object.values(quizzesByCourse).forEach((courseData) => {
      courseData.quizzes.forEach((quiz) => {
        if (!allQuizNames.includes(quiz.name)) {
          allQuizNames.push(quiz.name)
        }
      })
    })

    // Create chart
    const ctx = document.getElementById("quizPerformanceChart").getContext("2d")
    charts.quizPerformance = new Chart(ctx, {
      type: "line",
      data: {
        labels: allQuizNames,
        datasets: datasets,
      },
      options: {
        ...commonChartOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Average Score",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
        },
      },
    })

    hideLoading("quizPerformanceChart")
  } catch (error) {
    console.error("Error initializing quiz performance chart:", error)
    showError("quizPerformanceChart", "Failed to load quiz performance data")
  }
}

// 5. Student Progress Chart
function initStudentProgressChart(courses, enrollments, studentAssignments, studentQuizzes, assignments, quizzes) {
  try {
    // Get course IDs taught by the instructor
    const instructorCourseIds = courses.map((course) => course.course_id)
    console.log(instructorCourseIds);
    
    // Get students enrolled in instructor's courses
    const enrolledStudentIds = [...new Set(enrollments.map((e) => e.student_id))]
    console.log(enrolledStudentIds);
    
    // Calculate progress categories
    const progressCategories = {
      "Excellent (90-100%)": 0,
      "Good (80-89%)": 0,
      "Average (70-79%)": 0,
      "Below Average (60-69%)": 0,
      "At Risk (<60%)": 0,
    }

    // Get instructor's assignments and quizzes
    const instructorAssignmentIds = assignments.map((a) => a.assign_id)
    const instructorQuizIds = quizzes.map((q) => q.quiz_id)

    // Calculate overall progress for each student
    enrolledStudentIds.forEach((studentId) => {
      // Calculate assignment completion
      const studentAssignmentSubmissions = studentAssignments.filter(
        (sa) => sa.student_id === studentId && instructorAssignmentIds.includes(sa.assign_id),
      )

      const completedAssignments = studentAssignmentSubmissions.filter((sa) => sa.assign_path).length
      const assignmentCompletionRate =
        studentAssignmentSubmissions.length > 0 ? (completedAssignments / studentAssignmentSubmissions.length) * 100 : 0

      // Calculate quiz performance
      const studentQuizSubmissions = studentQuizzes.filter(
        (sq) => sq.student_id === studentId && instructorQuizIds.includes(sq.quiz_id),
      )

      const totalScore = studentQuizSubmissions.reduce((sum, sq) => sum + Number(sq.score), 0)
      const avgQuizScore = studentQuizSubmissions.length > 0 ? totalScore / studentQuizSubmissions.length : 0

      // Calculate overall progress (50% assignments, 50% quizzes)
      const overallProgress = assignmentCompletionRate * 0.5 + avgQuizScore * 0.5

      // Categorize progress
      if (overallProgress >= 90) {
        progressCategories["Excellent (90-100%)"]++
      } else if (overallProgress >= 80) {
        progressCategories["Good (80-89%)"]++
      } else if (overallProgress >= 70) {
        progressCategories["Average (70-79%)"]++
      } else if (overallProgress >= 60) {
        progressCategories["Below Average (60-69%)"]++
      } else {
        progressCategories["At Risk (<60%)"]++
      }
    })

    // Prepare data for chart
    const labels = Object.keys(progressCategories)
    const data = Object.values(progressCategories)

    // Create chart
    const ctx = document.getElementById("studentProgressChart").getContext("2d")
    charts.studentProgress = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              chartColors.dayColors[3], // Excellent
              chartColors.dayColors[4], // Good
              chartColors.dayColors[2], // Average
              chartColors.dayColors[5], // Below Average
              chartColors.dayColors[6], // At Risk
            ],
            borderColor: [
              chartColors.dayTextColors[3],
              chartColors.dayTextColors[4],
              chartColors.dayTextColors[2],
              chartColors.dayTextColors[5],
              chartColors.dayTextColors[6],
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        ...commonChartOptions,
        plugins: {
          ...commonChartOptions.plugins,
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((context.raw / total) * 100).toFixed(1)
                return `${context.label}: ${context.raw} students (${percentage}%)`
              },
            },
          },
        },
      },
    })

    hideLoading("studentProgressChart")
  } catch (error) {
    console.error("Error initializing student progress chart:", error)
    showError("studentProgressChart", "Failed to load student progress data")
  }
}

// 6. Activity Participation Chart
function initActivityParticipationChart(activities, studentActivities, courses, courseActivities) {
  try {
    // Map activities to courses
    const activityToCourse = {}

    courseActivities.forEach((ca) => {
      activityToCourse[ca.activity_id] = ca.course_id
    })

    // Calculate participation for each activity
    const activityData = activities.map((activity) => {
      const activityId = activity.activity_id
      const courseId = activityToCourse[activityId]
      const course = courses.find((c) => c.course_id === courseId)

      // Get all participations for this activity
      const participations = studentActivities.filter((sa) => sa.activity_id === activityId)

      return {
        name: activity.activity_title,
        course: course ? course.course_name : "Unknown Course",
        participationCount: participations.length,
      }
    })

    // Sort by participation count (highest first)
    activityData.sort((a, b) => b.participationCount - a.participationCount)

    // Take only the top 5 activities
    const topActivities = activityData.slice(0, 5)

    // Prepare data for chart
    const activityNames = topActivities.map((a) => a.name)
    const participationCounts = topActivities.map((a) => a.participationCount)

    // Create chart
    const ctx = document.getElementById("activityParticipationChart").getContext("2d")
    charts.activityParticipation = new Chart(ctx, {
      type: "bar",
      data: {
        labels: activityNames,
        datasets: [
          {
            label: "Student Participation",
            data: participationCounts,
            backgroundColor: chartColors.dayColors[1],
            borderColor: chartColors.dayTextColors[1],
            borderWidth: 1,
          },
        ],
      },
      options: {
        ...commonChartOptions,
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Students",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
        },
      },
    })

    hideLoading("activityParticipationChart")
  } catch (error) {
    console.error("Error initializing activity participation chart:", error)
    showError("activityParticipationChart", "Failed to load activity participation data")
  }
}

// 7. Performance Trend Chart
function initPerformanceTrendChart(courses, studentAssignments, studentQuizzes, assignments, quizzes) {
  try {
    // Define time periods (last 6 months)
    const currentDate = new Date()
    const months = []

    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate)
      month.setMonth(currentDate.getMonth() - i)
      months.push(month)
    }

    // Format month labels
    const monthLabels = months.map((month) => {
      return month.toLocaleString("default", { month: "short", year: "numeric" })
    })

    // Get instructor's assignments and quizzes
    const instructorAssignmentIds = assignments.map((a) => a.assign_id)
    const instructorQuizIds = quizzes.map((q) => q.quiz_id)

    // Calculate metrics for each month
    const assignmentCompletionTrend = []
    const quizPerformanceTrend = []

    months.forEach((month) => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      // Since we don't have submission dates in the schema, we'll use mock data
      // In a real app, you would filter by submission date

      // For assignments, we'll use a random completion rate between 60-95%
      const assignmentCompletionRate = Math.floor(Math.random() * 35) + 60

      // For quizzes, we'll use a random average score between 65-90
      const avgQuizScore = Math.floor(Math.random() * 25) + 65

      assignmentCompletionTrend.push(assignmentCompletionRate)
      quizPerformanceTrend.push(avgQuizScore)
    })

    // Create chart
    const ctx = document.getElementById("performanceTrendChart").getContext("2d")
    charts.performanceTrend = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Assignment Completion Rate (%)",
            data: assignmentCompletionTrend,
            backgroundColor: "rgba(89, 85, 179, 0.2)",
            borderColor: chartColors.primary,
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
          {
            label: "Average Quiz Score",
            data: quizPerformanceTrend,
            backgroundColor: "rgba(224, 168, 85, 0.2)",
            borderColor: chartColors.dayTextColors[1],
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        ...commonChartOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "Performance (%)",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
            },
          },
        },
      },
    })

    hideLoading("performanceTrendChart")
  } catch (error) {
    console.error("Error initializing performance trend chart:", error)
    showError("performanceTrendChart", "Failed to load performance trend data")
  }
}

// 8. At-Risk Students Table
function initAtRiskStudentsTable(
  students,
  courses,
  enrollments,
  assignments,
  studentAssignments,
  quizzes,
  studentQuizzes,
  studentActivities,
) {
  try {
    // Get course IDs taught by the instructor
    const instructorCourseIds = courses.map((course) => course.course_id);
    // Get students enrolled in instructor's courses
    const enrolledStudents = []

    // Create a map to avoid duplicates
    const processedStudents = new Map()

    enrollments.forEach((enrollment) => {
      const studentId = enrollment.student_id
      const courseId = enrollment.course_id

      // Only process each student-course pair once
      const key = `${studentId}-${courseId}`
      if (!processedStudents.has(key)) {
        processedStudents.set(key, true)

        const student = students.find((s) => s.student_id === studentId)
        const course = courses.find((c) => c.course_id === courseId)

        if (student && course) {
          enrolledStudents.push({
            studentId: studentId,
            courseId: courseId,
            studentName: student.student_name,
            courseName: course.course_name,
          })
        }
      }
    })

    // Calculate risk factors for each student
    const atRiskStudents = []

    enrolledStudents.forEach((enrollment) => {
      const studentId = enrollment.studentId
      const courseId = enrollment.courseId
      
      // Count missing assignments
      const courseAssignments = assignments.filter((a) => a.course_id === courseId)
      const studentAssignmentSubmissions = studentAssignments.filter(
        (sa) => sa.student_id === studentId && courseAssignments.some((a) => a.assign_id === sa.assign_id),
      )
      // const missingAssignments =
      //   courseAssignments.length - studentAssignmentSubmissions.filter((sa) => sa.assign_path).length
      const missingAssignments =
        courseAssignments.length - studentAssignmentSubmissions.length
      
      // Calculate average quiz score
      const courseQuizzes = quizzes.filter((q) => q.course_id === courseId)
      const studentQuizSubmissions = studentQuizzes.filter(
        (sq) => sq.student_id === studentId && courseQuizzes.some((q) => q.quiz_id === sq.quiz_id),
      )

      const totalScore = studentQuizSubmissions.reduce((sum, sq) => sum + Number(sq.score), 0)
      const avgQuizScore = studentQuizSubmissions.length > 0 ? totalScore / studentQuizSubmissions.length : 0

      // Get last activity date (mock data since we don't have participation_date in the schema)
      const lastActivityDate = new Date()
      lastActivityDate.setDate(lastActivityDate.getDate() - Math.floor(Math.random() * 30))

      // Determine if student is at risk
      const isAtRisk = missingAssignments > 2 || avgQuizScore < 60

      if (isAtRisk) {
        atRiskStudents.push({
          studentName: enrollment.studentName,
          courseName: enrollment.courseName,
          missingAssignments,
          avgQuizScore: Number.parseFloat(avgQuizScore.toFixed(1)),
          lastActivity: lastActivityDate.toLocaleDateString(),
          studentId,
          courseId,
        })
      }
    })

    // Sort by risk level (most at risk first)
    atRiskStudents.sort((a, b) => {
      // More missing assignments = higher risk
      if (a.missingAssignments !== b.missingAssignments) {
        return b.missingAssignments - a.missingAssignments
      }

      // Lower quiz score = higher risk
      return a.avgQuizScore - b.avgQuizScore
    })

    // Populate table
    const tableBody = document.getElementById("atRiskStudentsBody")
    tableBody.innerHTML = ""

    if (atRiskStudents.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = `<td colspan="6" class="loading-text">No at-risk students found</td>`
      tableBody.appendChild(row)
    } else {
      atRiskStudents.forEach((student) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${student.studentName}</td>
          <td>${student.courseName}</td>
          <td>${student.missingAssignments}</td>
          <td>${student.avgQuizScore}%</td>
          <td>${student.lastActivity}</td>
          <td>
            <button class="action-btn" data-student-id="${student.studentId}" data-course-id="${student.courseId}">
              Contact
            </button>
          </td>
        `
        tableBody.appendChild(row)
      })

      // Add event listeners to contact buttons
      document.querySelectorAll(".action-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const studentId = this.getAttribute("data-student-id")
          const courseId = this.getAttribute("data-course-id")
          alert(`Contact functionality for student ID ${studentId} in course ID ${courseId} would be implemented here.`)
        })
      })
    }

    // FIXED: Use the correct element ID to hide the loading spinner
    hideLoading("atRiskStudents")
  } catch (error) {
    console.error("Error initializing at-risk students table:", error)
    showError("atRiskStudents", "Failed to load at-risk students data")
  }
}
// // Apply filters
// function applyFilters() {
//   const courseId = document.getElementById("courseFilter").value
//   const timeRange = document.getElementById("timeRangeFilter").value

//   // Re-initialize charts with filters
//   // This would filter the data based on the selected course and time range
//   // For now, we'll just refresh all charts
//   refreshCharts()
// }
// Apply filters
// function applyFilters() {
//   const courseId = document.getElementById("courseFilter").value;
//   const timeRange = document.getElementById("timeRangeFilter").value;
  
//   // Show loading indicators for all charts during filtering
//   showLoading("coursePerformanceChart");
//   showLoading("studentEngagementChart");
//   showLoading("assignmentCompletionChart");
//   showLoading("quizPerformanceChart");
//   showLoading("studentProgressChart");
//   showLoading("activityParticipationChart");
//   showLoading("performanceTrendChart");
//   showLoading("atRiskStudents");
  
//   // Fetch all necessary data again, but we'll filter it before updating charts
//   Promise.all([
//     fetchInstructorData(instructorId),
//     fetchInstructorCourses(instructorId),
//     fetchStudents(),
//     fetchEnrollments(instructorId),
//     fetchInstructorAssignments(instructorId),
//     fetchStudentAssignments(),
//     fetchInstructorQuizzes(instructorId),
//     fetchStudentQuizzes(),
//     fetchInstructorActivities(instructorId),
//     fetchCourseActivities(),
//     fetchStudentActivities(),
//     fetchInstructorSessions(instructorId),
//   ]).then(([
//     instructorData,
//     instructorCourses,
//     studentsData,
//     enrollmentData,
//     assignmentsData,
//     studentAssignmentData,
//     quizzesData,
//     studentQuizData,
//     activitiesData,
//     courseActivityData,
//     studentActivityData,
//     sessionsData,
//   ]) => {
//     // Filter data based on selected course if not "all"
//     let filteredCourses = instructorCourses;
//     let filteredEnrollments = enrollmentData;
//     let filteredAssignments = assignmentsData;
//     let filteredQuizzes = quizzesData;
//     let filteredActivities = activitiesData;
//     let filteredCourseActivities = courseActivityData;
    
//     if (courseId !== "all") {
//       // Filter courses to only include the selected course
//       filteredCourses = instructorCourses.filter(course => course.course_id.toString() === courseId);
      
//       // Filter enrollments for the selected course
//       filteredEnrollments = enrollmentData.filter(enrollment => enrollment.course_id.toString() === courseId);
      
//       // Filter assignments for the selected course
//       filteredAssignments = assignmentsData.filter(assignment => assignment.course_id.toString() === courseId);
      
//       // Filter quizzes for the selected course
//       filteredQuizzes = quizzesData.filter(quiz => quiz.course_id.toString() === courseId);
      
//       // Filter activities based on course relationships
//       const courseActivityIds = courseActivityData
//         .filter(ca => ca.course_id.toString() === courseId)
//         .map(ca => ca.activity_id);
      
//       filteredActivities = activitiesData.filter(activity => 
//         courseActivityIds.includes(activity.activity_id)
//       );
      
//       filteredCourseActivities = courseActivityData.filter(ca => 
//         ca.course_id.toString() === courseId
//       );
//     }
    
//     // Filter data based on time range (if implemented)
//     // For now we'll just use the course filter
//     // In a real implementation, you would filter by date fields
    
//     // Update summary cards with filtered data
//     updateSummaryCards(
//       filteredCourses, 
//       studentsData, 
//       filteredEnrollments, 
//       filteredAssignments, 
//       studentAssignmentData
//     );
    
//     // Update each chart with filtered data
//     initCoursePerformanceChart(
//       filteredCourses,
//       filteredEnrollments,
//       studentAssignmentData,
//       studentQuizData,
//       filteredAssignments,
//       filteredQuizzes
//     );
    
//     initStudentEngagementChart(
//       filteredCourses, 
//       filteredEnrollments, 
//       studentActivityData
//     );
    
//     initAssignmentCompletionChart(
//       filteredAssignments, 
//       studentAssignmentData, 
//       filteredCourses
//     );
    
//     initQuizPerformanceChart(
//       filteredQuizzes, 
//       studentQuizData, 
//       filteredCourses
//     );
    
//     initStudentProgressChart(
//       filteredCourses,
//       filteredEnrollments,
//       studentAssignmentData,
//       studentQuizData,
//       filteredAssignments,
//       filteredQuizzes
//     );
    
//     initActivityParticipationChart(
//       filteredActivities, 
//       studentActivityData, 
//       filteredCourses, 
//       filteredCourseActivities
//     );
    
//     initPerformanceTrendChart(
//       filteredCourses, 
//       studentAssignmentData, 
//       studentQuizData, 
//       filteredAssignments, 
//       filteredQuizzes
//     );
    
//     // Initialize at-risk students table with filtered data
//     initAtRiskStudentsTable(
//       studentsData,
//       filteredCourses,
//       filteredEnrollments,
//       filteredAssignments,
//       studentAssignmentData,
//       filteredQuizzes,
//       studentQuizData,
//       studentActivityData
//     );
//   }).catch(error => {
//     console.error("Error applying filters:", error);
//     // Show error message
//     document.querySelectorAll(".chart-container").forEach(container => {
//       showError(container.querySelector("canvas").id, "Failed to apply filters");
//     });
//   });
// }
function applyFilters() {
  const courseId = document.getElementById("courseFilter").value;
  const timeRange = document.getElementById("timeRangeFilter").value;
  
  // Show loading indicators for all charts during filtering
  showLoading("coursePerformanceChart");
  showLoading("studentEngagementChart");
  showLoading("assignmentCompletionChart");
  showLoading("quizPerformanceChart");
  showLoading("studentProgressChart");
  showLoading("activityParticipationChart");
  showLoading("performanceTrendChart");
  showLoading("atRiskStudents");
  
  // Clear existing charts before creating new ones
  Object.keys(charts).forEach((chartKey) => {
    if (charts[chartKey]) {
      charts[chartKey].destroy();
      charts[chartKey] = null;
    }
  });
  
  // Fetch all necessary data again, but we'll filter it before updating charts
  Promise.all([
    fetchInstructorData(instructorId),
    fetchInstructorCourses(instructorId),
    fetchStudents(),
    fetchEnrollments(instructorId),
    fetchInstructorAssignments(instructorId),
    fetchStudentAssignments(),
    fetchInstructorQuizzes(instructorId),
    fetchStudentQuizzes(),
    fetchInstructorActivities(instructorId),
    fetchCourseActivities(),
    fetchStudentActivities(),
    fetchInstructorSessions(instructorId),
  ]).then(([
    instructorData,
    instructorCourses,
    studentsData,
    enrollmentData,
    assignmentsData,
    studentAssignmentData,
    quizzesData,
    studentQuizData,
    activitiesData,
    courseActivityData,
    studentActivityData,
    sessionsData,
  ]) => {
    // Filter data based on selected course if not "all"
    let filteredCourses = instructorCourses;
    let filteredEnrollments = enrollmentData;
    let filteredAssignments = assignmentsData;
    let filteredQuizzes = quizzesData;
    let filteredActivities = activitiesData;
    let filteredCourseActivities = courseActivityData;
    
    if (courseId !== "all") {
      // Filter courses to only include the selected course
      filteredCourses = instructorCourses.filter(course => course.course_id.toString() === courseId);
      
      // Filter enrollments for the selected course
      filteredEnrollments = enrollmentData.filter(enrollment => enrollment.course_id.toString() === courseId);
      
      // Filter assignments for the selected course
      filteredAssignments = assignmentsData.filter(assignment => assignment.course_id.toString() === courseId);
      
      // Filter quizzes for the selected course
      filteredQuizzes = quizzesData.filter(quiz => quiz.course_id.toString() === courseId);
      
      // Filter activities based on course relationships
      const courseActivityIds = courseActivityData
        .filter(ca => ca.course_id.toString() === courseId)
        .map(ca => ca.activity_id);
      
      filteredActivities = activitiesData.filter(activity => 
        courseActivityIds.includes(activity.activity_id)
      );
      
      filteredCourseActivities = courseActivityData.filter(ca => 
        ca.course_id.toString() === courseId
      );
    }
    
    // Update summary cards with filtered data
    updateSummaryCards(
      filteredCourses, 
      studentsData, 
      filteredEnrollments, 
      filteredAssignments, 
      studentAssignmentData
    );
    
    // Update each chart with filtered data
    initCoursePerformanceChart(
      filteredCourses,
      filteredEnrollments,
      studentAssignmentData,
      studentQuizData,
      filteredAssignments,
      filteredQuizzes
    );
    
    initStudentEngagementChart(
      filteredCourses, 
      filteredEnrollments, 
      studentActivityData
    );
    
    initAssignmentCompletionChart(
      filteredAssignments, 
      studentAssignmentData, 
      filteredCourses
    );
    
    initQuizPerformanceChart(
      filteredQuizzes, 
      studentQuizData, 
      filteredCourses
    );
    
    initStudentProgressChart(
      filteredCourses,
      filteredEnrollments,
      studentAssignmentData,
      studentQuizData,
      filteredAssignments,
      filteredQuizzes
    );
    
    initActivityParticipationChart(
      filteredActivities, 
      studentActivityData, 
      filteredCourses, 
      filteredCourseActivities
    );
    
    initPerformanceTrendChart(
      filteredCourses, 
      studentAssignmentData, 
      studentQuizData, 
      filteredAssignments, 
      filteredQuizzes
    );
    
    // Initialize at-risk students table with filtered data
    initAtRiskStudentsTable(
      studentsData,
      filteredCourses,
      filteredEnrollments,
      filteredAssignments,
      studentAssignmentData,
      filteredQuizzes,
      studentQuizData,
      studentActivityData
    );
    
    // Update the page title based on filtered data
    updatePageTitle();
    
  }).catch(error => {
    console.error("Error applying filters:", error);
    // Show error message
    document.querySelectorAll(".chart-container").forEach(container => {
      const canvasId = container.querySelector("canvas")?.id;
      if (canvasId) {
        showError(canvasId, "Failed to apply filters");
      }
    });
  });
}

// // Refresh all charts
// function refreshCharts() {
//   // Clear existing charts
//   Object.values(charts).forEach((chart) => {
//     if (chart) {
//       chart.destroy()
//     }
//   })

//   // Re-initialize all charts
//   initializeReports()
// }
// Refresh all charts (simplified version that just calls applyFilters)
function refreshCharts() {
  // Clear existing charts
  // Object.values(charts).forEach((chart) => {
  //   if (chart) {
  //     chart.destroy();
  //   }
  // });
  
  // Apply filters which will recreate charts with filtered data
  applyFilters();
}
// Set up event listeners
// document.addEventListener("DOMContentLoaded", () => {
//   // Initialize reports
//   initializeReports()

//   // Set up filter event listeners
//   document.getElementById("courseFilter").addEventListener("change", applyFilters)
//   document.getElementById("timeRangeFilter").addEventListener("change", applyFilters)
//   document.getElementById("refreshBtn").addEventListener("click", refreshCharts)
// })
document.addEventListener("DOMContentLoaded", () => {
  // Initialize reports
  initializeReports();

  // Set up filter event listeners with debounce
  let filterTimeout;
  
  document.getElementById("courseFilter").addEventListener("change", function() {
    clearTimeout(filterTimeout);
    
    // Update UI to show selected course
    const selectedOption = this.options[this.selectedIndex];
    console.log(selectedOption);
    
    // document.querySelector(".filter-label").textContent = selectedOption.textContent;
    // console.log(document.querySelector(".filter-label"));
    
    // Apply filters with a slight delay to prevent multiple rapid executions
    filterTimeout = setTimeout(applyFilters, 100);
  });
  
  document.getElementById("timeRangeFilter").addEventListener("change", function() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(applyFilters, 100);
  });
  
  document.getElementById("refreshBtn").addEventListener("click", refreshCharts);
  
  // Add click event listener to close dropdown when clicking outside
  document.addEventListener("click", function(event) {
    const dropdown = document.querySelector(".dropdown-content");
    const filterButton = document.querySelector(".filter-dropdown");
    
    if (dropdown && dropdown.classList.contains("show") && 
        !event.target.matches('.filter-dropdown') && 
        !filterButton.contains(event.target)) {
      dropdown.classList.remove("show");
    }
  });
  
  // Toggle dropdown display
  const filterDropdowns = document.querySelectorAll(".filter-dropdown");
  filterDropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", function() {
      const dropdownContent = this.querySelector(".dropdown-content");
      if (dropdownContent) {
        dropdownContent.classList.toggle("show");
      }
    });
  });
});
// Helper function to get the currently selected course name
function getSelectedCourseName() {
  const courseFilter = document.getElementById("courseFilter");
  return courseFilter.options[courseFilter.selectedIndex].textContent;
}

// Update the page title based on selected filters
function updatePageTitle() {
  const courseName = getSelectedCourseName();
  const timeRange = document.getElementById("timeRangeFilter").value;
  
  let title = "Instructor Analytics";
  if (courseName !== "All My Courses") {
    title += ` - ${courseName}`;
  }
  document.getElementById("dashboardTitle").textContent = title;
}
if(isInstitutionSchool()){
  document.querySelectorAll(".card-title").forEach((title) => {
    console.log(title.textContent);
    title.textContent = title.textContent.replace("Assignment", "Homework");
    title.textContent = title.textContent.replace("Project", "Activity");
  })
  document.querySelectorAll(".key-change").forEach((title) => {
    title.textContent = title.textContent.replace("Assignment", "Homework");

  })
}