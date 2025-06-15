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
const INSTRUCTOR_ID = 'instructor01';

const COURSES_DATA = [
    { id: 'C101', title: 'Computer Basics', duration: '4 weeks', price: 4000, description: 'Introduction to computers, internet browsing, email etiquette, and online safety.', modules: ['Intro to Hardware', 'Using an OS', 'Internet & Email', 'Online Safety'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Intro_slides.ppt', url: '#'}], icon: 'Computer' },
    { id: 'C102', title: 'Microsoft Office Suite', duration: '6 weeks', price: 6000, description: 'In-depth training on Word, Excel, and PowerPoint for productivity.', modules: ['MS Word Basics', 'Advanced Word', 'Excel Formulas', 'PowerPoint Design'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Excel_Templates.xlsx', url: '#'}], icon: 'Clipboard' },
    { id: 'C103', title: 'Introduction to Digital Marketing', duration: '8 weeks', price: 8000, description: 'Fundamentals of social media marketing, SEO, and content creation.', modules: ['Marketing Fundamentals', 'Intro to SEO', 'Content Strategy', 'Social Media for Business'], instructorId: INSTRUCTOR_ID, resources: [{name: 'Syllabus.pdf', url: '#'}, {name: 'Marketing_Plan.docx', url: '#'}], icon: 'TrendingUp' },
];

const INSTRUCTOR_DATA = {
    name: "Alexander Kinoti",
    uid: INSTRUCTOR_ID,
    email: 'instructor@academy.com',
    role: 'instructor',
    bio: "With a Bachelor's degree in Technology Education (Computer Science) and experience as an ICT Lecturer, Alexander brings a wealth of knowledge in web development, networking, and digital marketing.",
    avatar: "https://placehold.co/100x100/1E40AF/FFFFFF?text=AK" // Blue background, white text
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Icons ---
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const ComputerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;

const getCourseIcon = (iconName) => {
    switch (iconName) {
        case 'Computer': return <ComputerIcon />;
        case 'Clipboard': return <ClipboardIcon />;
        case 'TrendingUp': return <TrendingUpIcon />;
        default: return <BookOpenIcon />;
    }
};


// --- Helper function to pre-populate data ---
const setupInitialData = async () => {
    const appId = getAppId();
    const batch = writeBatch(db);
    COURSES_DATA.forEach(course => {
        const courseRef = doc(db, `/artifacts/${appId}/public/data/courses`, course.id);
        batch.set(courseRef, course);
    });
    try {
        await batch.commit();
        console.log("Initial public course data successfully added to Firestore.");
    } catch (error) {
        console.error("Error setting up initial public data: ", error);
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
                const setupFlagRef = doc(db, `/artifacts/${appId}/public/data/system`, 'setupComplete');
                try {
                    const setupSnap = await getDoc(setupFlagRef);
                    if (!setupSnap.exists()) {
                        await setupInitialData();
                        await setDoc(setupFlagRef, { initialized: true });
                    }
                } catch (e) {
                    console.error("Error during initial setup:", e);
                }

                if (firebaseUser.isAnonymous) {
                    setUserData({ uid: firebaseUser.uid, role: 'guest', enrolledCourses: [] });
                } else {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setUserData(userSnap.data());
                    } else {
                        const newUserProfile = {
                            uid: firebaseUser.uid, email: firebaseUser.email, role: 'student', enrolledCourses: [], progress: {}
                        };
                        await setDoc(userRef, newUserProfile);
                        setUserData(newUserProfile);
                    }
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
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { // eslint-disable-next-line no-undef
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
        return <div className="flex items-center justify-center h-screen bg-slate-100"><div className="text-xl font-semibold text-slate-700">Loading FutureTech Academy...</div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header user={user} userData={userData} navigate={navigate} />
            <main>
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
}

// --- Components ---

function Header({ user, userData, navigate }) {
    const handleLogout = () => {
        auth.signOut().then(() => navigate('home'));
    };

    return (
        <header className="bg-slate-900 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(userData?.role === 'instructor' ? 'dashboard' : 'home')}>
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <BookOpenIcon />
                    </div>
                    <span className="text-2xl font-bold text-white">FutureTech Academy</span>
                </div>
                <div className="flex items-center space-x-4">
                    {user && !user.isAnonymous ? (
                        <>
                            <span className="font-semibold text-slate-300 hidden sm:block">{userData?.email}</span>
                            <button onClick={handleLogout} className="flex items-center text-slate-300 hover:text-white font-medium transition-colors">
                                <LogoutIcon />
                                <span className="ml-2 hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('login')} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform hover:scale-105 shadow-sm">
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const appId = getAppId();
                const userRef = doc(db, `/artifacts/${appId}/users/${userCredential.user.uid}/profile`, 'data');
                const newUserProfile = {
                    uid: userCredential.user.uid, email, role: 'student', enrolledCourses: [], progress: {}
                };
                await setDoc(userRef, newUserProfile);
            }
            setPage('dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    return (
         <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">{isLogin ? 'Sign in to your account' : 'Create a new account'}</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center">{error}</p>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input id="email-address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                        </div>
                        <div>
                            <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors">
                            {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500">
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CourseCatalog({ navigate }) {
    return (
        <div className="bg-slate-900">
            <div className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                    Grow Your Skills, <br />Build Your <span className="text-blue-500">Future</span>
                </h1>
                <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto">
                    FutureTech Academy offers expert-led courses in technology and digital marketing to help you achieve your career goals.
                </p>
                <div className="mt-10">
                    <button onClick={() => {}} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg">
                        Explore Our Courses
                    </button>
                </div>
            </div>
            <div className="container mx-auto px-6 pb-24">
                <h2 className="text-4xl font-bold text-center text-white mb-12">Our Core Programs</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {COURSES_DATA.map(course => (
                        <div key={course.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col border border-slate-700">
                            <div className="p-8 flex-grow">
                                <div className="text-blue-500 mb-5">{getCourseIcon(course.icon)}</div>
                                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-500 transition-colors">{course.title}</h3>
                                <p className="mt-3 text-slate-400">{course.description}</p>
                            </div>
                            <div className="p-6 bg-slate-900 border-t border-slate-700 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-blue-500">KES {course.price.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-slate-300 bg-slate-700 px-3 py-1 rounded-full">{course.duration}</span>
                                </div>
                                <button onClick={() => navigate('course', course.id)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-lg">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InstructorProfile({ instructor }) {
    if (!instructor) return null;
    return (
        <div className="mt-12 bg-slate-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Meet Your Instructor</h3>
            <div className="flex items-center space-x-6">
                <img src={instructor.avatar} alt={instructor.name} className="w-24 h-24 rounded-full flex-shrink-0 border-4 border-white shadow-md" />
                <div>
                    <h4 className="font-bold text-2xl text-slate-900">{instructor.name}</h4>
                    <p className="mt-2 text-slate-600">{instructor.bio}</p>
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

    if (!course) return <div className="text-center p-8">Course not found.</div>;

    return (
         <div className="container mx-auto py-10 px-6">
            <button onClick={() => navigate('home')} className="flex items-center text-blue-600 font-semibold mb-8 hover:underline">
                <ArrowLeftIcon /><span className="ml-2">Back to All Courses</span>
            </button>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                 <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">{course.title}</h1>
                        <p className="mt-6 text-lg text-slate-600">{course.description}</p>
                        <div className="mt-10">
                            <h3 className="text-3xl font-bold mb-6">What You'll Learn</h3>
                            <ul className="space-y-4">
                                {course.modules.map((mod, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="flex-shrink-0 w-7 h-7 mt-1 rounded-full flex items-center justify-center mr-4 text-white font-bold bg-blue-500">✓</span>
                                        <span className="text-slate-700 text-lg">{mod}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <InstructorProfile instructor={instructor} />
                    </div>
                     <div className="lg:col-span-1">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sticky top-28">
                            <div className="text-4xl font-bold text-center text-blue-600 mb-2">KES {course.price.toLocaleString()}</div>
                            <p className="text-center text-slate-500 mb-6">One-time payment</p>
                            {isEnrolled ? (
                                 <button onClick={() => navigate('learn', course.id)} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg">Go to Classroom</button>
                            ) : (
                                <button onClick={handleEnroll} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">Enroll Now</button>
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
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-4xl font-bold mb-2 text-slate-900">My Learning Dashboard</h1>
            <p className="text-slate-600 text-lg mb-10">Welcome back! Pick up where you left off.</p>
            {enrolledCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {enrolledCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between transform hover:-translate-y-1 transition-transform">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{course.title}</h3>
                                <p className="mt-3 text-slate-500">You are enrolled in this course.</p>
                            </div>
                            <button onClick={() => navigate('learn', course.id)} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                                Open Course
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-100">
                    <h2 className="text-2xl font-semibold text-slate-700">You're Not Enrolled in Any Courses</h2>
                    <p className="mt-2 text-slate-500">Explore our catalog to start learning.</p>
                    <button onClick={() => navigate('home')} className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform hover:scale-105 shadow-sm">
                        Browse Courses
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
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Instructor Dashboard</h1>
            <p className="text-slate-600 text-lg mb-10">Welcome, {instructorData.name}. Manage your academy.</p>
            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                     <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4 flex items-center text-slate-800"><BookOpenIcon className="mr-3"/> My Courses</h2>
                        <div className="space-y-4">
                            {assignedCourses.map(course => (
                                <div key={course.id} className="bg-slate-100 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-slate-800">{course.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-lg min-h-[300px]">
                        <h2 className="text-2xl font-bold mb-4 flex items-center text-slate-800"><UsersIcon className="mr-3" />Enrolled Students</h2>
                        {loading ? <p className="text-slate-500">Loading students...</p> : (
                            <div className="divide-y divide-slate-200">
                                {students.filter(s => s.enrolledCourses?.length > 0).length > 0 ? students.filter(s => s.enrolledCourses?.length > 0).map(student => (
                                    <div key={student.uid} className="py-3">
                                        <p className="font-semibold text-slate-700">{student.email}</p>
                                        <p className="text-sm text-slate-500">Courses: {student.enrolledCourses.map(cId => COURSES_DATA.find(c=>c.id === cId)?.title || cId).join(', ')}</p>
                                    </div>
                                )) : <p className="text-slate-500">No students have enrolled yet.</p>}
                            </div>
                        )}
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
            await updateDoc(userRef, { [`progress.${courseId}`]: newProgress });
            setUserData(prev => ({...prev, progress: {...prev.progress, [courseId]: newProgress}}));
        } catch (error) {
            console.error("Failed to update progress: ", error);
        }
    };
    
    if(!course) return <div className="text-center p-8">Course not found.</div>;
    const completionPercentage = course.modules.length > 0 ? Math.round((progress.length / course.modules.length) * 100) : 0;

    return(
        <div className="container mx-auto py-10 px-6">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{course.title}</h1>
            <p className="text-slate-600 text-xl mb-8">Classroom</p>

            <div className="mb-10 bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">Your Progress</span>
                    <span className="font-bold text-blue-600">{completionPercentage}% Complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="bg-black rounded-xl aspect-video flex items-center justify-center text-white mb-6 shadow-2xl">
                       <VideoIcon className="w-20 h-20 text-slate-700"/>
                       <p className="absolute text-lg font-semibold">Main Video Content</p>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Modules</h2>
                     <ul className="space-y-4 mt-6">
                        {course.modules.map((mod, index) => {
                            const isCompleted = progress.includes(mod);
                            return (
                                <li key={index} className="flex items-center p-5 bg-white rounded-xl shadow-sm transition-all hover:shadow-md">
                                    <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => toggleModuleCompletion(mod)}
                                        className="h-6 w-6 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                    />
                                    <span className={`ml-4 text-lg font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{mod}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28">
                         <h3 className="text-2xl font-bold mb-4 flex items-center text-slate-800"><FileTextIcon className="mr-3"/>Resources</h3>
                         <ul className="space-y-3">
                            {course.resources.map(res => (
                                <li key={res.name}>
                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">{res.name}</a>
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
        }, 1500);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in zoom-in-75">
                <h2 className="text-3xl font-bold text-center mb-2 text-slate-900">Confirm Enrollment</h2>
                <p className="text-center text-slate-500 mb-6">You're one step away from starting your course.</p>
                <div className="bg-slate-100 p-5 rounded-lg mb-6">
                    <p className="font-semibold text-lg text-slate-800">{course.title}</p>
                    <p className="text-right font-bold text-2xl text-blue-600">KES {course.price.toLocaleString()}</p>
                </div>
                <p className="text-xs text-slate-500 mb-6 text-center">This is a simulated payment for demonstration purposes. No real transaction will occur.</p>
                <div className="flex justify-between items-center space-x-4">
                     <button onClick={() => setShow(false)} disabled={processing} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                    <button onClick={handlePayment} disabled={processing} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                        {processing ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-10">
            <div className="container mx-auto text-center">
                <p className="font-bold text-white text-lg">FutureTech Academy</p>
                <p className="mt-2">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
                <p className="text-sm mt-1">Based in Meru, Kenya.</p>
            </div>
        </footer>
    );
}
