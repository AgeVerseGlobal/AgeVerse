import "./StatsSection.jsx";

function StatsSection(){

const stats=[
{
number:"1M+",
title:"Age Calculations"
},
{
number:"50+",
title:"Countries"
},
{
number:"99.9%",
title:"Accuracy"
},
{
number:"23",
title:"Languages"
}
];


return(

<section className="stats-section">

<div className="stats-container">


{
stats.map((item,index)=>(

<div className="stat-card" key={index}>

<h2>
{item.number}
</h2>

<p>
{item.title}
</p>

</div>

))
}


</div>

</section>

)

}

export default StatsSection;