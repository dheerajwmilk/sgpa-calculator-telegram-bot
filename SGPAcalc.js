export async function sgpaCalc(result) {
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

    const subjToCredits = {
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
        "Sports I": 0.5,

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

    }


    const gradeArray = Object.entries(result).map(([subject, grade]) => {
        return { subject, grade };
    });
    // console.log(gradeArray)
    let CP = 0;
    let GI = 0;
    let ProductofCPandGI;
    let sumOfProduct = 0;
    let sumofCP = 0;

    const points = gradeArray.map((e) => {
        if (subjToCredits[e.subject] !== undefined) {
            CP = subjToCredits[e.subject]
        }
        if (gradeToMarks[e.grade] !== undefined) {
            // console.log(e.subject)
            GI = gradeToMarks[e.grade]
        }
        ProductofCPandGI = GI * CP;
        sumofCP += parseFloat(CP);
        // console.log(sumofCP)
        // console.log(ProductofCPandGI)
        sumOfProduct += parseFloat(ProductofCPandGI);
        // console.log(sumOfProduct)
        return e;
    })
    const finalCal = parseFloat(sumOfProduct / sumofCP);
    // console.log(sumOfProduct)
    // console.log(sumofCP)
    console.log(finalCal)
    return finalCal;
    // return gradeArray;
}





