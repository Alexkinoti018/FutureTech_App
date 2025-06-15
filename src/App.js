import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInAnonymously, signInWithCustomToken, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, writeBatch, query, where, getDocs } from 'firebase/firestore';

// --- Helper to get App ID ---
const getAppId = () => {
    // eslint-disable-next-line no-undef
    return typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
};

// --- Firebase Configuration ---
// eslint-disable-next-line no-undef
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyBis-TtCtrYPsOgaGWSyRw2u7DRFllM16I",
  authDomain: "futuretech-academy-e8ae7.firebaseapp.com",
  projectId: "futuretech-academy-e8ae7",
  storageBucket: "futuretech-academy-e8ae7.firebasestorage.app",
  messagingSenderId: "376698518804",
  appId: "1:376698518804:web:5770a7f75b440498aad601",
  measurementId: "G-MCLN6YHNHN"
};

// --- Initial Data ---
const INSTRUCTOR_ID = 'instructor01'; // Static instructor ID for this prototype

const COURSES_DATA = [
    { id: 'C101', title: 'Computer Basics', duration: '4 weeks', price: 4000, description: 'Introduction to computers, internet browsing, email etiquette, and online safety.', modules: ['Intro to Hardware', 'Using an OS', 'Internet & Email', 'Online Safety'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Intro_slides.ppt', url: '#'}] },
    { id: 'C102', title: 'Microsoft Office Suite', duration: '6 weeks', price: 6000, description: 'In-depth training on Word, Excel, and PowerPoint for productivity.', modules: ['MS Word Basics', 'Advanced Word', 'Excel Formulas', 'PowerPoint Design'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Excel_Templates.xlsx', url: '#'}] },
    { id: 'C103', title: 'Introduction to Digital Marketing', duration: '8 weeks', price: 8000, description: 'Fundamentals of social media marketing, SEO, and content creation.', modules: ['Marketing Fundamentals', 'Intro to SEO', 'Content Strategy', 'Social Media for Business'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Marketing_Plan.docx', url: '#'}] },
];

// --- Instructor Data based on CV ---
const INSTRUCTOR_DATA = {
    name: "Alexander Kinoti",
    uid: INSTRUCTOR_ID,
    email: 'instructor@academy.com', // This email is for the login system prototype
    role: 'instructor',
    bio: "With a Bachelor's degree in Technology Education (Computer Science) and experience as an ICT Lecturer, Alexander brings a wealth of knowledge in web development, networking, and digital marketing. He is passionate about empowering students with practical, real-world tech skills.",
    avatar: "https://placehold.co/100x100/EBF4FF/3B82F6?text=AK" // Placeholder avatar
};


// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Icons ---
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

// --- Helper function to pre-populate data ---
const setupInitialData = async () => {
    const appId = getAppId();
    const batch = writeBatch(db);

    // Add courses
    COURSES_DATA.forEach(course => {
        const courseRef = doc(db, `/artifacts/${appId}/public/data/courses`, course.id);
        batch.set(courseRef, course);
    });

    // Add instructor user
    const instructorRef = doc(db, `/artifacts/${appId}/users/${INSTRUCTOR_ID}/profile`, 'data');
    batch.set(instructorRef, INSTRUCTOR_DATA);
    
    try {
        await batch.commit();
        console.log("Initial data (courses and instructor) successfully added to Firestore.");
    } catch (error) {
        console.error("Error setting up initial data: ", error);
    }
};

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [activeCourseId, setActiveCourseId] = useState(null);

    useEffect(() => {
        const authAndUserSetup = async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const appId = getAppId();
                const userRef = doc(db, `/artifacts/${appId}/users/${firebaseUser.uid}/profile`, 'data');

                // Run one-time data setup after user is confirmed
                const setupFlagRef = doc(db, `/artifacts/${appId}/public/data/system`, 'setupComplete');
                try {
                    const setupSnap = await getDoc(setupFlagRef);
                    if (!setupSnap.exists()) {
                        console.log("First time setup detected. Populating initial data...");
                        await setupInitialData();
                        await setDoc(setupFlagRef, { initialized: true });
                    }
                } catch (e) {
                    console.error("Error checking/performing initial setup:", e);
                }

                if (firebaseUser.isAnonymous) {
                    setUserData({ uid: firebaseUser.uid, role: 'guest', enrolledCourses: [] });
                    setLoading(false);
                    return;
                }

                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                } else {
                    console.warn(`Authenticated user ${firebaseUser.uid} missing profile. Creating one.`);
                    const newUserProfile = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        role: 'student',
                        enrolledCourses: [],
                        progress: {}
                    };
                    await setDoc(userRef, newUserProfile);
                    setUserData(newUserProfile);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        };

        const initialAuth = async () => {
            try {
                await setPersistence(auth, inMemoryPersistence);
                // eslint-disable-next-line no-undef
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    // eslint-disable-next-line no-undef
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Auth failed, falling back to anonymous", error);
                await signInAnonymously(auth);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, authAndUserSetup);
        initialAuth();

        return () => unsubscribe();
    }, []);

    const navigate = (pageName, courseId = null) => {
        setPage(pageName);
        setActiveCourseId(courseId);
    };

    const renderContent = () => {
        if (userData?.role === 'instructor') {
            return <InstructorDashboard instructorData={userData} navigate={navigate} />;
        }
        
        // Student/Guest view
        switch(page) {
            case 'home': return <CourseCatalog navigate={navigate} />;
            case 'login': return <AuthPage setPage={setPage} />;
            case 'dashboard': return user && <StudentDashboard userData={userData} navigate={navigate} />;
            case 'course': return activeCourseId && <CourseDetailPage courseId={activeCourseId} userData={userData} setUserData={setUserData} navigate={navigate} />;
            case 'learn': return activeCourseId && <LearningPage courseId={activeCourseId} userData={userData} setUserData={setUserData} />;
            default: return <CourseCatalog navigate={navigate} />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><div className="text-xl font-semibold text-gray-700">Loading Academy...</div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Header user={user} userData={userData} navigate={navigate} />
            <main className="p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
}

// --- Components ---

function Header({ user, userData, navigate }) {
    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('home');
        });
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(userData?.role === 'instructor' ? 'dashboard' : 'home')}>
                    <BookIcon />
                    <span className="text-xl font-bold text-blue-600">FutureTech Academy</span>
                </div>
                <div className="flex items-center space-x-4">
                    {user && !user.isAnonymous ? (
                        <>
                            <span className="font-semibold text-gray-600 hidden sm:block">{userData?.email}</span>
                            <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 font-medium">
                                <LogoutIcon />
                                <span className="ml-1 hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                            Login / Register
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}

function AuthPage({ setPage }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                setPage('dashboard');
            } else {
                // Registration
                if (role === 'instructor') {
                    setError("Instructor registration is not available. Please contact admin.");
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const appId = getAppId();
                const userRef = doc(db, `/artifacts/${appId}/users/${userCredential.user.uid}/profile`, 'data');
                const newUserProfile = {
                    uid: userCredential.user.uid,
                    email: email,
                    role: 'student',
                    enrolledCourses: [],
                    progress: {}
                };
                await setDoc(userRef, newUserProfile);
                setPage('dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? 'Login' : 'Create an Account'}</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    {!isLogin && (
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">I am a...</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                                <option value="student">Student</option>
                                <option value="instructor" disabled>Instructor (disabled)</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                <p className="text-center mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-semibold">
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}

function CourseCatalog({ navigate }) {
    return (
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Courses</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Empowering Meru with essential digital skills for today's world.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {COURSES_DATA.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                        <div className="p-6 flex-grow">
                            <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                            <p className="mt-2 text-gray-600">{course.description}</p>
                        </div>
                        <div className="p-6 bg-gray-50 border-t">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold text-blue-600">KES {course.price.toLocaleString()}</span>
                                <span className="text-sm font-medium text-gray-500">{course.duration}</span>
                            </div>
                            <button onClick={() => navigate('course', course.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                                View Details & Enroll
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InstructorProfile({ instructor }) {
    if (!instructor) return null;
    return (
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Meet Your Instructor</h3>
            <div className="flex items-center space-x-4">
                <img src={instructor.avatar} alt={instructor.name} className="w-20 h-20 rounded-full flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-xl text-gray-900">{instructor.name}</h4>
                    <p className="text-gray-600">{instructor.bio}</p>
                </div>
            </div>
        </div>
    );
}

function CourseDetailPage({ courseId, userData, setUserData, navigate }) {
    const course = COURSES_DATA.find(c => c.id === courseId);
    const isEnrolled = userData?.enrolledCourses?.includes(courseId);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const instructor = course?.instructorId === INSTRUCTOR_DATA.uid ? INSTRUCTOR_DATA : null;

    const handleEnroll = () => {
        if (!auth.currentUser || auth.currentUser.isAnonymous) {
            alert("Please log in or register to enroll.");
            navigate('login');
        } else {
            setShowPaymentModal(true);
        }
    };
    
    const completeEnrollment = async () => {
        const appId = getAppId();
        const userRef = doc(db, `/artifacts/${appId}/users/${auth.currentUser.uid}/profile`, 'data');
        try {
            await updateDoc(userRef, { enrolledCourses: arrayUnion(courseId) });
            setUserData(prev => ({...prev, enrolledCourses: [...(prev.enrolledCourses || []), courseId]}));
        } catch (error) {
            console.error("Enrollment failed: ", error);
        }
    };

    if (!course) return <div className="text-center">Course not found.</div>;

    return (
         <div className="container mx-auto">
            <button onClick={() => navigate('home')} className="flex items-center text-blue-600 font-semibold mb-6 hover:underline">
                <ArrowLeftIcon /><span className="ml-2">Back to Courses</span>
            </button>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{course.title}</h1>
                 <p className="mt-4 text-lg text-gray-600">{course.description}</p>
                 <div className="mt-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4">What You'll Learn</h3>
                        <ul className="space-y-3">
                            {course.modules.map((mod, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white font-bold bg-blue-500">✓</span>
                                    <span className="text-gray-700">{mod}</span>
                                </li>
                            ))}
                        </ul>
                        <InstructorProfile instructor={instructor} />
                    </div>
                     <div className="md:col-span-1">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 sticky top-24">
                            <div className="text-4xl font-bold text-center text-blue-700 mb-4">KES {course.price.toLocaleString()}</div>
                            {isEnrolled ? (
                                 <button onClick={() => navigate('learn', course.id)} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 text-lg">Go to Classroom</button>
                            ) : (
                                <button onClick={handleEnroll} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 text-lg">Enroll Now</button>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
            {showPaymentModal && <PaymentModal course={course} onPaymentSuccess={completeEnrollment} setShow={setShowPaymentModal} />}
        </div>
    );
}

function StudentDashboard({ userData, navigate }) {
    if (!userData) return null;
    const enrolledCourses = COURSES_DATA.filter(course => userData.enrolledCourses?.includes(course.id));

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-2">My Learning</h1>
            <p className="text-gray-600 mb-8">Welcome back! Continue your learning journey.</p>
            {enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                                <p className="mt-2 text-gray-500">You are enrolled.</p>
                            </div>
                            <button onClick={() => navigate('learn', course.id)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                                Open Course
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
                    <h2 className="text-2xl font-semibold text-gray-700">No courses yet.</h2>
                    <button onClick={() => navigate('home')} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        Explore Courses
                    </button>
                </div>
            )}
        </div>
    );
}


function InstructorDashboard({ instructorData, navigate }) {
    const assignedCourses = COURSES_DATA.filter(c => c.instructorId === instructorData.uid);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            const appId = getAppId();
            const studentList = [];
            try {
                const usersCollectionRef = collection(db, `/artifacts/${appId}/users`);
                const usersSnapshot = await getDocs(usersCollectionRef);

                const studentProfilePromises = usersSnapshot.docs.map(userDoc => {
                    const profileRef = doc(db, `/artifacts/${appId}/users/${userDoc.id}/profile`, 'data');
                    return getDoc(profileRef);
                });
                
                const studentProfileSnapshots = await Promise.all(studentProfilePromises);

                studentProfileSnapshots.forEach(profileSnap => {
                    if (profileSnap.exists()) {
                        const profileData = profileSnap.data();
                        if (profileData.role === 'student') {
                            studentList.push(profileData);
                        }
                    }
                });
                setStudents(studentList);
            } catch (e) {
                console.error("Error fetching students: ", e);
            }
            setLoading(false);
        };
        fetchStudents();
    }, []);

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome, {instructorData.name}. Manage your courses and students.</p>
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center"><BookIcon className="mr-2"/> My Courses</h2>
                    <div className="space-y-4">
                        {assignedCourses.map(course => (
                            <div key={course.id} className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-bold text-lg">{course.title}</h3>
                                <p className="text-sm text-gray-600">{course.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center"><UsersIcon className="mr-2" />Enrolled Students</h2>
                    <div className="bg-white p-4 rounded-lg shadow min-h-[200px]">
                        {loading ? <p>Loading students...</p> : (
                            <ul className="divide-y divide-gray-200">
                                {students.filter(s => s.enrolledCourses && s.enrolledCourses.length > 0).map(student => (
                                    <li key={student.uid} className="py-2">
                                        <p className="font-medium">{student.email}</p>
                                        <p className="text-sm text-gray-500">Enrolled in: {student.enrolledCourses.map(cId => COURSES_DATA.find(c=>c.id === cId)?.title || cId).join(', ')}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {students.filter(s => s.enrolledCourses && s.enrolledCourses.length > 0).length === 0 && !loading && <p>No students have enrolled yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LearningPage({ courseId, userData, setUserData }) {
    const course = COURSES_DATA.find(c => c.id === courseId);
    const [progress, setProgress] = useState(userData?.progress?.[courseId] || []);

    const toggleModuleCompletion = async (moduleId) => {
        const newProgress = progress.includes(moduleId)
            ? progress.filter(id => id !== moduleId)
            : [...progress, moduleId];
        
        setProgress(newProgress);

        const appId = getAppId();
        const userRef = doc(db, `/artifacts/${appId}/users/${auth.currentUser.uid}/profile`, 'data');
        try {
            await updateDoc(userRef, {
                [`progress.${courseId}`]: newProgress
            });
            setUserData(prev => ({...prev, progress: {...prev.progress, [courseId]: newProgress}}));
        } catch (error) {
            console.error("Failed to update progress: ", error);
        }
    };
    
    if(!course) return <div className="text-center">Course not found.</div>;
    const completionPercentage = course.modules.length > 0 ? Math.round((progress.length / course.modules.length) * 100) : 0;

    return(
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-8">Classroom</p>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Your Progress</span>
                    <span className="font-bold text-blue-600">{completionPercentage}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white mb-4">
                       <VideoIcon className="w-16 h-16 opacity-50"/>
                       <p className="absolute">Main Video Content Area</p>
                    </div>
                    <h2 className="text-2xl font-bold">Modules</h2>
                     <ul className="space-y-3 mt-4">
                        {course.modules.map((mod, index) => {
                            const isCompleted = progress.includes(mod);
                            return (
                                <li key={index} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                                    <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => toggleModuleCompletion(mod)}
                                        className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className={`ml-4 text-lg ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{mod}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow">
                         <h3 className="text-xl font-bold mb-4 flex items-center"><FileTextIcon className="mr-2"/>Resources</h3>
                         <ul className="space-y-2">
                            {course.resources.map(res => (
                                <li key={res.name}>
                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{res.name}</a>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentModal({ course, onPaymentSuccess, setShow }) {
    const [processing, setProcessing] = useState(false);

    const handlePayment = () => {
        setProcessing(true);
        setTimeout(() => {
            onPaymentSuccess();
            setShow(false);
        }, 2000);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-4">Confirm Enrollment</h2>
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="font-semibold text-lg">{course.title}</p>
                    <p className="text-right font-bold text-xl text-blue-600">KES {course.price.toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">This is a simulated payment for demonstration.</p>
                <div className="flex justify-between items-center space-x-4">
                     <button onClick={() => setShow(false)} disabled={processing} className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400">Cancel</button>
                    <button onClick={handlePayment} disabled={processing} className="w-1/2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300">
                        {processing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Footer() {
  return (
    <footer className="bg-white mt-12 py-6 border-t">
      <div className="container mx-auto text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} FutureTech Academy. All Rights Reserved.</p>
        <p className="text-sm">Based in Meru, Kenya.</p>
      </div>
    </footer>
  );
}