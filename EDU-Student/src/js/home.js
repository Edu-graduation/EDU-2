import { supaClient } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const institutionId = JSON.parse(sessionStorage.getItem("institutionId"));

// async function getStudentInstitutionId() {
//     const { data, error } = await supaClient
//         .from("student")
//         .select("institution_id")
//         .eq("student_id", studentId);
//     if (error) {
//         console.error("Error fetching student data:", error);
//         return null;
//     }
//     const institutionId = data[0].institution_id;
//     sessionStorage.setItem("institutionId", JSON.stringify(institutionId));
//     console.log(institutionId);
//     return institutionId;
// }
// getStudentInstitutionId();

// async function getInstitutionInstructors() {
//     const { data, error } = await supaClient
//         .from("instructor_institution")
//         .select("*")
//         .eq("institution_id", institutionId);
//     if (error) {
//         console.error("Error fetching institution data:", error);
//         return null;
//     }
//     console.log(data);

//     return data;
// }
// async function getInstructorCourses() {
//     const instructorsInstId = await getInstitutionInstructors();
//     const instructorsId = instructorsInstId.map((instructorInstId) => instructorInstId.instructor_id);
//     console.log(instructorsId);
//     const { data, error } = await supaClient
//         .from("enrollment")
//         .select("*")
//         .in("instructor_id", instructorsId)
//         .eq('student_id', studentId);
//     if (error) {
//         console.error("Error fetching institution data:", error);
//         return null;
//     }
//     console.log(data);
//     return data;
// }
// getInstructorCourses();
// async function getStudentCourses() {
//     const { data, error } = await supaClient
//         .from("enrollment")
//         .select("*")
//         .eq("student_id", studentId);
//     const studentCoursesId = data.map((enrollment) => enrollment.course_id);
//     console.log(studentCoursesId);
//     if (error) {
//         console.error("Error fetching institution data:", error);
//         return null;
//     }
//     console.log(data);
//     return data;
// }
// getStudentCourses();
