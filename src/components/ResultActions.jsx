import "./ResultActions.css";


function ResultActions({ result, birthday }) {


const getText = () => {

return `
🎂 AgeVerse Result

Age:
${result.years} Years,
${result.months} Months,
${result.days} Days

📊 Total Time:

${result.totalMonths} Months
${result.totalWeeks} Weeks
${result.totalDays} Days
${result.totalHours} Hours
${result.totalMinutes} Minutes
${result.totalSeconds} Seconds

📅 Born On:
${result.birthDay}


🎂 Next Birthday:
${birthday?.days || ""} Days Remaining

`;

};



const copyResult = async()=>{

await navigator.clipboard.writeText(getText());

alert("Result Copied Successfully!");

};



const shareResult = async()=>{


if(navigator.share){

await navigator.share({

title:"AgeVerse Result",

text:getText()

});

}

else{

copyResult();

}

};



return(

<div className="result-actions">


<button onClick={copyResult}>
📋 Copy Result
</button>


<button onClick={shareResult}>
📤 Share Result
</button>


</div>

)

}


export default ResultActions;