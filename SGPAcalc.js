export async function sgpaCalc(result, providedSemester) {
    const gradeToMarks = {
        "A++": 10.0,
        "A+": 9.0,
        "A": 8.5,
        "B+": 8.0,
        "B": 7.5,
        "C+": 7.0,
        "C": 6.5,
        "D+": 6.0,
        "D": 5.5,
        "E+": 5.0,
        "E": 4.0,
        "F": 0.0
    }

    const semesters = {
        "1-2": {
            "Engineering Mathematics-I": 4.0,
            "Engineering Chemistry": 4.0,
            "Human Values": 2.0,
            "Programming for Problem Solving": 2.0,
            "Basic Civil Engineering": 2.0,
            "Engineering Chemistry Lab": 1.0,
            "Human Values Activities": 1.0,
            "Computer Programming Lab": 1.5,
            "Basic Civil Engineering Lab": 1.0,
            "Computer Aided Engineering Graphics": 1.5,
            "Engineering Mathematics-II": 4.0,
            "Engineering Physics": 4.0,
            "Communication Skills": 2.0,
            "Basic Mechanical Engineering": 2.0,
            "Basic Electrical Engineering": 2.0,
            "Engineering Physics Lab": 1.0,
            "Language Lab": 1.0,
            "Manufacturing Practices Workshop": 1.5,
            "Basic Electrical Engineering Lab": 1.0,
            "Computer Aided Machine Drawing": 1.5,
            "Sports I": 0.5
        },
        3: {
            "Advanced Engineering Mathematics": 3,
            "Managerial Economics & Financial Accounting": 2,
            "Digital Electronics": 3,
            "Data Structures and Algorithms": 3,
            "Object Oriented Programming": 3,
            "Software Engineering": 3,
            "Data Structures & Algorithms Lab": 1.5,
            "Object Oriented Programming Lab": 1.5,
            "Software Engineering Lab": 1.5,
            "Digital Electronics Lab": 1.5,
            "Industrial Training": 1,
            "Business Communication & Presentation Skills": 0.5,
        },
        4: {
            "Discrete Mathematics Structure": 3,
            "Technical Communication": 2,
            "Microprocessor & Interfaces": 3,
            "Database Management System": 3,
            "Theory of Computation": 3,
            "Data Communication and Computer Networks": 3,
            "Microprocessor & Interfaces Lab": 1,
            "Database Management System Lab": 1.5,
            "Network Programming Lab": 1.5,
            "Linux Shell Programming Lab": 1,
            "Java Lab": 1,
            "Social Outreach, Discipline & Extracurricular Activities": 0.5,
        },
        5: {
            "Information Theory & Coding": 2,
            "Compiler Design": 3,
            "Operating System": 3,
            "Computer Graphics & Multimedia": 3,
            "Analysis of Algorithms": 3,
            "Human-Computer Interaction": 2,
            "Computer Graphics & Multimedia Lab": 1,
            "Compiler Design Lab": 1,
            "Analysis of Algorithms Lab": 1,
            "Advance Java Lab": 1,
            "Industrial Training": 2.5,
            "Social Outreach, Discipline & Extracurricular Activities": 0.5,
        },
        6: {
            "Digital Image Processing": 2,
            "Machine Learning": 3,
            "Information Security Systems": 2,
            "Computer Architecture and Organization": 3,
            "Artificial Intelligence": 2,
            "Cloud Computing": 3,
            "Distributed Systems": 2,
            "Digital Image Processing Lab": 1.5,
            "Machine Learning Lab": 1.5,
            "Python Lab": 1.5,
            "Mobile App Development Lab": 1.5,
            "Social Outreach, Discipline & Extracurricular Activities": 0.5,
        },
        7: {
            "Environmental Engineering & Disaster Management": 3,
            "Internet Of Things": 3,
            "Internet Of Things Lab": 2,
            "Cyber Security Lab": 2,
            "Industrial Training": 2.5,
            "Seminar": 2,
            "Social Outreach, Discipline & Extracurricular Activities": 0.5,
        },
        8: {
            "Big Data Analytics": 3,
            "Big Data Analytics Lab": 2,
            "Software Testing & Validation Lab": 1,
            "Project": 7,
            "Social Outreach, Discipline & Extracurricular Activities": 0.5,
            "Disaster Management": 3
        }
    };

    // Auto-detect semester if not provided
    let semester = providedSemester;
    if (!semester) {
        const extractedSubjects = Object.keys(result).map(s => s.toLowerCase());
        
        // Detection rules based on unique subjects (prioritize exact matches)
        if (extractedSubjects.some(s => s.includes('managerial economics') || s.includes('data structures'))) {
            semester = 3;
        } else if (extractedSubjects.some(s => s.includes('engineering mathematics-i') || s.includes('engineering chemistry') || s.includes('engineering mathematics-ii') || s.includes('engineering physics'))) {
            semester = "1-2";
        } else if (extractedSubjects.some(s => s.includes('discrete mathematics') || s.includes('database management'))) {
            semester = 4;
        } else if (extractedSubjects.some(s => s.includes('compiler design') || s.includes('operating system'))) {
            semester = 5;
        } else if (extractedSubjects.some(s => s.includes('machine learning') || s.includes('cloud computing'))) {
            semester = 6;
        } else if (extractedSubjects.some(s => s.includes('internet of things') || s.includes('seminar'))) {
            semester = 7;
        } else if (extractedSubjects.some(s => s.includes('big data analytics') || s.includes('project'))) {
            semester = 8;
        } else {
            return "❌ Could not detect semester from subjects.";
        }
    }

    if (!semesters[semester]) {
        return "❌ Invalid semester detected/provided.";
    }

    const expectedSubjects = Object.keys(semesters[semester]);
    const extractedSubjects = Object.keys(result);

    // Skip validation for semesters 1-2
    if (semester !== "1-2") {
        // Normalize for comparison (case-insensitive, trim & normalize common variations like "and" vs "&")
        const normalizeSubject = (s) => s.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, ' ').trim();
        const expectedSet = new Set(expectedSubjects.map(normalizeSubject));
        const extractedSet = new Set(extractedSubjects.map(normalizeSubject));

        // Check if extracted matches expected (allow for minor variations; require all expected subjects present)
        const missingSubjects = [...expectedSet].filter(s => ![...extractedSet].some(es => es.includes(s.split(' ').slice(-2).join(' ')) || es === s));
        if (missingSubjects.length > 0) {
            return `❌ Mismatch for semester ${semester}. Missing subjects: ${missingSubjects.slice(0, 3).join(', ')}${missingSubjects.length > 3 ? '...' : ''}. Please check PDF.`;
        }
    }

    const subjToCredits = semesters[semester];

    const gradeArray = Object.entries(result).map(([subject, grade]) => ({ subject, grade }));

    let sumOfProduct = 0;
    let sumofCP = 0;

    gradeArray.forEach((e) => {
        let CP = subjToCredits[e.subject] || 0;
        let GI = gradeToMarks[e.grade] || 0;
        const product = GI * CP;
        sumofCP += parseFloat(CP);
        sumOfProduct += parseFloat(product);
    });

    if (sumofCP === 0) {
        return "❌ Unable to calculate SGPA (no credits found).";
    }

    const finalCal = (sumOfProduct / sumofCP).toFixed(2);
    return `Detected/Selected Semester: ${semester}\nYour SGPA is ${finalCal}`;
}