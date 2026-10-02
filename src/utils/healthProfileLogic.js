export function calculateHealthProfile({

name = "",

gender = "",

age,

height,

weight,

activity = "Moderately Active",

diet = "Vegetarian",

goal = "Maintain Weight"

}) {


const heightMeter = height / 100;


// BMI Calculation

const bmi =
weight / (heightMeter * heightMeter);



let bmiStatus = "";

let bmiScore = 0;



if(bmi < 15){

bmiStatus = "Extremely Underweight";

bmiScore = 10;

}

else if(bmi < 16){

bmiStatus = "Severe Underweight";

bmiScore = 25;

}

else if(bmi < 18.5){

bmiStatus = "Underweight";

bmiScore = 55;

}

else if(bmi < 25){

bmiStatus = "Healthy";

bmiScore = 100;

}

else if(bmi < 30){

bmiStatus = "Overweight";

bmiScore = 70;

}

else if(bmi < 35){

bmiStatus = "Obesity Class I";

bmiScore = 50;

}

else if(bmi < 40){

bmiStatus = "Obesity Class II";

bmiScore = 35;

}

else{

bmiStatus = "Obesity Class III";

bmiScore = 20;

}





// BMR Calculation


let bmr;



if(gender === "Female"){


bmr =

(10 * weight) +

(6.25 * height) -

(5 * age) -

161;


}

else{


bmr =

(10 * weight) +

(6.25 * height) -

(5 * age) +

5;


}






// Activity Calories


const activityMultiplier = {


"Sedentary":1.2,

"Lightly Active":1.375,

"Moderately Active":1.55,

"Very Active":1.725,

"Extra Active":1.9


};



const calories = Math.round(

bmr *

(activityMultiplier[activity] || 1.55)

);







// Water Intake


const water =

Number(

(weight * 0.035)

.toFixed(1)

);






// Ideal Weight


const idealMin =

Math.round(

18.5 *

(heightMeter * heightMeter)

);



const idealMax =

Math.round(

24.9 *

(heightMeter * heightMeter)

);







// Nutrition Requirement


const protein =

Math.round(

weight * 1.6

);



const fat =

Math.round(

weight * 0.8

);



const carbs =

Math.max(

0,

Math.round(

(calories - ((protein*4)+(fat*9))) / 4

)

);
// Activity Score

const activityScore = {


"Sedentary":50,

"Lightly Active":70,

"Moderately Active":85,

"Very Active":95,

"Extra Active":100


};





// Diet Score


let dietScore = 75;


if(diet === "Vegetarian"){

dietScore = 80;

}

else if(diet === "Non Vegetarian"){

dietScore = 85;

}

else if(diet === "Vegan"){

dietScore = 82;

}







// Age Factor


let ageScore = 90;


if(age > 60){

ageScore = 75;

}

else if(age > 45){

ageScore = 82;

}

else if(age < 25){

ageScore = 95;

}







// Goal Score


let goalScore = 75;



if(

goal === "Lose Weight" && bmi >=25

){

goalScore = 95;

}


else if(

goal === "Gain Weight" && bmi <18.5

){

goalScore = 95;

}


else if(

goal === "Maintain Weight" &&

bmi >=18.5 &&

bmi <25

){

goalScore = 100;

}








// Final Health Score


let healthScore = Math.round(


(bmiScore * 0.50) +

((activityScore[activity] || 70) * 0.20) +

(goalScore * 0.15) +

(ageScore * 0.10) +

(dietScore * 0.05)


);




// Extra protection for extreme BMI


if(bmi < 15){

healthScore = Math.min(
healthScore,
25
);

}


if(bmi > 45){

healthScore = Math.min(
healthScore,
35
);

}






// Wellness Status


let wellnessStatus = "";

let wellnessIcon = "";

let wellnessMessage = "";



if(healthScore >=90){


wellnessStatus = "Excellent";

wellnessIcon = "🟢";

wellnessMessage =

"Keep maintaining your healthy lifestyle!";


}

else if(healthScore >=75){


wellnessStatus = "Good";

wellnessIcon = "🟢";

wellnessMessage =

"Great progress! Keep improving every day.";


}

else if(healthScore >=60){


wellnessStatus = "Fair";

wellnessIcon = "🟡";

wellnessMessage =

"Small healthy changes can improve your wellness.";


}

else{


wellnessStatus = "Needs Improvement";

wellnessIcon = "🔴";

wellnessMessage =

"Focus on balanced diet, activity and healthy habits.";


}








// Today's Challenge


let challenge = [];



if(bmi <18.5){


challenge = [

"🥩 Increase protein intake",

"🥛 Add healthy calorie sources",

"💪 Include strength exercises"


];


}

else if(bmi >=25){


challenge = [

"🚶 Walk 8000-10000 steps",

"💧 Maintain hydration",

"🥗 Choose balanced meals"


];


}

else{


challenge = [

"💧 Drink enough water",

"🚶 Stay physically active",

"😴 Sleep 7-8 hours"


];


}







// Food Suggestions


let foods = [];



if(diet === "Non Vegetarian"){


foods=[

"🥚 Eggs",

"🍗 Chicken",

"🐟 Fish",

"🥗 Vegetables"


];


}

else if(diet === "Vegan"){


foods=[

"🌱 Plant Protein",

"🥜 Nuts & Seeds",

"🥗 Vegetables",

"🍎 Fruits"


];


}

else{


foods=[

"🥗 Dal & Vegetables",

"🍚 Balanced Meals",

"🥛 Milk / Curd",

"🥜 Nuts"


];


}







// Health Tips


let tips=[


"Maintain a balanced diet",

"Stay physically active",

"Drink enough water",

"Sleep 7-8 hours daily"


];







// Body Age


let bodyAge = Number(age);



if(healthScore >=90){

bodyAge = Math.max(age-5,18);

}

else if(healthScore <60){

bodyAge = age+5;

}







return {


name,

gender,

age,

height,

weight,

activity,

diet,

goal,


bmi:Number(bmi.toFixed(1)),

bmiStatus,


bmr:Math.round(bmr),

calories,

water,


idealWeight:

`${idealMin} - ${idealMax} kg`,



protein,

carbs,

fat,


healthScore,


wellnessStatus,

wellnessIcon,

wellnessMessage,


challenge,

foods,

tips,


bodyAge


};


}